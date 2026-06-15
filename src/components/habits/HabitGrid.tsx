"use client"

import React, { useState } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import {
  useHabitsQuery,
  useCreateHabitMutation,
  useToggleLogMutation,
  useDeleteHabitMutation,
} from "@/hooks/useHabits"
import { format, parseISO, startOfWeek, addDays } from "date-fns"
import { Plus, Trash2, Check, Loader2, Sparkles } from "lucide-react"

// Category styling lookup
const CATEGORIES: Record<string, { color: string; bg: string; border: string }> = {
  Health: {
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  Work: {
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  Mind: {
    color: "text-purple-500 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  Finance: {
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  General: {
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
}

export function HabitGrid() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)
  const userConfig = useWorkspaceStore((state) => state.userConfig)

  // Compute active week dates
  const baseDate = parseISO(activeDate)
  const weekStart = startOfWeek(baseDate, { weekStartsOn: userConfig.startOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const startDateStr = format(weekDays[0], "yyyy-MM-dd")
  const endDateStr = format(weekDays[6], "yyyy-MM-dd")

  // React Query Hooks
  const { data, isLoading, isError } = useHabitsQuery(startDateStr, endDateStr)
  const createHabitMutation = useCreateHabitMutation()
  const toggleLogMutation = useToggleLogMutation()
  const deleteHabitMutation = useDeleteHabitMutation()

  // Form states
  const [newHabitName, setNewHabitName] = useState("")
  const [newHabitCategory, setNewHabitCategory] = useState("General")
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddHabit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!newHabitName.trim()) return

    try {
      await createHabitMutation.mutateAsync({
        name: newHabitName,
        category: newHabitCategory,
      })
      setNewHabitName("")
      setShowAddForm(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteHabit = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this habit? All check-ins will be deleted.")) return
    try {
      await deleteHabitMutation.mutateAsync(id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleLog = (habitId: string, date: string): void => {
    toggleLogMutation.mutate({ habitId, date })
  }

  // Loading indicator helper
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-card/40 backdrop-blur-md">
        <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 text-sm font-semibold text-destructive">
        Error loading habits. Please check database configuration.
      </div>
    )
  }

  const { habits: listHabits, logs } = data

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
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-1.5">
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
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="habitCategory" className="text-xs font-bold text-muted-foreground">
                Category
              </label>
              <select
                id="habitCategory"
                value={newHabitCategory}
                onChange={(e) => setNewHabitCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
              >
                {Object.keys(CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
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
        <div className="min-w-[700px] divide-y divide-border">
          {/* Header Row */}
          <div className="grid grid-cols-12 items-center bg-secondary/50 py-3 text-center text-xs font-bold text-muted-foreground">
            <div className="col-span-5 px-6 text-left">HABIT</div>
            {weekDays.map((day) => {
              const isActive = format(day, "yyyy-MM-dd") === activeDate
              return (
                <div
                  key={day.toISOString()}
                  className={`col-span-1 flex flex-col items-center justify-center gap-0.5 ${
                    isActive ? "text-sidebar-primary scale-110 font-black" : ""
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider">
                    {format(day, "EEE")}
                  </span>
                  <span className={`text-sm h-6 w-6 flex items-center justify-center rounded-full ${
                    isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : ""
                  }`}>
                    {format(day, "d")}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Body Rows */}
          {listHabits.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No habits registered yet. Add a new habit above.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {listHabits.map((habit) => {
                const catInfo = CATEGORIES[habit.category] || CATEGORIES.General
                return (
                  <div key={habit.id} className="grid grid-cols-12 items-center py-3 text-center transition-colors hover:bg-secondary/20">
                    {/* Habit Info Cell */}
                    <div className="col-span-5 flex items-center justify-between px-6 text-left">
                      <div className="space-y-1 pr-4">
                        <p className="text-sm font-semibold text-foreground leading-tight">
                          {habit.name}
                        </p>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${catInfo.bg} ${catInfo.color} border ${catInfo.border}`}>
                          {habit.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 md:opacity-20 hover:!opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                        aria-label={`Delete ${habit.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Weekly Matrix Checkboxes */}
                    {weekDays.map((day) => {
                      const dayStr = format(day, "yyyy-MM-dd")
                      const checked = isLogged(habit.id, dayStr)
                      const isPending = toggleLogMutation.isPending && 
                        toggleLogMutation.variables?.habitId === habit.id && 
                        toggleLogMutation.variables?.date === dayStr

                      return (
                        <div key={dayStr} className="col-span-1 flex items-center justify-center">
                          <button
                            onClick={() => handleToggleLog(habit.id, dayStr)}
                            disabled={isPending}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-transparent transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
                              checked
                                ? `${catInfo.bg} ${catInfo.color} ${catInfo.border.replace("border-", "border-")} border-2 !text-current`
                                : "border-border hover:border-sidebar-primary/50 dark:hover:bg-slate-800"
                            }`}
                            aria-label={`Mark ${habit.name} check-in`}
                          >
                            {isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin text-sidebar-primary" />
                            ) : checked ? (
                              <Check className="h-4 w-4 stroke-[3]" />
                            ) : null}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
