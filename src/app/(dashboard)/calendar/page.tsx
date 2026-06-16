"use client"

import React, { useState, useEffect } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { CalendarMonthGrid } from "@/components/daily/CalendarMonthGrid"
import {
  usePrioritiesQuery,
  useTogglePriorityMutation,
  useTimetableQuery,
  Priority,
  TimetableBlock,
} from "@/hooks/useDaily"
import { format, parseISO, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar, Clock, Check, Loader2, ListTodo } from "lucide-react"

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

export default function CalendarPage() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)

  // Current calendar navigation month
  const [prevActiveDate, setPrevActiveDate] = useState(activeDate)
  const [currentMonth, setCurrentMonth] = useState<Date>(() => parseISO(activeDate))

  // Selected date on calendar to view agenda details
  const [selectedDate, setSelectedDate] = useState<string>(activeDate)

  // Sync state with global store activeDate when it changes from outside
  if (activeDate !== prevActiveDate) {
    setPrevActiveDate(activeDate)
    setSelectedDate(activeDate)
    setCurrentMonth(parseISO(activeDate))
  }

  // Update page title
  useEffect(() => {
    document.title = "Calendar View - SansOS Workspace"
  }, [])

  // Month navigation
  const handlePrevMonth = (): void => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = (): void => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  const handleGoToToday = (): void => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(format(today, "yyyy-MM-dd"))
  }

  // Load details for selected date
  const { data: dayPriorities = [], isLoading: isLoadingPriorities } = usePrioritiesQuery(selectedDate)
  const { data: timetableList = [], isLoading: isLoadingTimetable } = useTimetableQuery()
  const togglePriorityMutation = useTogglePriorityMutation(selectedDate)

  // Filter timetable blocks: show everyday fixed OR custom date-matching blocks
  const activeTimetableBlocks = timetableList
    .filter((block) => block.dayOfWeek === -1 || block.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const selectedDateFormatted = format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")

  const handleTogglePriority = (id: string, completed: boolean): void => {
    togglePriorityMutation.mutate({ id, completed: !completed })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4">
      {/* Calendar Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Calendar View
          </h1>
          <p className="text-sm text-muted-foreground">
            Monthly schedule and tasks visualizer
          </p>
        </div>

        {/* Month selector controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary/30 border border-border/60 p-1.5 rounded-xl shadow-inner backdrop-blur-sm">
            <button
              onClick={handlePrevMonth}
              className="inline-flex h-8 w-8 sm:w-auto sm:px-3 items-center justify-center rounded-lg hover:bg-background/80 hover:text-foreground text-muted-foreground transition-all duration-200 active:scale-95 text-xs font-medium"
              aria-label="Previous Month"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1 shrink-0" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <span className="text-xs font-bold text-foreground px-3 min-w-[100px] text-center select-none">
              {format(currentMonth, "MMMM yyyy")}
            </span>

            <button
              onClick={handleNextMonth}
              className="inline-flex h-8 w-8 sm:w-auto sm:px-3 items-center justify-center rounded-lg hover:bg-background/80 hover:text-foreground text-muted-foreground transition-all duration-200 active:scale-95 text-xs font-medium"
              aria-label="Next Month"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:ml-1 shrink-0" />
            </button>
          </div>

          <div className="bg-secondary/30 border border-border/60 p-1.5 rounded-xl backdrop-blur-sm">
            <button
              onClick={handleGoToToday}
              className="inline-flex h-8 px-3.5 items-center justify-center rounded-lg bg-background text-foreground shadow-sm border border-border/40 hover:bg-background/80 transition-all duration-200 active:scale-95 text-xs font-semibold"
              aria-label="Go to Today"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Calendar Column */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          <CalendarMonthGrid
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
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
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-sidebar-primary" />
                </div>
              ) : dayPriorities.length === 0 ? (
                <p className="text-xs text-muted-foreground italic pl-1">No priorities scheduled</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {dayPriorities.map((priority: Priority) => (
                    <div
                      key={priority.id}
                      className={`flex items-start gap-2.5 rounded-lg border p-2.5 transition-all text-xs bg-background/50 ${
                        priority.completed ? "border-border/40 opacity-60" : "border-border"
                      }`}
                    >
                      <button
                        onClick={() => handleTogglePriority(priority.id, priority.completed)}
                        disabled={togglePriorityMutation.isPending}
                        className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-all mt-0.5 ${
                          priority.completed
                            ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                            : "border-border hover:border-sidebar-primary/50"
                        }`}
                        aria-label="Toggle completed"
                      >
                        {priority.completed ? <Check className="h-3 w-3 stroke-[3]" /> : null}
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
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-sidebar-primary" />
                </div>
              ) : activeTimetableBlocks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic pl-1">No schedule blocks configured</p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {activeTimetableBlocks.map((block: TimetableBlock) => {
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
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
