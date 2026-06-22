"use client"

import React from "react"
import { Priority } from "@/hooks/useDaily"
import { Plus, Trash2, Check, Loader2, RefreshCw, AlertCircle } from "lucide-react"

interface PrioritiesListProps {
  listPriorities: Priority[]
  isLoading: boolean
  isError: boolean
  newText: string
  setNewText: (t: string) => void
  errorMsg: string | null
  handleAddPriority: (e: React.FormEvent) => Promise<void>
  handleToggleCompleted: (id: string, completed: boolean) => void
  handleDeletePriority: (id: string) => Promise<void>
  isPendingCreate: boolean
  isPendingToggle?: boolean
}

export function PrioritiesList({
  listPriorities,
  isLoading,
  isError,
  newText,
  setNewText,
  errorMsg,
  handleAddPriority,
  handleToggleCompleted,
  handleDeletePriority,
  isPendingCreate,
  isPendingToggle = false,
}: PrioritiesListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Top 5 Priorities
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Focus on the 5 most important tasks for today
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border flex items-center justify-center min-w-[32px] h-6">
          {isLoading ? (
            <span className="inline-block w-4 h-3 bg-muted/30 animate-pulse rounded" />
          ) : (
            `${listPriorities.length}/5`
          )}
        </span>
      </div>

      {/* Add Priority Input Form */}
      <form onSubmit={handleAddPriority} className="space-y-2.5">
        <div className="flex gap-2">
          <input
            type="text"
            required
            disabled={isLoading || listPriorities.length >= 5 || isPendingCreate}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={
              isLoading
                ? "Loading..."
                : listPriorities.length >= 5
                ? "Top 5 limit reached for today"
                : "Add new priority task..."
            }
            className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10 disabled:bg-secondary/40 disabled:placeholder-muted-foreground"
          />
          <button
            type="submit"
            disabled={isLoading || listPriorities.length >= 5 || isPendingCreate || !newText.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-sidebar-primary px-4 py-2 text-sm font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/95 disabled:opacity-50"
            aria-label="Add task button"
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

      {/* Priorities List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-2.5 pt-1">
            <div className="h-12 w-full bg-muted/20 animate-pulse rounded-xl" />
            <div className="h-12 w-full bg-muted/20 animate-pulse rounded-xl" />
          </div>
        ) : isError ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-sm font-semibold text-destructive">
            Error loading priorities. Please check connection.
          </div>
        ) : listPriorities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No priorities added for today. Add your first item below!
          </div>
        ) : (
          <div className="space-y-2.5">
            {listPriorities.map((priority) => (
              <div
                key={priority.id}
                className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-200 bg-card ${
                  priority.completed
                    ? "border-border/50 bg-secondary/20 opacity-75"
                    : "border-border shadow-sm hover:border-sidebar-primary/30"
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    disabled={isPendingToggle}
                    onClick={() => handleToggleCompleted(priority.id, priority.completed)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      priority.completed
                        ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                        : "border-border hover:border-sidebar-primary/50 hover:bg-sidebar-primary/10"
                    } ${isPendingToggle ? "cursor-not-allowed" : "cursor-pointer"}`}
                    aria-label="Toggle task completed"
                  >
                    {priority.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex flex-col min-w-0 pr-2">
                    <span
                      className={`text-sm font-semibold break-words whitespace-normal leading-snug ${
                        priority.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {priority.text}
                    </span>
                    {priority.rolloverCount > 0 && !priority.completed && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 mt-0.5">
                        <RefreshCw className="h-3 w-3 animate-spin-slow" />
                        Rolled over {priority.rolloverCount}x
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeletePriority(priority.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Delete priority"
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
