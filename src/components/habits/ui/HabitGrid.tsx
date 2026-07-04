"use client"

import React from "react"
import { Habit } from "@/hooks/useHabits"
import { format } from "date-fns"
import { Plus, Trash2, Check, Loader2, Sparkles } from "lucide-react"

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
        <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Habits List
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? "Cancel" : "Add Habit"}
        </button>
      </div>

      {/* Slide-out Add Habit Card */}
      {showAddForm ? (
        <form
          onSubmit={handleAddHabit}
          className="bento-card p-4 space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="space-y-1.5">
            <label htmlFor="habitName" className="text-xs font-bold text-muted-foreground">
              Habit Name
            </label>
            <input
              id="habitName"
              type="text"
              required
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="e.g. Workout, Read books 15 mins..."
              className="w-full rounded-lg border border-border/60 bg-background px-3.5 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-border/40 px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPendingCreate}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 flex items-center gap-1"
            >
              {isPendingCreate ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      ) : null}

      {/* Habits Grid Table Card */}
      <div className="overflow-x-auto bento-card">
        <table className="w-full border-collapse text-center text-sm min-w-[1200px]">
          <thead>
            <tr className="bg-secondary/50 text-xs font-bold text-muted-foreground border-b border-border/60 uppercase tracking-wider">
              <th className="px-6 py-4 text-left font-bold text-muted-foreground w-64 select-none sticky left-0 bg-card/95 backdrop-blur-md z-10 border-r border-border/60">
                Habit
              </th>
              {monthDays.map((day) => {
                const isSel = format(day, "yyyy-MM-dd") === activeDate
                return (
                  <th
                    key={day.toISOString()}
                    className={`px-1 py-3 font-bold select-none min-w-[36px] ${
                      isSel ? "text-primary bg-primary/5 font-black" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] uppercase tracking-normal opacity-75 font-semibold">
                        {format(day, "EE").slice(0, 2)}
                      </span>
                      <span className={`text-xs h-6 w-6 flex items-center justify-center rounded-full ${
                        isSel ? "bg-primary text-primary-foreground font-black shadow-glow" : ""
                      }`}>
                        {format(day, "d")}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
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
                <td colSpan={monthDays.length + 1} className="py-24 text-center text-sm text-destructive bg-card/50 font-semibold">
                  Error loading habits. Please check database configuration.
                </td>
              </tr>
            ) : listHabits.length === 0 ? (
              <tr>
                <td colSpan={monthDays.length + 1} className="py-12 text-center text-sm text-muted-foreground bg-card/50">
                  No habits registered yet. Add a new habit above.
                </td>
              </tr>
            ) : (
              listHabits.map((habit) => {
                return (
                  <tr key={habit.id} className="transition-colors hover:bg-secondary/15 group">
                    {/* Habit Info Cell (Sticky left) */}
                    <td className="px-6 py-3 text-left w-64 sticky left-0 bg-card/95 backdrop-blur-md z-10 border-r border-border/60 select-none">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 pr-2 min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight truncate">
                            {habit.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
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
                          className={`px-1 py-3 text-center ${
                            isSelColumn ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleToggleLog(habit.id, dayStr)}
                              disabled={isPending}
                              className={`flex h-7 w-7 items-center justify-center rounded-lg border text-transparent transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
                                checked
                                  ? `${CHECKED_THEME.bg} ${CHECKED_THEME.color} ${CHECKED_THEME.border} border-2 !text-current`
                                  : "border-border/60 hover:border-primary/50 dark:hover:bg-slate-800"
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
