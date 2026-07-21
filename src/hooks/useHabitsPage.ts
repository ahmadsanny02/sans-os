"use client"

import React, { useState } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import {
  useHabitsQuery,
  useCreateHabitMutation,
  useToggleLogMutation,
  useDeleteHabitMutation,
  useHabitStatsQuery,
  useReorderHabitsMutation,
} from "@/hooks/useHabits"
import { format, parseISO, startOfWeek, addDays, getDaysInMonth, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns"
import { confirmDestructive, showError, showSuccessToast } from "@/lib/sweetalert"

export function useHabitsPage() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)
  const setActiveDate = useWorkspaceStore((state) => state.setActiveDate)
  const userConfig = useWorkspaceStore((state) => state.userConfig)

  // Compute active month dates
  const baseDate = parseISO(activeDate)
  const monthStart = startOfMonth(baseDate)
  const monthEnd = endOfMonth(baseDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDateStr = format(monthStart, "yyyy-MM-dd")
  const endDateStr = format(monthEnd, "yyyy-MM-dd")

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

  // React Query Hooks
  const habitsQuery = useHabitsQuery(startDateStr, endDateStr)
  const createHabitMutation = useCreateHabitMutation()
  const toggleLogMutation = useToggleLogMutation()
  const deleteHabitMutation = useDeleteHabitMutation()
  const reorderHabitsMutation = useReorderHabitsMutation()

  // Form states
  const [newHabitName, setNewHabitName] = useState("")
  const [newHabitCategory, setNewHabitCategory] = useState("Health & Fitness")
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddHabit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!newHabitName.trim()) return

    try {
      await createHabitMutation.mutateAsync({
        name: newHabitName,
        category: newHabitCategory,
      })
      setNewHabitName("")
      setShowAddForm(false)
      showSuccessToast("Habit added successfully")
    } catch (err) {
      console.error(err)
      showError("Error", "Failed to add habit.")
    }
  }

  const handleDeleteHabit = async (id: string): Promise<void> => {
    const isConfirmed = await confirmDestructive(
      "Delete Habit",
      "Are you sure you want to delete this habit? All check-ins will be deleted."
    )
    if (!isConfirmed) return
    try {
      await deleteHabitMutation.mutateAsync(id)
      showSuccessToast("Habit deleted successfully")
    } catch (err) {
      console.error(err)
      showError("Error", "Failed to delete habit.")
    }
  }

  const handleToggleLog = (habitId: string, date: string): void => {
    toggleLogMutation.mutate({ habitId, date })
  }

  const handleReorderHabits = async (orderedIds: string[]): Promise<void> => {
    try {
      await reorderHabitsMutation.mutateAsync(orderedIds)
      showSuccessToast("Habits reordered")
    } catch (err) {
      console.error(err)
      showError("Error", "Failed to reorder habits.")
    }
  }

  const listHabits = habitsQuery.data?.habits || []
  const logs = habitsQuery.data?.logs || []

  // Helper check-in check
  const isLogged = (habitId: string, dateStr: string): boolean => {
    return logs.some((l) => l.habitId === habitId && l.date === dateStr && l.status.toLowerCase() === "completed")
  }

  // --- RECAPS LOGIC ---
  const weekStart = startOfWeek(baseDate, { weekStartsOn: userConfig.startOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Calculate Active Month stats
  const currentMonthStr = activeDate.substring(0, 7) // "YYYY-MM"
  const statsQuery = useHabitStatsQuery(currentMonthStr)

  const isStatsLoading = statsQuery.isLoading || habitsQuery.isLoading

  // Prepare weekly chart data from monthlyData logs in-memory
  const chartData = weekDays.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd")
    const completions = logs.filter((l) => l.date === dayStr && l.status.toLowerCase() === "completed").length || 0
    return {
      dayLabel: format(day, "EEE"),
      completions,
    }
  })

  // Calculate monthly metrics
  const daysInMonth = getDaysInMonth(baseDate)
  const totalHabits = statsQuery.data?.totalHabits || 0
  const completedLogsCount = statsQuery.data?.completedCount || 0
  const totalTargetOpportunity = totalHabits * daysInMonth
  const successRate = totalTargetOpportunity > 0 
    ? Math.round((completedLogsCount / totalTargetOpportunity) * 100) 
    : 0

  return {
    activeDate,
    monthDays,
    isLoadingHabits: habitsQuery.isLoading,
    isErrorHabits: habitsQuery.isError,
    listHabits,
    isLogged,
    newHabitName,
    setNewHabitName,
    newHabitCategory,
    setNewHabitCategory,
    showAddForm,
    setShowAddForm,
    handleAddHabit,
    handleDeleteHabit,
    handleToggleLog,
    isPendingToggle: toggleLogMutation.isPending,
    toggleLogVariables: toggleLogMutation.variables,
    isPendingCreate: createHabitMutation.isPending,
    
    // Recaps Data
    isStatsLoading,
    totalHabits,
    completedLogsCount,
    successRate,
    chartData,

    // Navigation
    activeMonthFormatted,
    handlePrevMonth,
    handleNextMonth,
    handleGoToToday,

    // Reorder
    handleReorderHabits,
    isPendingReorder: reorderHabitsMutation.isPending,
  }
}

export type UseHabitsPageReturn = ReturnType<typeof useHabitsPage>
