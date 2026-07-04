"use client"

import React, { useState, useEffect } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import {
  usePrioritiesQuery,
  useCreatePriorityMutation,
  useTogglePriorityMutation,
  useDeletePriorityMutation,
  useTimetableQuery,
  useCreateTimetableBlockMutation,
  useDeleteTimetableBlockMutation,
} from "@/hooks/useDaily"
import {
  useDailyTodosQuery,
  useCreateDailyTodoMutation,
  useToggleDailyTodoMutation,
  useDeleteDailyTodoMutation,
  useDailyLogQuery,
  useSaveDailyLogMutation,
} from "@/hooks/useDailyLogs"
import {
  useHabitsQuery,
  useToggleLogMutation,
} from "@/hooks/useHabits"
import { format, parseISO, addDays, subDays } from "date-fns"
import { confirmDestructive, showError, showSuccessToast } from "@/lib/sweetalert"

type TabType = "journal" | "gratitude" | "notes"

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  const hStr = h.toString().padStart(2, "0")
  const mStr = m.toString().padStart(2, "0")
  return `${hStr}:${mStr}`
}

const CATEGORY_COLORS: Record<string, string> = {
  Personal: "teal",
  Work: "blue",
  Business: "indigo",
  Playing: "pink",
  Social: "purple",
  Education: "orange",
  Project: "red",
  Family: "green",
  General: "slate",
}

export function useDailyPage() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)
  const setActiveDate = useWorkspaceStore((state) => state.setActiveDate)

  const baseDate = parseISO(activeDate)

  // Unified form states
  const [entryTitle, setEntryTitle] = useState("")
  const [entryLink, setEntryLink] = useState("")
  const [targetTimetable, setTargetTimetable] = useState(false)
  const [targetTodo, setTargetTodo] = useState(true)
  const [targetPriority, setTargetPriority] = useState(false)
  const [combinedErrorMsg, setCombinedErrorMsg] = useState<string | null>(null)
  const [isPendingCombined, setIsPendingCombined] = useState(false)

  const [todoDate, setTodoDate] = useState(activeDate)
  const [priorityDate, setPriorityDate] = useState(activeDate)

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

  const handleAddDailyEntry = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setCombinedErrorMsg(null)
    if (!entryTitle.trim()) return

    setIsPendingCombined(true)
    try {
      const promises: Promise<unknown>[] = []

      if (targetTimetable) {
        if (timetableStartTime >= timetableEndTime) {
          throw new Error("End time must be after start time.")
        }

        let targetDayOfWeek = -1
        let targetDate: string | undefined = undefined

        if (timetableScheduleType === "fixed") {
          targetDayOfWeek = -1
          targetDate = undefined
        } else if (timetableScheduleType === "weekly") {
          targetDayOfWeek = timetableDayOfWeek
          targetDate = undefined
        } else {
          targetDayOfWeek = parseISO(timetableDate).getDay()
          targetDate = timetableDate
        }

        promises.push(
          createBlockMutation.mutateAsync({
            dayOfWeek: targetDayOfWeek,
            startTime: timetableStartTime,
            endTime: timetableEndTime,
            title: entryTitle.trim(),
            category: timetableCategory,
            color: CATEGORY_COLORS[timetableCategory] || "blue",
            date: targetDate,
            isTodo: timetableIsTodo,
            link: entryLink.trim() || undefined,
          })
        )
      }

      if (targetTodo) {
        promises.push(
          createTodoMutation.mutateAsync({
            date: todoDate,
            text: entryTitle.trim(),
            link: entryLink.trim() || undefined,
          })
        )
      }

      if (targetPriority) {
        if (priorityDate === activeDate && listPriorities.length >= 5) {
          throw new Error("You can only have a maximum of 5 priorities per day.")
        }
        promises.push(
          createPriorityMutation.mutateAsync({
            date: priorityDate,
            text: entryTitle.trim(),
            orderIndex: priorityDate === activeDate ? listPriorities.length : undefined,
            link: entryLink.trim() || undefined,
          })
        )
      }

      if (promises.length === 0) {
        throw new Error("Please select at least one destination (Timetable, Task, or Priority).")
      }

      await Promise.all(promises)
      setEntryTitle("")
      setEntryLink("")
      // Uncheck timetable & priority to reset cleanly, leave todo checked by default
      setTargetTimetable(false)
      setTargetPriority(false)
      setTodoDate(activeDate)
      setPriorityDate(activeDate)
      showSuccessToast("Daily Flow item added")
    } catch (err) {
      setCombinedErrorMsg(err instanceof Error ? err.message : "Failed to add entry")
    } finally {
      setIsPendingCombined(false)
    }
  }

  // ==========================================
  // Priorities State & Handlers
  // ==========================================
  const { data: listPriorities = [], isLoading: prioritiesLoading, isError: prioritiesError } = usePrioritiesQuery(activeDate)
  const createPriorityMutation = useCreatePriorityMutation()
  const togglePriorityMutation = useTogglePriorityMutation(activeDate)
  const deletePriorityMutation = useDeletePriorityMutation()

  const handleTogglePriority = (id: string, completed: boolean): void => {
    togglePriorityMutation.mutate({ id, completed: !completed })
  }

  const handleDeletePriority = async (id: string): Promise<void> => {
    const isConfirmed = await confirmDestructive(
      "Delete Priority",
      "Are you sure you want to delete this priority?"
    )
    if (!isConfirmed) return
    try {
      await deletePriorityMutation.mutateAsync(id)
      showSuccessToast("Priority deleted")
    } catch {
      await showError("Error", "Failed to delete priority.")
    }
  }

  // ==========================================
  // Todos State & Handlers
  // ==========================================
  const { data: todos = [], isLoading: todosLoading, isError: todosError } = useDailyTodosQuery(activeDate)
  const createTodoMutation = useCreateDailyTodoMutation()
  const toggleTodoMutation = useToggleDailyTodoMutation(activeDate)
  const deleteTodoMutation = useDeleteDailyTodoMutation(activeDate)

  const handleToggleTodo = (id: string, completed: boolean): void => {
    toggleTodoMutation.mutate({ id, completed: !completed })
  }

  const handleDeleteTodo = async (id: string): Promise<void> => {
    const isConfirmed = await confirmDestructive(
      "Delete Todo",
      "Are you sure you want to delete this todo item?"
    )
    if (!isConfirmed) return
    try {
      await deleteTodoMutation.mutateAsync(id)
      showSuccessToast("Todo deleted")
    } catch {
      await showError("Error", "Failed to delete todo.")
    }
  }

  // ==========================================
  // Habits Sync State & Handlers
  // ==========================================
  const { data: habitsData, isLoading: habitsLoading, isError: habitsError } = useHabitsQuery(activeDate, activeDate)
  const toggleHabitMutation = useToggleLogMutation()

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

  const handleToggleHabit = (habitId: string): void => {
    toggleHabitMutation.mutate({ habitId, date: activeDate })
  }

  // ==========================================
  // Timetable State & Handlers
  // ==========================================
  const { data: timetableList = [], isLoading: timetableLoading, isError: timetableError } = useTimetableQuery()
  const createBlockMutation = useCreateTimetableBlockMutation()
  const deleteBlockMutation = useDeleteTimetableBlockMutation()

  const [showTimetableAddForm, setShowTimetableAddForm] = useState(false)
  const [timetableTitle, setTimetableTitle] = useState("")
  const [timetableStartTime, _setTimetableStartTime] = useState("08:00")
  const [timetableEndTime, _setTimetableEndTime] = useState("09:00")
  const [timetableDuration, _setTimetableDuration] = useState("60")
  const [timetableIsTodo, setTimetableIsTodo] = useState(false)
  const [timetableCategory, setTimetableCategory] = useState("General")
  const [timetableErrorMsg, setTimetableErrorMsg] = useState<string | null>(null)
  const [timetableScheduleType, setTimetableScheduleType] = useState<"custom" | "weekly" | "fixed">("custom")
  const [prevActiveDate, setPrevActiveDate] = useState(activeDate)
  const [timetableDate, setTimetableDate] = useState(activeDate)
  const [timetableDayOfWeek, setTimetableDayOfWeek] = useState(() => parseISO(activeDate).getDay())

  if (activeDate !== prevActiveDate) {
    setPrevActiveDate(activeDate)
    setTimetableDate(activeDate)
    setTimetableDayOfWeek(parseISO(activeDate).getDay())
    setTodoDate(activeDate)
    setPriorityDate(activeDate)
  }

  const setTimetableStartTime = (newVal: string) => {
    _setTimetableStartTime(newVal)
    if (timetableDuration) {
      const dur = parseInt(timetableDuration, 10)
      if (!isNaN(dur) && dur > 0) {
        const startMins = timeToMinutes(newVal)
        const endMins = startMins + dur
        _setTimetableEndTime(minutesToTime(endMins))
      }
    }
  }

  const setTimetableEndTime = (newVal: string) => {
    _setTimetableEndTime(newVal)
    if (timetableStartTime) {
      const startMins = timeToMinutes(timetableStartTime)
      const endMins = timeToMinutes(newVal)
      let diff = endMins - startMins
      if (diff < 0) diff += 24 * 60
      _setTimetableDuration(diff.toString())
    }
  }

  const setTimetableDuration = (newVal: string) => {
    _setTimetableDuration(newVal)
    const dur = parseInt(newVal, 10)
    if (!isNaN(dur) && dur > 0 && timetableStartTime) {
      const startMins = timeToMinutes(timetableStartTime)
      const endMins = startMins + dur
      _setTimetableEndTime(minutesToTime(endMins))
    }
  }

  const activeDayOfWeek = parseISO(activeDate).getDay()
  const activeDayBlocks = timetableList
    .filter((block) => block.dayOfWeek === -1 || block.date === activeDate || (block.dayOfWeek === activeDayOfWeek && !block.date))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))



  const handleDeleteTimetableBlock = async (id: string): Promise<void> => {
    const isConfirmed = await confirmDestructive(
      "Delete Schedule Block",
      "Are you sure you want to delete this time block?"
    )
    if (!isConfirmed) return
    try {
      await deleteBlockMutation.mutateAsync(id)
      showSuccessToast("Schedule block deleted")
    } catch {
      await showError("Error", "Failed to delete schedule block.")
    }
  }

  // ==========================================
  // Reflections State & Handlers
  // ==========================================
  const { data: log, isLoading: logLoading } = useDailyLogQuery(activeDate)
  const saveLogMutation = useSaveDailyLogMutation()

  const [activeReflectionTab, setActiveReflectionTab] = useState<TabType>("journal")
  const [journal, setJournal] = useState("")
  const [notes, setNotes] = useState("")
  const [gratitude, setGratitude] = useState("")

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJournal(log?.journal || "")
    setNotes(log?.notes || "")
    setGratitude(log?.gratitude || "")
  }, [log])

  const handleSaveReflections = async (): Promise<void> => {
    try {
      await saveLogMutation.mutateAsync({
        date: activeDate,
        journal,
        notes,
        gratitude,
      })
      showSuccessToast("Reflections saved")
    } catch (err) {
      console.error("Failed to save reflections", err)
      await showError("Save Failed", "Failed to save your reflections. Please try again.")
    }
  }

  // ==========================================
  // Pic of the Day State & Handlers
  // ==========================================
  const [isUploadingPic, setIsUploadingPic] = useState(false)
  const [picErrorMsg, setPicErrorMsg] = useState<string | null>(null)

  const picUrl = log?.picUrl || undefined

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPic(true)
    setPicErrorMsg(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("date", activeDate)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to upload image")
      }

      const data = await res.json()

      await saveLogMutation.mutateAsync({
        date: activeDate,
        picUrl: data.url,
      })
      showSuccessToast("Photo uploaded successfully")
    } catch (err) {
      setPicErrorMsg(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setIsUploadingPic(false)
    }
  }

  const handleDeletePic = async (): Promise<void> => {
    const isConfirmed = await confirmDestructive(
      "Remove Photo",
      "Are you sure you want to remove today's photo?"
    )
    if (!isConfirmed) return
    setPicErrorMsg(null)
    try {
      await saveLogMutation.mutateAsync({
        date: activeDate,
        picUrl: "",
      })
      showSuccessToast("Photo removed successfully")
    } catch (err) {
      console.error(err)
      setPicErrorMsg("Failed to remove photo")
      await showError("Error", "Failed to remove photo")
    }
  }

  return {
    activeDate,
    baseDate,
    handlePrevDay,
    handleNextDay,
    handleGoToToday,

    // Unified Entry states
    entryTitle,
    setEntryTitle,
    entryLink,
    setEntryLink,
    targetTimetable,
    setTargetTimetable,
    targetTodo,
    setTargetTodo,
    targetPriority,
    setTargetPriority,
    todoDate,
    setTodoDate,
    priorityDate,
    setPriorityDate,
    combinedErrorMsg,
    setCombinedErrorMsg,
    isPendingCombined,
    handleAddDailyEntry,

    // Priorities
    listPriorities,
    prioritiesLoading,
    prioritiesError,
    handleTogglePriority,
    handleDeletePriority,
    priorityCreatePending: createPriorityMutation.isPending,
    priorityTogglePending: togglePriorityMutation.isPending,

    // Todos
    todos,
    todosLoading,
    todosError,
    handleToggleTodo,
    handleDeleteTodo,
    todoCreatePending: createTodoMutation.isPending,
    todoTogglePending: toggleTodoMutation.isPending,

    // Timetable
    timetableList,
    timetableLoading,
    timetableError,
    showTimetableAddForm,
    setShowTimetableAddForm,
    timetableStartTime,
    setTimetableStartTime,
    timetableEndTime,
    setTimetableEndTime,
    timetableDuration,
    setTimetableDuration,
    timetableIsTodo,
    setTimetableIsTodo,
    timetableCategory,
    setTimetableCategory,
    timetableScheduleType,
    setTimetableScheduleType,
    timetableDate,
    setTimetableDate,
    timetableDayOfWeek,
    setTimetableDayOfWeek,
    handleDeleteTimetableBlock,
    activeDayBlocks,
    timetableCreatePending: createBlockMutation.isPending,

    // Reflections
    logLoading,
    activeReflectionTab,
    setActiveReflectionTab,
    journal,
    setJournal,
    notes,
    setNotes,
    gratitude,
    setGratitude,
    handleSaveReflections,
    reflectionsSavePending: saveLogMutation.isPending,

    // Pics
    isUploadingPic,
    picErrorMsg,
    picUrl,
    handleFileChange,
    handleDeletePic,
    picSavePending: saveLogMutation.isPending,

    // Habits Checklist Sync
    habits: todayHabits,
    habitsLoading,
    habitsError,
    handleToggleHabit,
    isPendingToggleHabit: toggleHabitMutation.isPending,
  }
}

export type UseDailyPageReturn = ReturnType<typeof useDailyPage>
