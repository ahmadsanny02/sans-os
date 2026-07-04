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
import { Priority, TimetableBlock } from "@/hooks/useDaily"
import { AlertCircle } from "lucide-react"

const TIMETABLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
  red: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-600 dark:text-pink-400", border: "border-pink-500/20" },
  teal: { bg: "bg-teal-500/10", text: "text-teal-600 dark:text-teal-400", border: "border-teal-500/20" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/20" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/20" },
  slate: { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", border: "border-slate-500/20" },
}

interface CalendarMonthGridProps {
  currentMonth: Date
  selectedDate: string // YYYY-MM-DD
  onSelectDate: (date: string) => void
  rangePriorities: Priority[]
  timetableList: TimetableBlock[]
  isLoading: boolean
  isError: boolean
}

export function CalendarMonthGrid({
  currentMonth,
  selectedDate,
  onSelectDate,
  rangePriorities,
  timetableList,
  isLoading,
  isError,
}: CalendarMonthGridProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const daysGrid = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className="space-y-4">
      {isError && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs font-semibold text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 animate-bounce" />
          <span>Error loading calendar contents. Please try refreshing.</span>
        </div>
      )}

      {/* Calendar Grid Container */}
      <div className="bento-card">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border/40 bg-secondary/40 text-center py-3 text-xs font-bold text-muted-foreground tracking-wider uppercase select-none">
          {weekdays.map((day) => (
            <div key={day} className="truncate px-1">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 2)}</span>
            </div>
          ))}
        </div>

        {/* Days grid layout */}
        <div className="grid grid-cols-7 bg-border/30 gap-[1px]">
          {daysGrid.map((day, idx) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const isSel = isSameDay(day, parseISO(selectedDate))
            const isCurrMonth = isSameMonth(day, currentMonth)
            const isTday = isToday(day)

            const activeTimetables = timetableList
              .filter((block) => block.date === dateStr)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))

            const activePriorities = rangePriorities.filter((p) => p.date === dateStr)

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

            const visibleItems = allItems.slice(0, 3)
            const remainingCount = allItems.length - 3

            return (
              <div
                key={idx}
                onClick={() => onSelectDate(dateStr)}
                className={`min-h-[75px] sm:min-h-[110px] md:min-h-[130px] bg-card p-1.5 sm:p-2.5 flex flex-col justify-between hover:bg-muted/40 transition-colors cursor-pointer select-none relative group ${
                  !isCurrMonth ? "opacity-35 hover:opacity-60 bg-secondary/10" : ""
                } ${isSel ? "ring-2 ring-primary ring-inset z-10" : ""}`}
              >
                {/* Cell Header */}
                <div className="flex justify-between items-start">
                  <span
                    className={`text-xs md:text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                      isSel
                        ? "bg-primary text-primary-foreground shadow-sm font-extrabold shadow-glow"
                        : isTday
                        ? "border border-primary/50 text-primary font-bold"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {isTday && !isSel && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1 mt-1.5 animate-pulse" />
                  )}
                </div>

                {/* Items preview list */}
                <div className="flex-1 mt-2 space-y-1 overflow-hidden flex flex-col justify-end">
                  {isLoading ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="h-2 w-11/12 bg-muted/60 rounded animate-pulse" />
                      <div className="h-2 w-8/12 bg-muted/60 rounded animate-pulse" />
                    </div>
                  ) : (
                    <>
                      {/* Desktop Text List (>= sm) */}
                      <div className="hidden sm:block space-y-1">
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
                                className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded border border-primary/15 truncate flex items-center gap-1 bg-primary/5 text-primary ${
                                  item.completed ? "line-through opacity-45 border-dashed" : ""
                                }`}
                              >
                                <span className="shrink-0 text-[8px]">🎯</span>
                                <span className="truncate">{item.title}</span>
                              </div>
                            )
                          }
                        })}

                        {remainingCount > 0 && (
                          <div className="text-[8px] md:text-[9px] font-bold text-muted-foreground pl-1.5">
                            + {remainingCount} more
                          </div>
                        )}
                      </div>

                      {/* Mobile Colored Dot Indicators (< sm) */}
                      <div className="flex sm:hidden flex-wrap gap-1.5 justify-center items-center mt-auto">
                        {allItems.map((item) => {
                          if (item.type === "timetable") {
                            let dotColorClass = "bg-blue-500"
                            if (item.color === "green") dotColorClass = "bg-emerald-500"
                            else if (item.color === "purple") dotColorClass = "bg-purple-500"
                            else if (item.color === "amber") dotColorClass = "bg-amber-500"
                            else if (item.color === "red") dotColorClass = "bg-rose-500"
                            else if (item.color === "pink") dotColorClass = "bg-pink-500"
                            else if (item.color === "teal") dotColorClass = "bg-teal-500"
                            else if (item.color === "orange") dotColorClass = "bg-orange-500"
                            else if (item.color === "indigo") dotColorClass = "bg-indigo-500"
                            else if (item.color === "slate") dotColorClass = "bg-slate-500"

                            return (
                              <span
                                key={item.id}
                                className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColorClass}`}
                                title={`${item.time} - ${item.title}`}
                              />
                            )
                          } else {
                            return (
                              <span
                                key={item.id}
                                className={`h-1.5 w-1.5 rounded-full shrink-0 bg-primary ${
                                  item.completed ? "opacity-40" : ""
                                }`}
                                title={`Priority: ${item.title}`}
                              />
                            )
                          }
                        })}
                      </div>
                    </>
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
