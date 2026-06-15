"use client"

import React, { useEffect } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { PrioritiesList } from "@/components/daily/PrioritiesList"
import { Timetable } from "@/components/daily/Timetable"
import { CalendarDatePicker } from "@/components/daily/CalendarDatePicker"
import { format, parseISO, addDays, subDays } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function DailyPage() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)
  const setActiveDate = useWorkspaceStore((state) => state.setActiveDate)

  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Daily Flow - SansOS Workspace"
  }, [])

  const baseDate = parseISO(activeDate)

  // Navigation handlers
  const handlePrevDay = (): void => {
    const newDate = subDays(baseDate, 1)
    setActiveDate(format(newDate, "yyyy-MM-dd"))
  }

  const handleNextDay = (): void => {
    const newDate = addDays(baseDate, 1)
    setActiveDate(format(newDate, "yyyy-MM-dd"))
  }

  const handleGoToToday = (): void => {
    setActiveDate(format(new Date(), "yyyy-MM-dd"))
  }


  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      {/* Date Navigation Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Daily Flow
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Active Date:</span>
            <CalendarDatePicker selectedDate={activeDate} onDateChange={setActiveDate} />
          </div>
        </div>

        {/* Date Shift Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handlePrevDay}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-semibold hover:bg-muted active:scale-95 transition-all text-muted-foreground hover:text-foreground"
            aria-label="Previous day"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous Day
          </button>
          
          <button
            onClick={handleGoToToday}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-semibold hover:bg-muted active:scale-95 transition-all text-muted-foreground hover:text-foreground"
            aria-label="Go to today"
          >
            Today
          </button>

          <button
            onClick={handleNextDay}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-semibold hover:bg-muted active:scale-95 transition-all text-muted-foreground hover:text-foreground"
            aria-label="Next day"
          >
            Next Day
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Priorities Section */}
        <div className="lg:col-span-5 border border-border bg-card/25 dark:bg-card/10 rounded-2xl p-6 shadow-sm">
          <PrioritiesList />
        </div>

        {/* Timetable Section */}
        <div className="lg:col-span-7 border border-border bg-card/25 dark:bg-card/10 rounded-2xl p-6 shadow-sm">
          <Timetable />
        </div>
      </div>
    </div>
  )
}
