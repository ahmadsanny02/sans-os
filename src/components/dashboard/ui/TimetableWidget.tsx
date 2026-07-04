"use client"

import React from "react"
import Link from "next/link"
import { TimetableBlock } from "@/hooks/useDaily"
import { Clock, ArrowRight } from "lucide-react"

// Color scheme mapping for timetable blocks
const TIMETABLE_COLORS: Record<string, { bg: string; text: string; border: string; bullet: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-500 dark:text-blue-400", border: "border-blue-500/20", bullet: "bg-blue-500" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-500 dark:text-emerald-400", border: "border-emerald-500/20", bullet: "bg-emerald-500" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500 dark:text-purple-400", border: "border-purple-500/20", bullet: "bg-purple-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500 dark:text-amber-400", border: "border-amber-500/20", bullet: "bg-amber-500" },
  red: { bg: "bg-rose-500/10", text: "text-rose-500 dark:text-rose-400", border: "border-rose-500/20", bullet: "bg-rose-500" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-500 dark:text-pink-400", border: "border-pink-500/20", bullet: "bg-pink-500" },
  teal: { bg: "bg-teal-500/10", text: "text-teal-500 dark:text-teal-400", border: "border-teal-500/20", bullet: "bg-teal-500" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-500 dark:text-orange-400", border: "border-orange-500/20", bullet: "bg-orange-500" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-500 dark:text-indigo-400", border: "border-indigo-500/20", bullet: "bg-indigo-500" },
  slate: { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400", border: "border-slate-500/20", bullet: "bg-slate-500" },
}

interface TimetableWidgetProps {
  activeDayBlocks: TimetableBlock[]
  isLoading: boolean
  isError: boolean
}

export function TimetableWidget({
  activeDayBlocks,
  isLoading,
  isError,
}: TimetableWidgetProps) {
  return (
    <div className="bento-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Today&apos;s Schedule</h3>
        </div>
        <Link href="/daily" className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5">
          Edit Timetable <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="relative border-l border-border/40 ml-2.5 pl-6 space-y-4">
            <div className="relative">
              <span className="absolute -left-[30px] top-1.5 flex h-3 w-3 rounded-full border-2 border-background bg-muted animate-pulse" />
              <div className="h-16 w-full bg-muted/20 animate-pulse rounded-xl border border-border/40" />
            </div>
            <div className="relative">
              <span className="absolute -left-[30px] top-1.5 flex h-3 w-3 rounded-full border-2 border-background bg-muted animate-pulse" />
              <div className="h-16 w-full bg-muted/20 animate-pulse rounded-xl border border-border/40" />
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 py-8 text-center text-xs text-destructive font-semibold">
            Error loading schedule.
          </div>
        ) : activeDayBlocks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 py-8 text-center text-xs text-muted-foreground">
            No schedule blocks set for today.
          </div>
        ) : (
          <div className="relative border-l border-border/40 ml-2.5 pl-6 space-y-4">
            {activeDayBlocks.map((block) => {
              const color = TIMETABLE_COLORS[block.color || "blue"] || TIMETABLE_COLORS.blue
              return (
                <div key={block.id} className="relative">
                  {/* Bullet Marker */}
                  <span className={`absolute -left-[30px] top-1.5 flex h-3 w-3 rounded-full border-2 border-background ${color.bullet}`} />
                  
                  <div className={`rounded-xl border p-3 bg-card/40 shadow-sm transition-colors duration-200 hover:bg-card/70 border-border/60 ${color.border}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-2">
                      <div className="min-w-0">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${color.bg} ${color.text} border ${color.border}`}>
                          {block.category || "General"}
                        </span>
                        <h4 className="text-sm font-bold text-foreground mt-1.5 leading-snug">
                          {block.title}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap bg-secondary/50 px-2 py-1 rounded-md shrink-0 self-start sm:self-auto">
                        {block.startTime} - {block.endTime}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
