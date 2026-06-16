"use client"

import React from "react"
import { Priority, TimetableBlock } from "@/hooks/useDaily"
import { CalendarMonthGrid } from "./CalendarMonthGrid"
import { Calendar, Clock, Check, ListTodo } from "lucide-react"

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

interface CalendarViewProps {
  currentMonth: Date
  selectedDate: string
  setSelectedDate: (d: string) => void
  rangePriorities: Priority[]
  dayPriorities: Priority[]
  isLoadingPriorities: boolean
  timetableList: TimetableBlock[]
  activeTimetableBlocks: TimetableBlock[]
  isLoadingTimetable: boolean
  selectedDateFormatted: string
  handleTogglePriority: (id: string, completed: boolean) => void
  isPendingToggle: boolean
  gridLoading: boolean
  gridError: boolean
}

export function CalendarView({
  currentMonth,
  selectedDate,
  setSelectedDate,
  rangePriorities,
  dayPriorities,
  isLoadingPriorities,
  timetableList,
  activeTimetableBlocks,
  isLoadingTimetable,
  selectedDateFormatted,
  handleTogglePriority,
  isPendingToggle,
  gridLoading,
  gridError,
}: CalendarViewProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Calendar Column */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-4">
        <CalendarMonthGrid
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          rangePriorities={rangePriorities}
          timetableList={timetableList}
          isLoading={gridLoading}
          isError={gridError}
        />
      </div>

      {/* Selected Day Agenda Detail Panel */}
      <div className="lg:col-span-4 xl:col-span-3 border border-border bg-card/40 rounded-2xl p-5 shadow-sm backdrop-blur-md flex flex-col h-[fit-content] space-y-6">
        <div className="border-b border-border/60 pb-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-500 shrink-0" />
            Day Agenda
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            {selectedDateFormatted}
          </p>
        </div>

        {/* Agenda Details Section */}
        <div className="space-y-6">
          {/* 1. Daily Priorities list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ListTodo className="h-3.5 w-3.5" />
              Priorities
            </h4>

            {isLoadingPriorities ? (
              <div className="space-y-2 pt-1 animate-pulse">
                <div className="h-10 w-full bg-muted/25 dark:bg-card/15 rounded-lg border border-border/40" />
                <div className="h-10 w-full bg-muted/25 dark:bg-card/15 rounded-lg border border-border/40" />
              </div>
            ) : dayPriorities.length === 0 ? (
              <p className="text-xs text-muted-foreground italic pl-1">No priorities scheduled</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {dayPriorities.map((priority) => (
                  <div
                    key={priority.id}
                    className={`flex items-start gap-2.5 rounded-lg border p-2.5 transition-all text-xs bg-background/50 ${
                      priority.completed ? "border-border/40 opacity-60" : "border-border"
                    }`}
                  >
                    <button
                      onClick={() => handleTogglePriority(priority.id, priority.completed)}
                      disabled={isPendingToggle}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all mt-0.5 cursor-pointer disabled:cursor-not-allowed ${
                        priority.completed
                          ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                          : "border-border hover:border-sidebar-primary hover:bg-sidebar-primary/10"
                      }`}
                      aria-label="Toggle completed"
                    >
                      {priority.completed && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>
                    <span className={`leading-normal truncate ${priority.completed ? "line-through text-muted-foreground" : "text-foreground font-semibold"}`}>
                      {priority.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Timetable events list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Timeline Schedule
            </h4>

            {isLoadingTimetable ? (
              <div className="space-y-2.5 pt-1 animate-pulse">
                <div className="h-12 w-full bg-muted/25 dark:bg-card/15 rounded-lg border border-border/40" />
                <div className="h-12 w-full bg-muted/25 dark:bg-card/15 rounded-lg border border-border/40" />
              </div>
            ) : activeTimetableBlocks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic pl-1">No schedule blocks configured</p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {activeTimetableBlocks.map((block) => {
                  const theme = TIMETABLE_COLORS[block.color || "blue"] || TIMETABLE_COLORS.blue
                  return (
                    <div
                      key={block.id}
                      className={`flex items-start gap-2.5 border-l-2 pl-2.5 py-1 ${theme.text}`}
                      style={{ borderLeftColor: `var(--${block.color}-500)` }}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-bold opacity-80 flex items-center gap-1">
                          <span>{block.startTime} - {block.endTime}</span>
                        </p>
                        <h5 className="text-xs font-bold text-foreground leading-normal truncate">
                          {block.title}
                        </h5>
                        {block.category && (
                          <span className="text-[9px] font-bold opacity-75 uppercase tracking-wide">
                            {block.category}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
