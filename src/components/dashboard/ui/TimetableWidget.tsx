"use client"

import React from "react"
import Link from "next/link"
import { TimetableBlock } from "@/hooks/useDaily"
import { Clock, ArrowRight } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { getColorStyle } from "@/lib/categoryUtils"

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
  const { categories } = useCategories()
  return (
    <div className="bento-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Today&apos;s Schedule</h3>
        </div>
        <Link href="/daily" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 min-h-[44px] px-2 py-1 rounded-lg active:bg-primary/10 transition-colors">
          Edit Timetable <ArrowRight className="h-3.5 w-3.5" />
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
              const blockColor = categories.find((c) => c.name.toLowerCase() === block.category?.toLowerCase())?.color || block.color || "blue"
              const color = getColorStyle(blockColor)
              return (
                <div key={block.id} className="relative">
                  {/* Bullet Marker */}
                  <span className={`absolute -left-[30px] top-1.5 flex h-3 w-3 rounded-full border-2 border-background ${color.dotClass}`} />
                  
                  <div className={`rounded-xl border p-3.5 min-h-[44px] bg-card/40 shadow-sm transition-colors duration-200 hover:bg-card/70 border-border/60`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-2">
                      <div className="min-w-0">
                        <span className={`inline-block text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${color.badgeBg}`}>
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
