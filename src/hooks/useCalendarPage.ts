"use client"

import { useState, useEffect } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import {
  usePrioritiesQuery,
  usePrioritiesRangeQuery,
  useTogglePriorityMutation,
  useTimetableQuery,
} from "@/hooks/useDaily"
import { format, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns"

export function useCalendarPage() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)

  // Current calendar navigation month
  const [prevActiveDate, setPrevActiveDate] = useState(activeDate)
  const [currentMonth, setCurrentMonth] = useState<Date>(() => parseISO(activeDate))

  // Selected date on calendar to view agenda details
  const [selectedDate, setSelectedDate] = useState<string>(activeDate)

  // Sync state with global store activeDate when it changes from outside
  if (activeDate !== prevActiveDate) {
    setPrevActiveDate(activeDate)
    setSelectedDate(activeDate)
    setCurrentMonth(parseISO(activeDate))
  }

  // Month navigation
  const handlePrevMonth = (): void => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = (): void => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  const handleGoToToday = (): void => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(format(today, "yyyy-MM-dd"))
  }

  // Load details for selected date
  const { data: dayPriorities = [], isLoading: isLoadingPriorities } = usePrioritiesQuery(selectedDate)
  const { data: timetableList = [], isLoading: isLoadingTimetable, isError: isErrorTimetable } = useTimetableQuery()
  const togglePriorityMutation = useTogglePriorityMutation(selectedDate)

  // Generate date bounds for range query (for calendar grid)
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)

  const startDateStr = format(gridStart, "yyyy-MM-dd")
  const endDateStr = format(gridEnd, "yyyy-MM-dd")

  const { data: rangePriorities = [], isLoading: isLoadingRangePriorities, isError: isErrorRangePriorities } =
    usePrioritiesRangeQuery(startDateStr, endDateStr)

  // Compare ongoing/future blocks (real-time updates)
  const realTodayStr = useWorkspaceStore((state) => state.realTodayDate)

  const [currentTimeStr, setCurrentTimeStr] = useState(() => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date()
      setCurrentTimeStr(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`)
    }, 10000) // update clock every 10 seconds
    return () => clearInterval(timer)
  }, [])

  const isSelectedDateToday = selectedDate === realTodayStr

  const activeTimetableBlocks = timetableList
    .filter((block) => {
      const selectedDayOfWeek = parseISO(selectedDate).getDay()
      const isForDay =
        block.dayOfWeek === -1 ||
        block.date === selectedDate ||
        (block.dayOfWeek === selectedDayOfWeek && !block.date)
      if (!isForDay) return false

      if (isSelectedDateToday) {
        return block.endTime >= currentTimeStr
      }
      return true
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const selectedDateFormatted = format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")

  const handleTogglePriority = (id: string, completed: boolean): void => {
    togglePriorityMutation.mutate({ id, completed: !completed })
  }

  const gridLoading = isLoadingRangePriorities || isLoadingTimetable
  const gridError = isErrorRangePriorities || isErrorTimetable

  return {
    currentMonth,
    selectedDate,
    setSelectedDate,
    handlePrevMonth,
    handleNextMonth,
    handleGoToToday,
    dayPriorities,
    isLoadingPriorities,
    timetableList,
    isLoadingTimetable,
    rangePriorities,
    activeTimetableBlocks,
    selectedDateFormatted,
    handleTogglePriority,
    isPendingToggle: togglePriorityMutation.isPending,
    gridLoading,
    gridError,
  }
}

export type UseCalendarPageReturn = ReturnType<typeof useCalendarPage>
