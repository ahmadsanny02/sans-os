"use client"

import React from "react"
import { Priority } from "@/hooks/useDaily"
import { Award, Check } from "lucide-react"

interface PrioritiesWidgetProps {
  priorities: Priority[]
  isLoading: boolean
  isError: boolean
  handleToggle: (id: string, completed: boolean) => void
  isPendingToggle: boolean
}

export function PrioritiesWidget({
  priorities,
  isLoading,
  isError,
  handleToggle,
  isPendingToggle,
}: PrioritiesWidgetProps) {
  const sortedPriorities = [...priorities].sort((a, b) => {
    if (a.completed === b.completed) {
      return a.orderIndex - b.orderIndex
    }
    return a.completed ? 1 : -1
  })

  return (
    <div className="bento-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Top 5 Priorities</h3>
        </div>
        <span className="text-xs bg-secondary/80 px-2 py-0.5 rounded-full border border-border/40 font-semibold text-muted-foreground flex items-center justify-center min-w-[32px] h-5">
          {isLoading ? (
            <span className="inline-block w-4 h-2.5 bg-muted/30 animate-pulse rounded" />
          ) : (
            `${priorities.filter((p) => p.completed).length}/5`
          )}
        </span>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2 pt-1">
            <div className="h-12 w-full bg-muted/20 animate-pulse rounded-xl" />
            <div className="h-12 w-full bg-muted/20 animate-pulse rounded-xl" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 py-8 text-center text-xs text-destructive font-semibold">
            Error loading priorities.
          </div>
        ) : priorities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 py-8 text-center text-xs text-muted-foreground">
            No priorities set for today.
          </div>
        ) : (
          <div className="space-y-2">
            {sortedPriorities.map((priority) => (
              <div
                key={priority.id}
                onClick={() => !isPendingToggle && handleToggle(priority.id, priority.completed)}
                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all duration-200 ${
                  priority.completed 
                    ? "opacity-70 border-border/40 bg-secondary/20 hover:border-border/65" 
                    : "border-border/60 bg-card/40 hover:border-primary/30 hover:shadow-sm hover:bg-card/70"
                }`}
              >
                <button
                  type="button"
                  disabled={isPendingToggle}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                    priority.completed
                      ? "bg-primary border-primary text-primary-foreground shadow-glow"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                  aria-label="Toggle completed"
                >
                  {priority.completed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : null}
                </button>
                <span
                  className={`text-xs font-semibold break-words whitespace-normal leading-tight ${
                    priority.completed ? "line-through text-muted-foreground font-normal" : "text-foreground"
                  }`}
                >
                  {priority.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
