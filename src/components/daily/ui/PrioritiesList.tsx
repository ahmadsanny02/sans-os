"use client"

import React from "react"
import { Priority } from "@/hooks/useDaily"
import { Trash2, Check, RefreshCw, Link2, Pencil, X } from "lucide-react"
import { useState } from "react"

interface PrioritiesListProps {
  listPriorities: Priority[]
  isLoading: boolean
  isError: boolean
  handleToggleCompleted: (id: string, completed: boolean) => void
  handleDeletePriority: (id: string) => Promise<void>
  handleUpdatePriority: (id: string, text: string, link: string) => Promise<void>
  isPendingToggle?: boolean
}

export function PrioritiesList({
  listPriorities,
  isLoading,
  isError,
  handleToggleCompleted,
  handleDeletePriority,
  handleUpdatePriority,
  isPendingToggle = false,
}: PrioritiesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [editLink, setEditLink] = useState("")

  const sortedPriorities = [...listPriorities].sort((a, b) => {
    if (a.completed === b.completed) {
      return a.orderIndex - b.orderIndex
    }
    return a.completed ? 1 : -1
  })

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
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border/40 flex items-center justify-center min-w-[32px] h-6">
          {isLoading ? (
            <span className="inline-block w-4 h-3 bg-muted/30 animate-pulse rounded" />
          ) : (
            `${listPriorities.length}/5`
          )}
        </span>
      </div>

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
          <div className="rounded-2xl border border-dashed border-border/60 py-10 text-center text-sm text-muted-foreground">
            No priorities added for today. Add your first item below!
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedPriorities.map((priority) => (
              <div
                key={priority.id}
                className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-200 ${
                  priority.completed
                    ? "border-border/40 bg-secondary/20 opacity-70"
                    : "border-border/60 bg-card/40 shadow-sm hover:border-primary/30 hover:bg-card/70"
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    disabled={isPendingToggle || editingId === priority.id}
                    onClick={() => handleToggleCompleted(priority.id, priority.completed)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      priority.completed
                        ? "bg-primary border-primary text-primary-foreground shadow-glow"
                        : "border-border/60 hover:border-primary/50 hover:bg-primary/10 bg-card"
                    } ${isPendingToggle || editingId === priority.id ? "cursor-not-allowed" : "cursor-pointer"}`}
                    aria-label="Toggle task completed"
                  >
                    {priority.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex flex-col min-w-0 pr-2 flex-1">
                    {editingId === priority.id ? (
                      <div className="flex flex-col gap-2 w-full">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                          placeholder="Priority text"
                          autoFocus
                        />
                        <input
                          type="url"
                          value={editLink}
                          onChange={(e) => setEditLink(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                          placeholder="Reference Link (optional)"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-sm font-semibold break-words whitespace-normal leading-snug ${
                              priority.completed ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {priority.text}
                          </span>
                          {priority.link && (
                            <a
                              href={priority.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                              title="Open Link"
                            >
                              <Link2 className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        {priority.rolloverCount > 0 && !priority.completed && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 mt-0.5">
                            <RefreshCw className="h-3 w-3 animate-spin-slow" />
                            Rolled over {priority.rolloverCount}x
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {editingId === priority.id ? (
                    <>
                      <button
                        onClick={async () => {
                          if (!editText.trim()) return
                          await handleUpdatePriority(priority.id, editText.trim(), editLink.trim())
                          setEditingId(null)
                        }}
                        disabled={!editText.trim()}
                        className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                        aria-label="Save priority changes"
                      >
                        <Check className="h-4 w-4 stroke-[3]" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label="Cancel editing"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(priority.id)
                          setEditText(priority.text)
                          setEditLink(priority.link || "")
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        aria-label="Edit priority"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePriority(priority.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Delete priority"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
