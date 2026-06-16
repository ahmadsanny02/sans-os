"use client"

import React, { useState } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import {
  useHabitsQuery,
  useCreateHabitMutation,
  useToggleLogMutation,
  useDeleteHabitMutation,
} from "@/hooks/useHabits"
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { Plus, Trash2, Check, Loader2, Sparkles } from "lucide-react"
import { confirmDestructive, showError, showSuccessToast } from "@/lib/sweetalert"

// Checked styling default theme
const CHECKED_THEME = {
  color: "text-sidebar-primary dark:text-violet-400",
  bg: "bg-sidebar-primary/10 dark:bg-violet-500/10",
  border: "border-sidebar-primary/20 dark:border-violet-500/20",
}

export function HabitGrid() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)

  // Compute active month dates
  const baseDate = parseISO(activeDate)
  const monthStart = startOfMonth(baseDate)
  const monthEnd = endOfMonth(baseDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDateStr = format(monthStart, "yyyy-MM-dd")
  const endDateStr = format(monthEnd, "yyyy-MM-dd")

  // React Query Hooks
  const { data, isLoading, isError } = useHabitsQuery(startDateStr, endDateStr)
  const createHabitMutation = useCreateHabitMutation()
  const toggleLogMutation = useToggleLogMutation()
  const deleteHabitMutation = useDeleteHabitMutation()

  // Form states
  const [newHabitName, setNewHabitName] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddHabit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!newHabitName.trim()) return

    try {
      await createHabitMutation.mutateAsync({
        name: newHabitName,
      })
      setNewHabitName("")
      setShowAddForm(false)
      showSuccessToast("Habit added successfully")
    } catch (err) {
      console.error(err)
      showError("Error", "Failed to add habit.")
    }
  }

  const handleDeleteHabit = async (id: string): Promise<void> => {
    const isConfirmed = await confirmDestructive(
      "Delete Habit",
      "Are you sure you want to delete this habit? All check-ins will be deleted."
    )
    if (!isConfirmed) return
    try {
      await deleteHabitMutation.mutateAsync(id)
      showSuccessToast("Habit deleted successfully")
    } catch (err) {
      console.error(err)
      showError("Error", "Failed to delete habit.")
    }
  }

  const handleToggleLog = (habitId: string, date: string): void => {
    toggleLogMutation.mutate({ habitId, date })
  }

  const listHabits = data?.habits || []
  const logs = data?.logs || []

  // Helper check-in check
  const isLogged = (habitId: string, dateStr: string): boolean => {
    return logs.some((l) => l.habitId === habitId && l.date === dateStr && l.status === "completed")
  }

  return (
    <div className="space-y-6">
      {/* Header and Toggle Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          Habits List
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-sidebar-primary px-3 py-1.5 text-xs font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/90 hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? "Cancel" : "Add Habit"}
        </button>
      </div>

      {/* Slide-out Add Habit Card */}
      {showAddForm ? (
        <form
          onSubmit={handleAddHabit}
          className="rounded-xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-md space-y-4 animate-in slide-in-from-top-4 duration-200"
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
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createHabitMutation.isPending}
              className="rounded-lg bg-sidebar-primary px-3 py-1.5 text-xs font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary/95 flex items-center gap-1"
            >
              {createHabitMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      ) : null}

      {/* Habits Grid Table Card */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm dark:bg-card/50">
        <table className="w-full border-collapse text-center text-sm min-w-[1200px]">
          <thead>
            <tr className="bg-secondary/50 text-xs font-bold text-muted-foreground border-b border-border uppercase tracking-wider">
              <th className="px-6 py-4 text-left font-bold text-muted-foreground w-64 select-none sticky left-0 bg-card z-10 border-r border-border">
                Habit
              </th>
              {monthDays.map((day) => {
                const isSel = format(day, "yyyy-MM-dd") === activeDate
                return (
                  <th
                    key={day.toISOString()}
                    className={`px-1 py-3 font-bold select-none min-w-[36px] ${
                      isSel ? "text-sidebar-primary bg-sidebar-primary/5 dark:bg-sidebar-primary/10 font-black" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] uppercase tracking-normal opacity-75 font-semibold">
                        {format(day, "EE").slice(0, 2)}
                      </span>
                      <span className={`text-xs h-6 w-6 flex items-center justify-center rounded-full ${
                        isSel ? "bg-sidebar-primary text-sidebar-primary-foreground font-black" : ""
                      }`}>
                        {format(day, "d")}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
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
            ) : isError || !data ? (
              <tr>
                <td colSpan={monthDays.length + 1} className="py-24 text-center text-sm text-destructive bg-card font-semibold">
                  Error loading habits. Please check database configuration.
                </td>
              </tr>
            ) : listHabits.length === 0 ? (
              <tr>
                <td colSpan={monthDays.length + 1} className="py-12 text-center text-sm text-muted-foreground bg-card">
                  No habits registered yet. Add a new habit above.
                </td>
              </tr>
            ) : (
              listHabits.map((habit) => {
                return (
                  <tr key={habit.id} className="transition-colors hover:bg-secondary/10 group">
                    {/* Habit Info Cell (Sticky left) */}
                    <td className="px-6 py-3 text-left w-64 sticky left-0 bg-card/95 backdrop-blur-sm z-10 border-r border-border select-none">
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
                      const isPending = toggleLogMutation.isPending && 
                        toggleLogMutation.variables?.habitId === habit.id && 
                        toggleLogMutation.variables?.date === dayStr
                      const isSelColumn = dayStr === activeDate

                      return (
                        <td
                          key={dayStr}
                          className={`px-1 py-3 text-center ${
                            isSelColumn ? "bg-sidebar-primary/5 dark:bg-sidebar-primary/10" : ""
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleToggleLog(habit.id, dayStr)}
                              disabled={isPending}
                              className={`flex h-7 w-7 items-center justify-center rounded-lg border text-transparent transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
                                checked
                                  ? `${CHECKED_THEME.bg} ${CHECKED_THEME.color} ${CHECKED_THEME.border} border-2 !text-current`
                                  : "border-border hover:border-sidebar-primary/50 dark:hover:bg-slate-800"
                              }`}
                              aria-label={`Mark ${habit.name} check-in`}
                            >
                              {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin text-sidebar-primary" />
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
