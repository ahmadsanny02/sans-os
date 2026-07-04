"use client"

import React from "react"
import { Priority } from "@/hooks/useDaily"
import { DailyTodo } from "@/hooks/useDailyLogs"
import { TimetableBlock } from "@/hooks/useDaily"
import { DashboardWidget } from "./DashboardWidget"
import { PrioritiesWidget } from "./PrioritiesWidget"
import { TodosWidget } from "./TodosWidget"
import { TimetableWidget } from "./TimetableWidget"
import { MemoryBoxWidget } from "./MemoryBoxWidget"
import {
  CheckSquare,
  Calendar,
  Briefcase,
  BookOpen,
  Languages,
  Image as ImageIcon,
  TrendingUp,
} from "lucide-react"

interface DashboardViewProps {
  activeDateStr: string
  greeting: string
  // Priorities
  priorities: Priority[]
  prioritiesLoading: boolean
  prioritiesError: boolean
  handleTogglePriority: (id: string, completed: boolean) => void
  isPendingTogglePriority: boolean
  // Checklist/Todos
  todos: DailyTodo[]
  todosLoading: boolean
  todosError: boolean
  handleToggleTodo: (id: string, completed: boolean) => void
  isPendingToggleTodo: boolean
  // Habits
  habits: { id: string; name: string; completed: boolean; isHabit: true }[]
  habitsLoading: boolean
  habitsError: boolean
  handleToggleHabit: (id: string) => void
  isPendingToggleHabit: boolean
  // Timetable
  activeDayBlocks: TimetableBlock[]
  timetableLoading: boolean
  timetableError: boolean
  // Pic of the day
  picUrl: string | null | undefined
  logLoading: boolean
}

export function DashboardView({
  activeDateStr,
  greeting,
  priorities,
  prioritiesLoading,
  prioritiesError,
  handleTogglePriority,
  isPendingTogglePriority,
  todos,
  todosLoading,
  todosError,
  handleToggleTodo,
  isPendingToggleTodo,
  habits,
  habitsLoading,
  habitsError,
  handleToggleHabit,
  isPendingToggleHabit,
  activeDayBlocks,
  timetableLoading,
  timetableError,
  picUrl,
  logLoading,
}: DashboardViewProps) {
  return (
    <div className="mx-auto max-w-7xl gap-6 flex flex-col py-4">
      {/* Header welcome banner */}
      <div className="bento-card relative overflow-hidden p-6 md:p-8 bg-gradient-to-br from-primary/10 via-card/50 to-primary/5">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <TrendingUp className="h-3.5 w-3.5" /> Workspace Active
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">
            {greeting}, Ahmad Sani Jabarulloh
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            {activeDateStr} • Manage your daily priorities and monitor your personal life operating system.
          </p>
        </div>
      </div>

      {/* Module Shortcuts Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <DashboardWidget
          title="Habits"
          description="Track monthly habits"
          href="/habits"
          icon={CheckSquare}
        />
        <DashboardWidget
          title="Daily Flow"
          description="Priorities & timetable"
          href="/daily"
          icon={Calendar}
        />
        <DashboardWidget
          title="Projects"
          description="Manage tasks & boards"
          href="/projects"
          icon={Briefcase}
        />
        <DashboardWidget
          title="Reading"
          description="Digital book logs"
          href="/reading"
          icon={BookOpen}
        />
        <DashboardWidget
          title="Language"
          description="Vocab review engine"
          href="/language"
          icon={Languages}
        />
        <DashboardWidget
          title="Vision Board"
          description="Interactive goal canvas"
          href="/vision-board"
          icon={ImageIcon}
        />
      </div>

      {/* Widgets Workspace */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (lg:col-span-5) - Priorities & Checklist */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <PrioritiesWidget
            priorities={priorities}
            isLoading={prioritiesLoading}
            isError={prioritiesError}
            handleToggle={handleTogglePriority}
            isPendingToggle={isPendingTogglePriority}
          />
          <TodosWidget
            todos={todos}
            isLoading={todosLoading || habitsLoading}
            isError={todosError || habitsError}
            handleToggle={handleToggleTodo}
            isPendingToggle={isPendingToggleTodo}
            habits={habits}
            handleToggleHabit={handleToggleHabit}
            isPendingToggleHabit={isPendingToggleHabit}
          />

          <MemoryBoxWidget
            picUrl={picUrl}
            isLoading={logLoading}
          />
        </div>

        {/* Right Column (lg:col-span-7) - Timetable */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <TimetableWidget
            activeDayBlocks={activeDayBlocks}
            isLoading={timetableLoading}
            isError={timetableError}
          />
        </div>
      </div>
    </div>
  )
}
