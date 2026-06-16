"use client"

import React, { useState } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import {
  useDailyTodosQuery,
  useCreateDailyTodoMutation,
  useToggleDailyTodoMutation,
  useDeleteDailyTodoMutation,
} from "@/hooks/useDailyLogs"
import { Plus, Trash2, Check, Loader2, ListTodo, AlertCircle } from "lucide-react"

export function DailyTodos() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)

  const { data: todos = [], isLoading, isError } = useDailyTodosQuery(activeDate)
  const createTodoMutation = useCreateDailyTodoMutation()
  const toggleTodoMutation = useToggleDailyTodoMutation(activeDate)
  const deleteTodoMutation = useDeleteDailyTodoMutation(activeDate)

  const [newText, setNewText] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleAddTodo = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setErrorMsg(null)
    if (!newText.trim()) return

    try {
      await createTodoMutation.mutateAsync({
        date: activeDate,
        text: newText,
      })
      setNewText("")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to add todo")
    }
  }

  const handleToggleCompleted = (id: string, completed: boolean): void => {
    toggleTodoMutation.mutate({ id, completed: !completed })
  }

  const handleDeleteTodo = (id: string): void => {
    deleteTodoMutation.mutate(id)
  }

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
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border">
          {isLoading ? "..." : `${todos.filter((t) => t.completed).length}/${todos.length} Done`}
        </span>
      </div>

      <form onSubmit={handleAddTodo} className="space-y-2.5">
        <div className="flex gap-2">
          <input
            type="text"
            required
            disabled={isLoading || createTodoMutation.isPending}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={isLoading ? "Loading..." : "Add new task..."}
            className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10 disabled:bg-secondary/40 disabled:placeholder-muted-foreground"
          />
          <button
            type="submit"
            disabled={isLoading || createTodoMutation.isPending || !newText.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-sidebar-primary px-4 py-2 text-sm font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/95 disabled:opacity-50"
            aria-label="Add new todo item"
          >
            {createTodoMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>

        {errorMsg ? (
          <p className="text-xs text-destructive flex items-center gap-1 font-semibold">
            <AlertCircle className="h-3.5 w-3.5" />
            {errorMsg}
          </p>
        ) : null}
      </form>

      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-card/20 backdrop-blur-md">
            <Loader2 className="h-6 w-6 animate-spin text-sidebar-primary" />
          </div>
        ) : isError ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-sm font-semibold text-destructive">
            Error loading checklist. Please check connection.
          </div>
        ) : todos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No tasks added for today. Add one above!
          </div>
        ) : (
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
                    disabled={toggleTodoMutation.isPending}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 ${
                      todo.completed
                        ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                        : "border-border hover:border-sidebar-primary/50"
                    }`}
                    aria-label="Toggle task completion"
                  >
                    {todo.completed ? (
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    ) : null}
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
                  disabled={deleteTodoMutation.isPending}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Delete todo item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
