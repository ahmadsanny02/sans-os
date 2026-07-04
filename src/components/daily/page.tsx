"use client"

import React, { useEffect, useState } from "react"
import { useDailyPage } from "@/hooks/useDailyPage"
import { AddDailyEntryCard } from "./ui/AddDailyEntryCard"
import { PrioritiesList } from "./ui/PrioritiesList"
import { DailyTodos } from "./ui/DailyTodos"
import { Timetable } from "./ui/Timetable"
import { DailyReflections } from "./ui/DailyReflections"
import { DailyPics } from "./ui/DailyPics"
import { format } from "date-fns"
import { Clock, Calendar, Plus } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function DailyComponent() {
  const dailyData = useDailyPage()
  const { baseDate, handlePrevDay, handleNextDay, handleGoToToday } = dailyData
  const [showAddForm, setShowAddForm] = useState(false)

  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Daily Flow - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl gap-6 flex flex-col py-4 animate-in fade-in duration-200">
      <HeaderPage
        title="Daily Flow"
        icon={<Clock className="h-7 w-7 text-primary shrink-0" />}
        description={
          <div className="flex items-center gap-1.5 mt-1">
            <Calendar className="h-4 w-4 text-primary" />
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

      {/* Unified Add Card */}
      {!showAddForm ? (
        <div className="flex justify-start">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border/60 bg-card/40 hover:bg-card/75 text-foreground hover:border-primary/20 transition-all font-semibold shadow-glass hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <Plus className="h-5 w-5 text-primary" />
            <span>Add Flow Item</span>
          </button>
        </div>
      ) : (
        <AddDailyEntryCard
          entryTitle={dailyData.entryTitle}
          setEntryTitle={dailyData.setEntryTitle}
          entryLink={dailyData.entryLink}
          setEntryLink={dailyData.setEntryLink}
          targetTimetable={dailyData.targetTimetable}
          setTargetTimetable={dailyData.setTargetTimetable}
          targetTodo={dailyData.targetTodo}
          setTargetTodo={dailyData.setTargetTodo}
          targetPriority={dailyData.targetPriority}
          setTargetPriority={dailyData.setTargetPriority}
          combinedErrorMsg={dailyData.combinedErrorMsg}
          isPendingCombined={dailyData.isPendingCombined}
          handleAddDailyEntry={dailyData.handleAddDailyEntry}
          timetableStartTime={dailyData.timetableStartTime}
          setTimetableStartTime={dailyData.setTimetableStartTime}
          timetableEndTime={dailyData.timetableEndTime}
          setTimetableEndTime={dailyData.setTimetableEndTime}
          timetableDuration={dailyData.timetableDuration}
          setTimetableDuration={dailyData.setTimetableDuration}
          timetableIsTodo={dailyData.timetableIsTodo}
          setTimetableIsTodo={dailyData.setTimetableIsTodo}
          timetableCategory={dailyData.timetableCategory}
          setTimetableCategory={dailyData.setTimetableCategory}
          timetableScheduleType={dailyData.timetableScheduleType}
          setTimetableScheduleType={dailyData.setTimetableScheduleType}
          chooseDate={dailyData.chooseDate}
          setChooseDate={dailyData.setChooseDate}
          timetableDayOfWeek={dailyData.timetableDayOfWeek}
          setTimetableDayOfWeek={dailyData.setTimetableDayOfWeek}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* Main Content */}
      <div className="grid gap-6 grid-cols-12">
        {/* Priorities Section */}
        <div className="col-span-12 lg:col-span-6 bento-card p-6">
          <PrioritiesList
            listPriorities={dailyData.listPriorities}
            isLoading={dailyData.prioritiesLoading}
            isError={dailyData.prioritiesError}
            handleToggleCompleted={dailyData.handleTogglePriority}
            handleDeletePriority={dailyData.handleDeletePriority}
            isPendingToggle={dailyData.priorityTogglePending}
          />
        </div>

        {/* To-Dos Section */}
        <div className="col-span-12 lg:col-span-6 bento-card p-6">
          <DailyTodos
            todos={dailyData.todos}
            isLoading={dailyData.todosLoading || dailyData.habitsLoading}
            isError={dailyData.todosError || dailyData.habitsError}
            handleToggleCompleted={dailyData.handleToggleTodo}
            handleDeleteTodo={dailyData.handleDeleteTodo}
            isPendingToggleTodo={dailyData.todoTogglePending}
            habits={dailyData.habits}
            handleToggleHabit={dailyData.handleToggleHabit}
            isPendingToggleHabit={dailyData.isPendingToggleHabit}
          />
        </div>
      </div>

      {/* Timetable Section */}
      <div className="lg:col-span-12 bento-card p-6">
        <Timetable
          isLoading={dailyData.timetableLoading}
          isError={dailyData.timetableError}
          handleDeleteBlock={dailyData.handleDeleteTimetableBlock}
          activeDayBlocks={dailyData.activeDayBlocks}
        />
      </div>

      {/* Reflections & Pics of the Day Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 bento-card p-6">
          <DailyReflections
            isLoading={dailyData.logLoading}
            activeTab={dailyData.activeReflectionTab}
            setActiveTab={dailyData.setActiveReflectionTab}
            journal={dailyData.journal}
            setJournal={dailyData.setJournal}
            notes={dailyData.notes}
            setNotes={dailyData.setNotes}
            gratitude={dailyData.gratitude}
            setGratitude={dailyData.setGratitude}
            handleSave={dailyData.handleSaveReflections}
            isPendingSave={dailyData.reflectionsSavePending}
          />
        </div>

        <div className="lg:col-span-6 bento-card p-6">
          <DailyPics
            isLoading={dailyData.logLoading}
            isUploading={dailyData.isUploadingPic}
            errorMsg={dailyData.picErrorMsg}
            picUrl={dailyData.picUrl}
            handleFileChange={dailyData.handleFileChange}
            handleDelete={dailyData.handleDeletePic}
            isPendingSave={dailyData.picSavePending}
          />
        </div>
      </div>
    </div>
  )
}
