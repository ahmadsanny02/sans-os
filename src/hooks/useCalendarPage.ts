"use client"

import { useState, useEffect, useMemo } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import {
  usePrioritiesQuery,
  usePrioritiesRangeQuery,
  useTogglePriorityMutation,
  useTimetableQuery,
} from "@/hooks/useDaily"
import { useProjectsQuery } from "@/hooks/useProjects"
import {
  format,
  parseISO,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns"

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
  const { data: projectsList = [], isLoading: isLoadingProjects } = useProjectsQuery()
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

  // --- Master Schedule / All Agendas (Month & Year filtering) ---
  const [agendaMonth, setAgendaMonth] = useState<number>(() => currentMonth.getMonth())
  const [agendaYear, setAgendaYear] = useState<number>(() => currentMonth.getFullYear())
  const [prevNavMonth, setPrevNavMonth] = useState<Date>(currentMonth)
  const [agendaTypeFilter, setAgendaTypeFilter] = useState<string>("all")
  const [agendaSearch, setAgendaSearch] = useState<string>("")

  // Keep agenda month/year aligned when calendar navigation month changes
  if (currentMonth !== prevNavMonth) {
    setPrevNavMonth(currentMonth)
    setAgendaMonth(currentMonth.getMonth())
    setAgendaYear(currentMonth.getFullYear())
  }

  // Date range for All Agendas section
  const agendaMonthDate = useMemo(() => new Date(agendaYear, agendaMonth, 1), [agendaYear, agendaMonth])
  const agendaMonthStart = useMemo(() => startOfMonth(agendaMonthDate), [agendaMonthDate])
  const agendaMonthEnd = useMemo(() => endOfMonth(agendaMonthStart), [agendaMonthStart])

  const agendaStartDateStr = useMemo(() => format(agendaMonthStart, "yyyy-MM-dd"), [agendaMonthStart])
  const agendaEndDateStr = useMemo(() => format(agendaMonthEnd, "yyyy-MM-dd"), [agendaMonthEnd])

  const { data: agendaPriorities = [], isLoading: isLoadingAgendaPriorities } =
    usePrioritiesRangeQuery(agendaStartDateStr, agendaEndDateStr)

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
    // Master Schedule / All Agendas
    agendaMonth,
    setAgendaMonth,
    agendaYear,
    setAgendaYear,
    agendaTypeFilter,
    setAgendaTypeFilter,
    agendaSearch,
    setAgendaSearch,
    agendaMonthStart,
    agendaMonthEnd,
    agendaPriorities,
    isLoadingAgendaPriorities,
    projectsList,
    isLoadingProjects,
  }
}

export type UseCalendarPageReturn = ReturnType<typeof useCalendarPage>
