"use client"

import React, { useEffect } from "react"
import { useDashboardPage } from "@/hooks/useDashboardPage"
import { DashboardView } from "./ui/DashboardView"

export function DashboardPageView(): React.JSX.Element {
  const dashboardData = useDashboardPage()

  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Dashboard - SansOS Workspace"
  }, [])

  return (
    <DashboardView
      activeDateStr={dashboardData.activeDateStr}
      greeting={dashboardData.greeting}
      priorities={dashboardData.priorities}
      prioritiesLoading={dashboardData.prioritiesLoading}
      prioritiesError={dashboardData.prioritiesError}
      handleTogglePriority={dashboardData.handleTogglePriority}
      isPendingTogglePriority={dashboardData.isPendingTogglePriority}
      pendingPriorityIds={dashboardData.pendingPriorityIds}
      todos={dashboardData.todos}
      todosLoading={dashboardData.todosLoading}
      todosError={dashboardData.todosError}
      handleToggleTodo={dashboardData.handleToggleTodo}
      handlePromoteTodoToPriority={dashboardData.handlePromoteTodoToPriority}
      isPendingToggleTodo={dashboardData.isPendingToggleTodo}
      pendingTodoIds={dashboardData.pendingTodoIds}
      habits={dashboardData.habits}
      habitsLoading={dashboardData.habitsLoading}
      habitsError={dashboardData.habitsError}
      handleToggleHabit={dashboardData.handleToggleHabit}
      isPendingToggleHabit={dashboardData.isPendingToggleHabit}
      pendingHabitIds={dashboardData.pendingHabitIds}
      activeDayBlocks={dashboardData.activeDayBlocks}
      timetableLoading={dashboardData.timetableLoading}
      timetableError={dashboardData.timetableError}
      picUrl={dashboardData.picUrl}
      logLoading={dashboardData.logLoading}
    />
  )
}

export default DashboardPageView
