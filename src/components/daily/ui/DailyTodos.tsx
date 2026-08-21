"use client"

import React from "react"
import { DailyTodo } from "@/hooks/useDailyLogs"
import { Trash2, Check, ListTodo, Link2, Pencil, X, Flame, Tag, RotateCcw } from "lucide-react"
import { getCategoryStyle, isCategoryInModule } from "@/lib/categoryUtils"
import { useCategories } from "@/hooks/useCategories"
import { CustomSelect } from "@/components/ui/CustomSelect"
import { useState } from "react"

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
  handleUpdateTodo: (id: string, text: string, link: string, category?: string, subCategory?: string | null) => Promise<void>
  handlePromoteTodoToPriority?: (todo: DailyTodo) => Promise<void>
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
  handleUpdateTodo,
  handlePromoteTodoToPriority,
  isPendingToggleTodo = false,
  habits = [],
  handleToggleHabit,
  isPendingToggleHabit = false,
}: DailyTodosProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editSubCategory, setEditSubCategory] = useState("")
  const { categories, subCategories } = useCategories()
  const timetableCategories = categories.filter((c) => isCategoryInModule(c.module, "timetable"))
  const [editLink, setEditLink] = useState("")

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
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground border border-border/40 flex items-center justify-center min-w-[50px] h-6">
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
                <div className="text-xs font-bold tracking-wider text-muted-foreground/80 uppercase px-1">
                  Habits
                </div>
                <div className="space-y-2">
                  {sortedHabits.map((habit) => (
                    <div
                      key={habit.id}
                      onClick={() => !isPendingToggleHabit && handleToggleHabit?.(habit.id)}
                      className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-all duration-200 ${
                        habit.completed
                          ? "border-border/40 bg-secondary/20 opacity-70"
                          : "border-border/60 bg-card/40 shadow-sm hover:border-primary/30 hover:bg-card/70"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleHabit?.(habit.id)
                          }}
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
                <div className="text-xs font-bold tracking-wider text-muted-foreground/80 uppercase px-1">
                  Tasks
                </div>
                <div className="space-y-2">
                  {sortedTodos.map((todo) => (
                    <div
                      key={todo.id}
                      onClick={() => {
                        if (!isPendingToggleTodo && editingId !== todo.id) {
                          handleToggleCompleted(todo.id, todo.completed)
                        }
                      }}
                      className={`flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                        editingId === todo.id ? "" : "cursor-pointer"
                      } ${
                        todo.completed
                          ? "border-border/40 bg-secondary/20 opacity-70"
                          : "border-border/60 bg-card/40 shadow-sm hover:border-primary/30 hover:bg-card/70"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          disabled={isPendingToggleTodo || editingId === todo.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleCompleted(todo.id, todo.completed)
                          }}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                            todo.completed
                              ? "bg-primary border-primary text-primary-foreground shadow-glow"
                              : "border-border/60 hover:border-primary/50 hover:bg-primary/10 bg-card"
                          } ${isPendingToggleTodo || editingId === todo.id ? "cursor-not-allowed" : "cursor-pointer"}`}
                          aria-label="Toggle task completion"
                        >
                          {todo.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>

                        <div className="flex flex-col min-w-0 pr-2 flex-1">
                          {editingId === todo.id ? (
                            <div className="flex flex-col gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                                placeholder="Task text"
                                autoFocus
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <CustomSelect
                                  id="editCategory"
                                  value={editCategory}
                                  onChange={(val) => {
                                    setEditCategory(val)
                                    setEditSubCategory("")
                                  }}
                                  options={
                                    timetableCategories.length > 0
                                      ? timetableCategories.map((c) => ({ value: c.name, label: c.name }))
                                      : [{ value: "General", label: "General" }]
                                  }
                                  fullWidth
                                />
                                {editCategory && subCategories.some(sc => sc.categoryId === categories.find(c => c.name.toLowerCase() === (editCategory || "").toLowerCase())?.id) && (
                                  <CustomSelect
                                    id="editSubCategory"
                                    value={editSubCategory}
                                    onChange={(val) => setEditSubCategory(val)}
                                    options={[
                                      { value: "", label: "None" },
                                      ...subCategories.filter(sc => sc.categoryId === categories.find(c => c.name.toLowerCase() === (editCategory || "").toLowerCase())?.id).map((sc) => ({ value: sc.name, label: sc.name }))
                                    ]}
                                    fullWidth
                                  />
                                )}
                              </div>
                              <input
                                type="url"
                                value={editLink}
                                onChange={(e) => setEditLink(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                                placeholder="Reference Link (optional)"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 min-w-0">
                                <span
                                  className={`text-sm font-medium break-words whitespace-normal ${
                                    todo.completed ? "line-through text-muted-foreground font-normal" : "text-foreground"
                                  }`}
                                >
                                  {todo.text}
                                </span>
                                {todo.category && (
                                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-micro font-bold uppercase tracking-wider truncate max-w-full w-fit ${getCategoryStyle(todo.category, categories).badgeBg}`}>
                                    <Tag className="h-2.5 w-2.5 shrink-0" />
                                    <span className="truncate">{todo.category}</span>
                                    {todo.subCategory && <span className="opacity-70 font-medium truncate"> • {todo.subCategory}</span>}
                                  </span>
                                )}
                                {todo.rolloverCount > 0 && (
                                  <span
                                    className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 px-2 py-0.5 text-micro font-bold uppercase tracking-wider shrink-0"
                                    title={`Rolled over ${todo.rolloverCount} time${todo.rolloverCount > 1 ? "s" : ""}`}
                                  >
                                    <RotateCcw className="h-2.5 w-2.5 shrink-0" />
                                    <span>Rollover{todo.rolloverCount > 1 ? ` (${todo.rolloverCount}x)` : ""}</span>
                                  </span>
                                )}
                              </div>
                              {todo.link && (
                                <a
                                  href={todo.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                                  title="Open Link"
                                >
                                  <Link2 className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {editingId === todo.id ? (
                          <>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (!editText.trim()) return
                                await handleUpdateTodo(todo.id, editText.trim(), editLink.trim(), editCategory, editSubCategory || null)
                                setEditingId(null)
                              }}
                              disabled={!editText.trim()}
                              className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                              aria-label="Save todo changes"
                            >
                              <Check className="h-4 w-4 stroke-[3]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingId(null)
                              }}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              aria-label="Cancel editing"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {handlePromoteTodoToPriority && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePromoteTodoToPriority(todo)
                                }}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                                title="Move to Top 5 Priorities"
                                aria-label={`Move ${todo.text} to Top 5 Priorities`}
                              >
                                <Flame className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingId(todo.id)
                                setEditText(todo.text)
                                setEditLink(todo.link || "")
                                setEditCategory(todo.category || "General")
                                setEditSubCategory(todo.subCategory || "")
                              }}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              aria-label="Edit todo item"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTodo(todo.id)
                              }}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              aria-label="Delete todo item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
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
