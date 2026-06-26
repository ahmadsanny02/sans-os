/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import {
  usePrioritiesQuery,
  useTogglePriorityMutation,
  useTimetableQuery,
} from "@/hooks/useDaily"
import {
  useDailyTodosQuery,
  useToggleDailyTodoMutation,
  useDailyLogQuery,
} from "@/hooks/useDailyLogs"
import { useHabitsQuery, useToggleLogMutation } from "@/hooks/useHabits"
import { parseISO } from "date-fns"

export function useDashboardPage() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)

  // 1. Fetch data query hooks
  const {
    data: priorities = [],
    isLoading: prioritiesLoading,
    isError: prioritiesError,
  } = usePrioritiesQuery(activeDate)

  const {
    data: todos = [],
    isLoading: todosLoading,
    isError: todosError,
  } = useDailyTodosQuery(activeDate)

  const {
    data: timetableList = [],
    isLoading: timetableLoading,
    isError: timetableError,
  } = useTimetableQuery()

  const {
    data: log,
    isLoading: logLoading,
  } = useDailyLogQuery(activeDate)

  // 2. Habits data
  const {
    data: habitsData,
    isLoading: habitsLoading,
    isError: habitsError,
  } = useHabitsQuery(activeDate, activeDate)

  const todayHabits = (habitsData?.habits || []).map((habit) => {
    const isCompleted = (habitsData?.logs || []).some(
      (log) => log.habitId === habit.id && log.date === activeDate
    )
    return {
      id: habit.id,
      name: habit.name,
      completed: isCompleted,
      isHabit: true as const,
    }
  })

  // 3. Mutations
  const togglePriorityMutation = useTogglePriorityMutation(activeDate)
  const toggleTodoMutation = useToggleDailyTodoMutation(activeDate)
  const toggleHabitMutation = useToggleLogMutation()

  // 3. Greeting determination
  const [greeting, setGreeting] = useState("Good Morning")
  useEffect(() => {
    const currentHour = new Date().getHours()
    if (currentHour >= 12 && currentHour < 17) {
      setGreeting("Good Afternoon")
    } else if (currentHour >= 17 && currentHour < 21) {
      setGreeting("Good Evening")
    } else if (currentHour >= 21 || currentHour < 4) {
      setGreeting("Good Night")
    } else {
      setGreeting("Good Morning")
    }
  }, [])

  // 4. Formatted date string
  const parsedActiveDate = parseISO(activeDate)
  const activeDateStr = parsedActiveDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // 5. Timetable derived state
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const realTodayStr = `${year}-${month}-${day}`

  const currentHourStr = String(now.getHours()).padStart(2, "0")
  const currentMinStr = String(now.getMinutes()).padStart(2, "0")
  const currentTimeStr = `${currentHourStr}:${currentMinStr}`

  const isTodayDate = activeDate === realTodayStr

  const activeDayBlocks = timetableList
    .filter((block) => {
      const activeDayOfWeek = parseISO(activeDate).getDay()
      const isForDay =
        block.dayOfWeek === -1 ||
        block.date === activeDate ||
        (block.dayOfWeek === activeDayOfWeek && !block.date)
      if (!isForDay) return false

      if (isTodayDate) {
        return block.endTime >= currentTimeStr
      }
      return true
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  // 6. Action handlers
  const handleTogglePriority = (id: string, completed: boolean): void => {
    togglePriorityMutation.mutate({ id, completed: !completed })
  }

  const handleToggleTodo = (id: string, completed: boolean): void => {
    toggleTodoMutation.mutate({ id, completed: !completed })
  }

  const handleToggleHabit = (habitId: string): void => {
    toggleHabitMutation.mutate({ habitId, date: activeDate })
  }

  return {
    activeDate,
    activeDateStr,
    greeting,
    // Priorities
    priorities,
    prioritiesLoading,
    prioritiesError,
    handleTogglePriority,
    isPendingTogglePriority: togglePriorityMutation.isPending,
    // Checklist/Todos
    todos,
    todosLoading,
    todosError,
    handleToggleTodo,
    isPendingToggleTodo: toggleTodoMutation.isPending,
    // Habits
    habits: todayHabits,
    habitsLoading,
    habitsError,
    handleToggleHabit,
    isPendingToggleHabit: toggleHabitMutation.isPending,
    // Timetable
    activeDayBlocks,
    timetableLoading,
    timetableError,
    // Pic of the day
    picUrl: log?.picUrl,
    logLoading,
  }
}

export type UseDashboardPageReturn = ReturnType<typeof useDashboardPage>
