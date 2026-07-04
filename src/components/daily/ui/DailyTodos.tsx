"use client"

import React from "react"
import { DailyTodo } from "@/hooks/useDailyLogs"
import { Trash2, Check, ListTodo, Link2 } from "lucide-react"

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
  handleToggleCompleted: (id: string, completed: boolean) => void
  handleDeleteTodo: (id: string) => Promise<void>
  isPendingToggleTodo?: boolean
  habits?: HabitItem[]
  handleToggleHabit?: (id: string) => void
  isPendingToggleHabit?: boolean
}

export function DailyTodos({
  todos,
  isLoading,
  isError,
  handleToggleCompleted,
  handleDeleteTodo,
  isPendingToggleTodo = false,
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

  const sortedHabits = [...habits].sort((a, b) => {
    if (a.completed === b.completed) return 0
    return a.completed ? 1 : -1
  })

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) return 0
    return a.completed ? 1 : -1
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            Daily Checklist
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Keep track of today&apos;s tasks and routine items
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border/40 flex items-center justify-center min-w-[50px] h-6">
          {isLoading ? (
            <span className="inline-block w-8 h-3 bg-muted/30 animate-pulse rounded" />
          ) : (
            `${completedCount}/${totalCount} Done`
          )}
        </span>
      </div>

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
          <div className="rounded-2xl border border-dashed border-border/60 py-10 text-center text-sm text-muted-foreground">
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
                  {sortedHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                        habit.completed
                          ? "border-border/40 bg-secondary/20 opacity-70"
                          : "border-border/60 bg-card/40 shadow-sm hover:border-primary/30 hover:bg-card/70"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleHabit?.(habit.id)}
                          disabled={isPendingToggleHabit}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 ${
                            habit.completed
                              ? "bg-primary border-primary text-primary-foreground shadow-glow"
                              : "border-border/60 hover:border-primary/50 bg-card"
                          } disabled:opacity-50`}
                          aria-label="Toggle habit check-in"
                        >
                          {habit.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>

                        <span
                          className={`text-sm font-medium break-words whitespace-normal pr-2 ${
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
                  {sortedTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                        todo.completed
                          ? "border-border/40 bg-secondary/20 opacity-70"
                          : "border-border/60 bg-card/40 shadow-sm hover:border-primary/30 hover:bg-card/70"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          disabled={isPendingToggleTodo}
                          onClick={() => handleToggleCompleted(todo.id, todo.completed)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                            todo.completed
                              ? "bg-primary border-primary text-primary-foreground shadow-glow"
                              : "border-border/60 hover:border-primary/50 bg-card"
                          } ${isPendingToggleTodo ? "cursor-not-allowed" : "cursor-pointer"}`}
                          aria-label="Toggle task completion"
                        >
                          {todo.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-sm font-medium break-words whitespace-normal ${
                              todo.completed ? "line-through text-muted-foreground font-normal" : "text-foreground"
                            }`}
                          >
                            {todo.text}
                          </span>
                          {todo.link && (
                            <a
                              href={todo.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                              title="Open Link"
                            >
                              <Link2 className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
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
