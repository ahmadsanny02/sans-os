"use client"

import React, { useEffect } from "react"
import { useHabitsPage } from "@/hooks/useHabitsPage"
import { HabitGrid } from "./ui/HabitGrid"
import { HabitRecaps } from "./ui/HabitRecaps"
import { Calendar, CheckSquare } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function HabitsComponent() {
  const {
    activeDate,
    monthDays,
    isLoadingHabits,
    isErrorHabits,
    listHabits,
    isLogged,
    newHabitName,
    setNewHabitName,
    newHabitCategory,
    setNewHabitCategory,
    newHabitSubCategory,
    setNewHabitSubCategory,
    showAddForm,
    setShowAddForm,
    handleAddHabit,
    handleDeleteHabit,
    handleToggleLog,
    isPendingToggle,
    toggleLogVariables,
    isPendingCreate,

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
    setActiveDate,

    // Reorder
    handleReorderHabits,
    isPendingReorder,

    // Update
    handleUpdateHabit,
    isPendingUpdate,
  } = useHabitsPage()

  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Habit Tracker - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4 animate-in fade-in duration-200">
      <HeaderPage
        title="Habit Tracker"
        icon={<CheckSquare className="h-7 w-7 text-primary shrink-0" />}
        description={
          <div className="flex items-center gap-1.5 mt-1">
            <Calendar className="h-4 w-4 text-primary" />
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
      <HabitRecaps
        isStatsLoading={isStatsLoading}
        totalHabits={totalHabits}
        completedLogsCount={completedLogsCount}
        successRate={successRate}
        chartData={chartData}
      />

      {/* Habit Matrix Grid Checklist */}
      <HabitGrid
        activeDate={activeDate}
        monthDays={monthDays}
        isLoadingHabits={isLoadingHabits}
        isErrorHabits={isErrorHabits}
        listHabits={listHabits}
        isLogged={isLogged}
        newHabitName={newHabitName}
        setNewHabitName={setNewHabitName}
        newHabitCategory={newHabitCategory}
        setNewHabitCategory={setNewHabitCategory}
        newHabitSubCategory={newHabitSubCategory}
        setNewHabitSubCategory={setNewHabitSubCategory}
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        handleAddHabit={handleAddHabit}
        handleDeleteHabit={handleDeleteHabit}
        handleToggleLog={handleToggleLog}
        isPendingToggle={isPendingToggle}
        toggleLogVariables={toggleLogVariables}
        isPendingCreate={isPendingCreate}
        handleReorderHabits={handleReorderHabits}
        isPendingReorder={isPendingReorder}
        onSelectDate={setActiveDate}
        handleUpdateHabit={handleUpdateHabit}
        isPendingUpdate={isPendingUpdate}
      />
    </div>
  )
}
