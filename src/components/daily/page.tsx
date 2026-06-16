"use client"

import React, { useEffect } from "react"
import { useDailyPage } from "@/hooks/useDailyPage"
import { PrioritiesList } from "./ui/PrioritiesList"
import { DailyTodos } from "./ui/DailyTodos"
import { Timetable } from "./ui/Timetable"
import { DailyReflections } from "./ui/DailyReflections"
import { DailyPics } from "./ui/DailyPics"
import { format } from "date-fns"
import { Clock, Calendar } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function DailyComponent() {
  const dailyData = useDailyPage()
  const { baseDate, handlePrevDay, handleNextDay, handleGoToToday } = dailyData

  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Daily Flow - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4 animate-in fade-in duration-200">
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
          <PrioritiesList
            listPriorities={dailyData.listPriorities}
            isLoading={dailyData.prioritiesLoading}
            isError={dailyData.prioritiesError}
            newText={dailyData.newPriorityText}
            setNewText={dailyData.setNewPriorityText}
            errorMsg={dailyData.priorityErrorMsg}
            handleAddPriority={dailyData.handleAddPriority}
            handleToggleCompleted={dailyData.handleTogglePriority}
            handleDeletePriority={dailyData.handleDeletePriority}
            isPendingCreate={dailyData.priorityCreatePending}
          />
        </div>

        {/* To-Dos Section */}
        <div className="lg:col-span-6 border border-border bg-card/25 dark:bg-card/10 rounded-2xl p-6 shadow-sm">
          <DailyTodos
            todos={dailyData.todos}
            isLoading={dailyData.todosLoading}
            isError={dailyData.todosError}
            newText={dailyData.newTodoText}
            setNewText={dailyData.setNewTodoText}
            errorMsg={dailyData.todoErrorMsg}
            handleAddTodo={dailyData.handleAddTodo}
            handleToggleCompleted={dailyData.handleToggleTodo}
            handleDeleteTodo={dailyData.handleDeleteTodo}
            isPendingCreate={dailyData.todoCreatePending}
          />
        </div>
      </div>

      {/* Timetable Section */}
      <div className="lg:col-span-12 border border-border bg-card/25 dark:bg-card/10 rounded-2xl p-6 shadow-sm">
        <Timetable
          isLoading={dailyData.timetableLoading}
          isError={dailyData.timetableError}
          showAddForm={dailyData.showTimetableAddForm}
          setShowAddForm={dailyData.setShowTimetableAddForm}
          title={dailyData.timetableTitle}
          setTitle={dailyData.setTimetableTitle}
          startTime={dailyData.timetableStartTime}
          setStartTime={dailyData.setTimetableStartTime}
          endTime={dailyData.timetableEndTime}
          setEndTime={dailyData.setTimetableEndTime}
          category={dailyData.timetableCategory}
          setCategory={dailyData.setTimetableCategory}
          scheduleType={dailyData.timetableScheduleType}
          setScheduleType={dailyData.setTimetableScheduleType}
          errorMsg={dailyData.timetableErrorMsg}
          handleAddBlock={dailyData.handleAddTimetableBlock}
          handleDeleteBlock={dailyData.handleDeleteTimetableBlock}
          activeDayBlocks={dailyData.activeDayBlocks}
          isPendingCreate={dailyData.timetableCreatePending}
        />
      </div>

      {/* Reflections & Pics of the Day Section */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6 border border-border bg-card/25 dark:bg-card/10 rounded-2xl p-6 shadow-sm">
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

        <div className="lg:col-span-6 border border-border bg-card/25 dark:bg-card/10 rounded-2xl p-6 shadow-sm">
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
