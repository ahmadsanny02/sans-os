"use client"

import React, { useEffect } from "react"
import { useCalendarPage } from "@/hooks/useCalendarPage"
import { CalendarView } from "./ui/CalendarView"
import { format } from "date-fns"
import { Calendar } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function CalendarComponent() {
  const calendarData = useCalendarPage()
  const { currentMonth, handlePrevMonth, handleNextMonth, handleGoToToday } = calendarData

  // Update page title
  useEffect(() => {
    document.title = "Calendar View - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4 animate-in fade-in duration-200">
      <HeaderPage
        title="Calendar View"
        icon={<Calendar className="h-7 w-7 text-violet-500 shrink-0" />}
        description="Monthly schedule and tasks visualizer"
        showNavigation
        onPrevious={handlePrevMonth}
        onNext={handleNextMonth}
        onToday={handleGoToToday}
        prevLabel="Previous"
        nextLabel="Next"
        middleContent={
          <span className="text-xs font-bold text-foreground px-3 min-w-[100px] text-center select-none">
            {format(currentMonth, "MMMM yyyy")}
          </span>
        }
        extraActions={<div />}
      />

      {/* Main Grid View */}
      <CalendarView {...calendarData} />
    </div>
  )
}
