"use client"

import React from "react"
import { DailyTodo } from "@/hooks/useDailyLogs"
import { Plus, Trash2, Check, Loader2, ListTodo, AlertCircle } from "lucide-react"

interface HabitItem {
  id: string
  name: string
  completed: boolean
  isHabit: true
}

interface DailyTodosProps {
  todos: DailyTodo[]
  isLoading: boolean
  isError: boolean
  newText: string
  setNewText: (t: string) => void
  errorMsg: string | null
  handleAddTodo: (e: React.FormEvent) => Promise<void>
  handleToggleCompleted: (id: string, completed: boolean) => void
  handleDeleteTodo: (id: string) => Promise<void>
  isPendingCreate: boolean
  habits?: HabitItem[]
  handleToggleHabit?: (id: string) => void
  isPendingToggleHabit?: boolean
}

export function DailyTodos({
  todos,
  isLoading,
  isError,
  newText,
  setNewText,
  errorMsg,
  handleAddTodo,
  handleToggleCompleted,
  handleDeleteTodo,
  isPendingCreate,
  habits = [],
  handleToggleHabit,
  isPendingToggleHabit = false,
}: DailyTodosProps) {
  const completedTodos = todos.filter((t) => t.completed).length
  const completedHabits = habits.filter((h) => h.completed).length
  const totalTodos = todos.length
  const totalHabits = habits.length
  const completedCount = completedTodos + completedHabits
  const totalCount = totalTodos + totalHabits

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-sidebar-primary" />
            Daily Checklist
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Keep track of today&apos;s tasks and routine items
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border flex items-center justify-center min-w-[50px] h-6">
          {isLoading ? (
            <span className="inline-block w-8 h-3 bg-muted/30 animate-pulse rounded" />
          ) : (
            `${completedCount}/${totalCount} Done`
          )}
        </span>
      </div>

      <form onSubmit={handleAddTodo} className="space-y-2.5">
        <div className="flex gap-2">
          <input
            type="text"
            required
            disabled={isLoading || isPendingCreate}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={isLoading ? "Loading..." : "Add new task..."}
            className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10 disabled:bg-secondary/40 disabled:placeholder-muted-foreground"
          />
          <button
            type="submit"
            disabled={isLoading || isPendingCreate || !newText.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-sidebar-primary px-4 py-2 text-sm font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/95 disabled:opacity-50"
            aria-label="Add new todo item"
          >
            {isPendingCreate ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>

        {errorMsg && (
          <p className="text-xs text-destructive flex items-center gap-1 font-semibold">
            <AlertCircle className="h-3.5 w-3.5" />
            {errorMsg}
          </p>
        )}
      </form>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-2.5 pt-1">
            <div className="h-12 w-full bg-muted/20 animate-pulse rounded-xl" />
            <div className="h-12 w-full bg-muted/20 animate-pulse rounded-xl" />
          </div>
        ) : isError ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-sm font-semibold text-destructive">
            Error loading checklist. Please check connection.
          </div>
        ) : totalCount === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No tasks or habits for today. Add one above!
          </div>
        ) : (
          <div className="space-y-4">
            {/* Habits Section */}
            {habits.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold tracking-wider text-muted-foreground/80 uppercase px-1">
                  Habits
                </div>
                <div className="space-y-2">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 bg-card ${
                        habit.completed
                          ? "border-border/50 bg-secondary/15 opacity-75"
                          : "border-border shadow-sm hover:border-indigo-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleHabit?.(habit.id)}
                          disabled={isPendingToggleHabit}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 ${
                            habit.completed
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-border hover:border-indigo-600/50"
                          } disabled:opacity-50`}
                          aria-label="Toggle habit check-in"
                        >
                          {habit.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>

                        <span
                          className={`text-sm font-medium truncate pr-2 ${
                            habit.completed ? "line-through text-muted-foreground font-normal" : "text-foreground"
                          }`}
                        >
                          {habit.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Todos Section */}
            {todos.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold tracking-wider text-muted-foreground/80 uppercase px-1">
                  Tasks
                </div>
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 bg-card ${
                        todo.completed
                          ? "border-border/50 bg-secondary/15 opacity-75"
                          : "border-border shadow-sm hover:border-sidebar-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleCompleted(todo.id, todo.completed)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 ${
                            todo.completed
                              ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                              : "border-border hover:border-sidebar-primary/50"
                          }`}
                          aria-label="Toggle task completion"
                        >
                          {todo.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>

                        <span
                          className={`text-sm font-medium truncate pr-2 ${
                            todo.completed ? "line-through text-muted-foreground font-normal" : "text-foreground"
                          }`}
                        >
                          {todo.text}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Delete todo item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
