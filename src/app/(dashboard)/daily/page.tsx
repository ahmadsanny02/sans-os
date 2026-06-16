"use client"

import React, { useEffect } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { PrioritiesList } from "@/components/daily/PrioritiesList"
import { Timetable } from "@/components/daily/Timetable"
import { DailyTodos } from "@/components/daily/DailyTodos"
import { DailyReflections } from "@/components/daily/DailyReflections"
import { DailyPics } from "@/components/daily/DailyPics"
import { format, parseISO, addDays, subDays } from "date-fns"
import { Clock, Calendar } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

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
    <div className="mx-auto max-w-7xl space-y-8 py-4">
      <HeaderPage
        title="Daily Flow"
        icon={<Clock className="h-7 w-7 text-violet-500 shrink-0" />}
        description={
          <div className="flex items-center gap-1.5 mt-1">
            <Calendar className="h-4 w-4 text-violet-500" />
            <span>
              Active Date: <span className="font-semibold text-foreground">{format(baseDate, "MMMM d, yyyy")}</span>
            </span>
          </div>
        }
        showNavigation
        onPrevious={handlePrevDay}
        onNext={handleNextDay}
        onToday={handleGoToToday}
        prevLabel="Previous Day"
        nextLabel="Next Day"
      />

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-12">

        {/* Priorities Section */}
        <div className="lg:col-span-6 border border-border bg-card/25 dark:bg-card/10 rounded-2xl p-6 shadow-sm">
          <PrioritiesList />
        </div>

        {/* To-Dos Section */}
        <div className="lg:col-span-6 border border-border bg-card/25 dark:bg-card/10 rounded-2xl p-6 shadow-sm">
          <DailyTodos />
        </div>

      </div>

      {/* Timetable Section */}
      <div className="lg:col-span-7 border border-border bg-card/25 dark:bg-card/10 rounded-2xl p-6 shadow-sm">
        <Timetable />
      </div>

      {/* Reflections & Pics of the Day Section */}
      <div className="grid gap-8 lg:grid-cols-12">

        <div className="lg:col-span-6 border border-border bg-card/25 dark:bg-card/10 rounded-2xl p-6 shadow-sm">
          <DailyReflections />
        </div>

        <div className="lg:col-span-6 border border-border bg-card/25 dark:bg-card/10 rounded-2xl p-6 shadow-sm">
          <DailyPics />
        </div>

      </div>
    </div>
  )
}
