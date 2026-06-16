"use client"

import React, { useEffect } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { HabitGrid } from "@/components/habits/HabitGrid"
import { HabitRecaps } from "@/components/habits/HabitRecaps"
import { format, parseISO, addMonths, subMonths } from "date-fns"
import { Calendar, ChevronLeft, ChevronRight, CheckSquare } from "lucide-react"

export default function HabitsPage() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)
  const setActiveDate = useWorkspaceStore((state) => state.setActiveDate)

  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Habit Tracker - SansOS Workspace"
  }, [])

  const baseDate = parseISO(activeDate)

  // Navigation handlers
  const handlePrevMonth = (): void => {
    const newDate = subMonths(baseDate, 1)
    setActiveDate(format(newDate, "yyyy-MM-dd"))
  }

  const handleNextMonth = (): void => {
    const newDate = addMonths(baseDate, 1)
    setActiveDate(format(newDate, "yyyy-MM-dd"))
  }

  const handleGoToToday = (): void => {
    setActiveDate(format(new Date(), "yyyy-MM-dd"))
  }

  const activeMonthFormatted = format(baseDate, "MMMM yyyy")

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4">
      {/* Top Navigation Control Row */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md pt-2 pb-6 border-b border-border/60 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-violet-500 shrink-0" />
            Habit Tracker
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-violet-500" />
            Active Month: <span className="font-semibold text-foreground">{activeMonthFormatted}</span>
          </p>
        </div>

        {/* Calendar Navigation Buttons */}
        <div className="flex items-center gap-1 bg-secondary/30 border border-border/60 p-1.5 rounded-xl shadow-inner backdrop-blur-md self-start sm:self-center">
          <button
            onClick={handlePrevMonth}
            className="inline-flex h-8 w-8 sm:w-auto sm:px-3 items-center justify-center rounded-lg hover:bg-background/80 hover:text-foreground text-muted-foreground transition-all duration-200 active:scale-95 text-xs font-medium"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-1 shrink-0" />
            <span className="hidden sm:inline">Previous Month</span>
          </button>
          
          <button
            onClick={handleGoToToday}
            className="inline-flex h-8 px-3 items-center justify-center rounded-lg bg-background text-foreground shadow-sm border border-border/40 hover:bg-background/80 transition-all duration-200 active:scale-95 text-xs font-semibold"
            aria-label="Go to today"
          >
            Today
          </button>

          <button
            onClick={handleNextMonth}
            className="inline-flex h-8 w-8 sm:w-auto sm:px-3 items-center justify-center rounded-lg hover:bg-background/80 hover:text-foreground text-muted-foreground transition-all duration-200 active:scale-95 text-xs font-medium"
            aria-label="Next month"
          >
            <span className="hidden sm:inline">Next Month</span>
            <ChevronRight className="h-4 w-4 sm:ml-1 shrink-0" />
          </button>
        </div>
      </div>

      {/* Recaps and Statistics Widgets */}
      <HabitRecaps />

      {/* Habit Matrix Grid Checklist */}
      <HabitGrid />
    </div>
  )
}
