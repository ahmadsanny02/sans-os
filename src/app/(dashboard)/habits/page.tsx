"use client"

import React, { useEffect } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { HabitGrid } from "@/components/habits/HabitGrid"
import { HabitRecaps } from "@/components/habits/HabitRecaps"
import { format, parseISO, addMonths, subMonths } from "date-fns"
import { Calendar, CheckSquare } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

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
      <HeaderPage
        title="Habit Tracker"
        icon={<CheckSquare className="h-7 w-7 text-violet-500 shrink-0" />}
        description={
          <div className="flex items-center gap-1.5 mt-1">
            <Calendar className="h-4 w-4 text-violet-500" />
            <span>
              Active Month: <span className="font-semibold text-foreground">{activeMonthFormatted}</span>
            </span>
          </div>
        }
        showNavigation
        onPrevious={handlePrevMonth}
        onNext={handleNextMonth}
        onToday={handleGoToToday}
        prevLabel="Previous Month"
        nextLabel="Next Month"
      />

      {/* Recaps and Statistics Widgets */}
      <HabitRecaps />

      {/* Habit Matrix Grid Checklist */}
      <HabitGrid />
    </div>
  )
}
