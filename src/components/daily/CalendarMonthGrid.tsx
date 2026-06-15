"use client"

import React from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns"
import { usePrioritiesRangeQuery, useTimetableQuery } from "@/hooks/useDaily"
import { Loader2, AlertCircle } from "lucide-react"

// Color scheme mapping for timetable blocks
const TIMETABLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
  red: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20" },
}

interface CalendarMonthGridProps {
  currentMonth: Date
  selectedDate: string // YYYY-MM-DD
  onSelectDate: (date: string) => void
}

export function CalendarMonthGrid({ currentMonth, selectedDate, onSelectDate }: CalendarMonthGridProps) {
  // Generate date bounds for queries
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)

  const startDateStr = format(gridStart, "yyyy-MM-dd")
  const endDateStr = format(gridEnd, "yyyy-MM-dd")

  // React Query Hooks
  const { data: rangePriorities = [], isLoading: isLoadingPriorities, isError: isErrorPriorities } =
    usePrioritiesRangeQuery(startDateStr, endDateStr)

  const { data: timetableList = [], isLoading: isLoadingTimetable, isError: isErrorTimetable } =
    useTimetableQuery()

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const daysGrid = eachDayOfInterval({ start: gridStart, end: gridEnd })

  if (isLoadingPriorities || isLoadingTimetable) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-border bg-card/40 backdrop-blur-md">
        <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" />
      </div>
    )
  }

  if (isErrorPriorities || isErrorTimetable) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 text-sm font-semibold text-destructive">
        <AlertCircle className="h-8 w-8" />
        <span>Error loading calendar contents. Please try refreshing.</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Calendar Grid Container */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm dark:bg-card/50">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border/80 bg-secondary/40 text-center py-3 text-xs font-bold text-muted-foreground tracking-wider uppercase select-none">
          {weekdays.map((day) => (
            <div key={day} className="truncate px-1">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Days grid layout */}
        <div className="grid grid-cols-7 bg-border/40 gap-[1px]">
          {daysGrid.map((day, idx) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const isSel = isSameDay(day, parseISO(selectedDate))
            const isCurrMonth = isSameMonth(day, currentMonth)
            const isTday = isToday(day)

            // 1. Filter timetable blocks: show ONLY custom date-matching blocks (exclude everyday fixed)
            const activeTimetables = timetableList
              .filter((block) => block.date === dateStr)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))

            // 2. Filter priorities by date
            const activePriorities = rangePriorities.filter((p) => p.date === dateStr)

            // Combined list items for display
            const allItems: Array<{ id: string; title: string; time?: string; type: "timetable" | "priority"; color?: string; completed?: boolean }> = [
              ...activeTimetables.map((t) => ({
                id: t.id,
                title: t.title,
                time: t.startTime,
                type: "timetable" as const,
                color: t.color,
              })),
              ...activePriorities.map((p) => ({
                id: p.id,
                title: p.text,
                type: "priority" as const,
                completed: p.completed,
              })),
            ]

            // Limit elements in calendar box to prevent overflowing
            const visibleItems = allItems.slice(0, 3)
            const remainingCount = allItems.length - 3

            return (
              <div
                key={idx}
                onClick={() => onSelectDate(dateStr)}
                className={`min-h-[110px] md:min-h-[130px] bg-card p-2.5 flex flex-col justify-between hover:bg-muted/40 transition-colors cursor-pointer select-none relative group ${
                  !isCurrMonth ? "opacity-35 hover:opacity-60 bg-secondary/10" : ""
                } ${isSel ? "ring-2 ring-sidebar-primary ring-inset z-10" : ""}`}
              >
                {/* Cell Header: Day number & today's highlighting indicator */}
                <div className="flex justify-between items-start">
                  <span
                    className={`text-xs md:text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                      isSel
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-extrabold"
                        : isTday
                        ? "border border-sidebar-primary/50 text-sidebar-primary font-bold"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {isTday && !isSel && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sidebar-primary mr-1 mt-1.5 animate-pulse" />
                  )}
                </div>

                {/* Items preview list */}
                <div className="flex-1 mt-2 space-y-1 overflow-hidden">
                  {visibleItems.map((item) => {
                    if (item.type === "timetable") {
                      const theme = TIMETABLE_COLORS[item.color || "blue"] || TIMETABLE_COLORS.blue
                      return (
                        <div
                          key={item.id}
                          className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded border truncate flex items-center gap-1 ${theme.bg} ${theme.text} ${theme.border}`}
                        >
                          <span className="shrink-0 text-[8px] md:text-[9px] opacity-75">
                            {item.time}
                          </span>
                          <span className="truncate">{item.title}</span>
                        </div>
                      )
                    } else {
                      return (
                        <div
                          key={item.id}
                          className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/10 truncate flex items-center gap-1 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 ${
                            item.completed ? "line-through opacity-45 border-dashed" : ""
                          }`}
                        >
                          <span className="shrink-0 text-[8px]">🎯</span>
                          <span className="truncate">{item.title}</span>
                        </div>
                      )
                    }
                  })}

                  {/* Remaining items count */}
                  {remainingCount > 0 && (
                    <div className="text-[8px] md:text-[9px] font-bold text-muted-foreground pl-1.5">
                      + {remainingCount} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
