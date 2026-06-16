"use client"

import React, { useEffect } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { PrioritiesList } from "@/components/daily/PrioritiesList"
import { Timetable } from "@/components/daily/Timetable"
import { CalendarDatePicker } from "@/components/daily/CalendarDatePicker"
import { DailyTodos } from "@/components/daily/DailyTodos"
import { DailyReflections } from "@/components/daily/DailyReflections"
import { DailyPics } from "@/components/daily/DailyPics"
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
        <div className="flex items-center gap-1 bg-secondary/30 border border-border/60 p-1.5 rounded-xl shadow-inner backdrop-blur-md self-start sm:self-center">
          <button
            onClick={handlePrevDay}
            className="inline-flex h-8 w-8 sm:w-auto sm:px-3 items-center justify-center rounded-lg hover:bg-background/80 hover:text-foreground text-muted-foreground transition-all duration-200 active:scale-95 text-xs font-medium"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-1 shrink-0" />
            <span className="hidden sm:inline">Previous Day</span>
          </button>
          
          <button
            onClick={handleGoToToday}
            className="inline-flex h-8 px-3 items-center justify-center rounded-lg bg-background text-foreground shadow-sm border border-border/40 hover:bg-background/80 transition-all duration-200 active:scale-95 text-xs font-semibold"
            aria-label="Go to today"
          >
            Today
          </button>

          <button
            onClick={handleNextDay}
            className="inline-flex h-8 w-8 sm:w-auto sm:px-3 items-center justify-center rounded-lg hover:bg-background/80 hover:text-foreground text-muted-foreground transition-all duration-200 active:scale-95 text-xs font-medium"
            aria-label="Next day"
          >
            <span className="hidden sm:inline">Next Day</span>
            <ChevronRight className="h-4 w-4 sm:ml-1 shrink-0" />
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

      {/* Row 2: To-Dos, Reflections & Pics */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* To-Dos Section */}
        <div className="lg:col-span-5 border border-border bg-card/25 dark:bg-card/10 rounded-2xl p-6 shadow-sm">
          <DailyTodos />
        </div>

        {/* Reflections & Pics of the Day Section */}
        <div className="lg:col-span-7 border border-border bg-card/25 dark:bg-card/10 rounded-2xl p-6 shadow-sm space-y-8">
          <DailyReflections />
          <div className="border-t border-border/60 pt-6">
            <DailyPics />
          </div>
        </div>
      </div>
    </div>
  )
}
