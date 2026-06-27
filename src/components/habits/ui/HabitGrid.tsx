"use client"

import React from "react"
import { Habit } from "@/hooks/useHabits"
import { format, parseISO, subDays } from "date-fns"
import { Plus, Trash2, Check, Loader2, Sparkles, Flame, CheckCircle } from "lucide-react"

const CHECKED_THEME = {
  color: "text-primary",
  bg: "bg-primary/10",
  border: "border-primary/20",
}

interface HabitGridProps {
  activeDate: string
  monthDays: Date[]
  isLoadingHabits: boolean
  isErrorHabits: boolean
  listHabits: Habit[]
  isLogged: (habitId: string, dateStr: string) => boolean
  newHabitName: string
  setNewHabitName: (name: string) => void
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  handleAddHabit: (e: React.FormEvent) => Promise<void>
  handleDeleteHabit: (id: string) => Promise<void>
  handleToggleLog: (habitId: string, date: string) => void
  isPendingToggle: boolean
  toggleLogVariables: { habitId: string; date: string; status?: string } | undefined
  isPendingCreate: boolean
}

export function HabitGrid({
  activeDate,
  monthDays,
  isLoadingHabits,
  isErrorHabits,
  listHabits,
  isLogged,
  newHabitName,
  setNewHabitName,
  showAddForm,
  setShowAddForm,
  handleAddHabit,
  handleDeleteHabit,
  handleToggleLog,
  isPendingToggle,
  toggleLogVariables,
  isPendingCreate,
}: HabitGridProps) {
  return (
    <div className="space-y-6">
      {/* Header and Toggle Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Habits List
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? "Cancel" : "Add Habit"}
        </button>
      </div>

      {/* Slide-out Add Habit Card */}
      {showAddForm ? (
        <form
          onSubmit={handleAddHabit}
          className="rounded-2xl border border-white/5 bg-zinc-900/10 dark:bg-black/20 p-5 shadow-lg backdrop-blur-md space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="space-y-1.5">
            <label htmlFor="habitName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
              Habit Name
            </label>
            <input
              id="habitName"
              type="text"
              required
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="e.g. Workout, Read books 15 mins..."
              className="w-full rounded-lg border border-white/5 bg-background px-3.5 py-2 text-sm outline-none transition-all focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-white/5 px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPendingCreate}
              className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 flex items-center gap-1"
            >
              {isPendingCreate ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Create Habit"
              )}
            </button>
          </div>
        </form>
      ) : null}

      {/* Mobile Card Layout (block md:hidden) */}
      <div className="block md:hidden space-y-4">
        {isLoadingHabits ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="glass-card glow-border rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="h-4 w-32 bg-muted/20 rounded-md" />
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 bg-muted/20 rounded-lg" />
                <div className="flex gap-1">
                  {Array.from({ length: 7 }).map((_, dIdx) => (
                    <div key={dIdx} className="h-6 w-6 bg-muted/20 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : isErrorHabits ? (
          <div className="glass-card rounded-2xl p-8 text-center text-xs text-destructive font-semibold">
            Error loading habits. Please check database configuration.
          </div>
        ) : listHabits.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-xs text-muted-foreground">
            No habits registered yet. Add a new habit above.
          </div>
        ) : (
          listHabits.map((habit) => {
            const activeChecked = isLogged(habit.id, activeDate)
            const activeIsPending = isPendingToggle && 
              toggleLogVariables?.habitId === habit.id && 
              toggleLogVariables?.date === activeDate

            // Get 7 days leading up to active date
            const recentDays = (() => {
              const activeIdx = monthDays.findIndex(d => format(d, "yyyy-MM-dd") === activeDate)
              if (activeIdx === -1) return monthDays.slice(0, 7)
              const start = Math.max(0, activeIdx - 6)
              return monthDays.slice(start, activeIdx + 1)
            })()

            // Calculate streak count (consecutive completed days backwards from active date)
            const getStreak = () => {
              let streak = 0
              let currentDay = parseISO(activeDate)
              while (streak < 365) {
                const checkStr = format(currentDay, "yyyy-MM-dd")
                if (isLogged(habit.id, checkStr)) {
                  streak++
                  currentDay = subDays(currentDay, 1)
                } else {
                  break
                }
              }
              return streak
            }
            const streakCount = getStreak()

            return (
              <div 
                key={habit.id} 
                className={`glass-card glow-border rounded-2xl p-5 space-y-4 transition-all duration-300 ${
                  activeChecked ? "bg-primary/5 border-primary/20" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">{habit.name}</h4>
                    {streakCount > 0 && (
                      <div className="inline-flex items-center gap-1 text-[9px] font-extrabold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full font-mono select-none">
                        <Flame className="h-3 w-3 fill-orange-400" />
                        <span>{streakCount} DAY STREAK</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 cursor-pointer"
                    aria-label={`Delete ${habit.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/5 pt-3.5">
                  {/* Active Date check in */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleToggleLog(habit.id, activeDate)}
                      disabled={activeIsPending}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border text-transparent transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${
                        activeChecked
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                          : "border-white/10 hover:border-primary/50 bg-white/5"
                      }`}
                      aria-label="Toggle active date completion"
                    >
                      {activeIsPending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : activeChecked ? (
                        <Check className="h-4.5 w-4.5 stroke-[3] text-white" />
                      ) : (
                        <CheckCircle className="h-4.5 w-4.5 text-muted-foreground/30" />
                      )}
                    </button>
                    <div className="text-left select-none">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                        Active Date Check-in
                      </span>
                      <span className="text-xs font-bold text-foreground font-display">
                        {format(parseISO(activeDate), "d MMM yyyy")}
                      </span>
                    </div>
                  </div>

                  {/* Sparkline Streak */}
                  <div className="space-y-1 text-left sm:text-right select-none">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                      7-Day Streak sparkline
                    </span>
                    <div className="flex gap-1.5">
                      {recentDays.map((day) => {
                        const dayStr = format(day, "yyyy-MM-dd")
                        const isDayChecked = isLogged(habit.id, dayStr)
                        const isDayPending = isPendingToggle && 
                          toggleLogVariables?.habitId === habit.id && 
                          toggleLogVariables?.date === dayStr
                        const isToday = dayStr === activeDate

                        return (
                          <button
                            key={dayStr}
                            disabled={isDayPending}
                            onClick={() => handleToggleLog(habit.id, dayStr)}
                            className={`relative h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-extrabold transition-all border font-display active:scale-95 select-none cursor-pointer ${
                              isDayChecked
                                ? "bg-primary/20 border-primary/40 text-primary"
                                : isToday
                                ? "border-primary/40 text-muted-foreground bg-white/5"
                                : "border-white/5 bg-white/5 text-muted-foreground/60"
                            }`}
                            title={`Toggle check-in for ${format(day, "d MMM")}`}
                          >
                            {isDayPending ? (
                              <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                            ) : (
                              format(day, "d")
                            )}
                            {isToday && (
                              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop Grid Layout (hidden md:block) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/5 bg-zinc-900/10 dark:bg-black/20 backdrop-blur-md shadow-lg">
        <table className="w-full border-collapse text-center text-sm min-w-[1200px]">
          <thead>
            <tr className="bg-secondary/40 text-xs font-bold text-muted-foreground border-b border-white/5 uppercase tracking-wider">
              <th className="px-6 py-4 text-left font-bold text-muted-foreground w-64 select-none sticky left-0 bg-zinc-950/80 backdrop-blur-md z-10 border-r border-white/5">
                Habit
              </th>
              {monthDays.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd")
                const isSel = dayStr === activeDate
                return (
                  <th
                    key={day.toISOString()}
                    className={`px-1 py-3 font-bold select-none min-w-[36px] transition-colors ${
                      isSel ? "text-primary bg-primary/5 dark:bg-primary/10 font-black" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] uppercase tracking-normal opacity-75 font-semibold">
                        {format(day, "EE").slice(0, 2)}
                      </span>
                      <span className={`text-xs h-6 w-6 flex items-center justify-center rounded-full transition-all ${
                        isSel ? "bg-primary text-white font-black scale-110 shadow-sm" : ""
                      }`}>
                        {format(day, "d")}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoadingHabits ? (
              Array.from({ length: 3 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  <td className="p-3 text-left">
                    <div className="h-4 w-24 bg-muted/20 rounded-md" />
                  </td>
                  {monthDays.map((_, dIdx) => (
                    <td key={dIdx} className="p-1">
                      <div className="h-6 w-6 bg-muted/20 rounded mx-auto" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isErrorHabits ? (
              <tr>
                <td colSpan={monthDays.length + 1} className="py-24 text-center text-sm text-destructive font-semibold">
                  Error loading habits. Please check database configuration.
                </td>
              </tr>
            ) : listHabits.length === 0 ? (
              <tr>
                <td colSpan={monthDays.length + 1} className="py-12 text-center text-sm text-muted-foreground">
                  No habits registered yet. Add a new habit above.
                </td>
              </tr>
            ) : (
              listHabits.map((habit) => {
                return (
                  <tr key={habit.id} className="transition-colors hover:bg-white/5 group">
                    {/* Habit Info Cell (Sticky left) */}
                    <td className="px-6 py-3 text-left w-64 sticky left-0 bg-zinc-950/80 backdrop-blur-md z-10 border-r border-white/5 select-none">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 pr-2 min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight truncate">
                            {habit.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 cursor-pointer"
                          aria-label={`Delete ${habit.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                    {/* Checkbox columns */}
                    {monthDays.map((day) => {
                      const dayStr = format(day, "yyyy-MM-dd")
                      const checked = isLogged(habit.id, dayStr)
                      const isPending = isPendingToggle && 
                        toggleLogVariables?.habitId === habit.id && 
                        toggleLogVariables?.date === dayStr
                      const isSelColumn = dayStr === activeDate

                      return (
                        <td
                          key={dayStr}
                          className={`px-1 py-3 text-center transition-colors ${
                            isSelColumn ? "bg-primary/5 dark:bg-primary/10" : ""
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleToggleLog(habit.id, dayStr)}
                              disabled={isPending}
                              className={`flex h-7 w-7 items-center justify-center rounded-lg border text-transparent transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer ${
                                checked
                                  ? `${CHECKED_THEME.bg} ${CHECKED_THEME.color} ${CHECKED_THEME.border} border-2 !text-current`
                                  : "border-white/5 hover:border-primary/50 hover:bg-white/5"
                              }`}
                              aria-label={`Mark ${habit.name} check-in`}
                            >
                              {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              ) : checked ? (
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                              ) : null}
                            </button>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
