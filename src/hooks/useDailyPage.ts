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
import { format, parseISO, addDays, subDays } from "date-fns"
import { confirmDestructive, showError, showSuccessToast } from "@/lib/sweetalert"

type TabType = "journal" | "gratitude" | "notes"

export function useDailyPage() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)
  const setActiveDate = useWorkspaceStore((state) => state.setActiveDate)

  const baseDate = parseISO(activeDate)

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

  // ==========================================
  // Priorities State & Handlers
  // ==========================================
  const { data: listPriorities = [], isLoading: prioritiesLoading, isError: prioritiesError } = usePrioritiesQuery(activeDate)
  const createPriorityMutation = useCreatePriorityMutation()
  const togglePriorityMutation = useTogglePriorityMutation(activeDate)
  const deletePriorityMutation = useDeletePriorityMutation(activeDate)

  const [newPriorityText, setNewPriorityText] = useState("")
  const [priorityErrorMsg, setPriorityErrorMsg] = useState<string | null>(null)

  const handleAddPriority = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setPriorityErrorMsg(null)
    if (!newPriorityText.trim()) return

    if (listPriorities.length >= 5) {
      setPriorityErrorMsg("You can only have a maximum of 5 priorities per day.")
      return
    }

    try {
      await createPriorityMutation.mutateAsync({
        date: activeDate,
        text: newPriorityText,
        orderIndex: listPriorities.length,
      })
      setNewPriorityText("")
      showSuccessToast("Priority added")
    } catch (err) {
      setPriorityErrorMsg(err instanceof Error ? err.message : "Failed to add priority")
    }
  }

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

  const [newTodoText, setNewTodoText] = useState("")
  const [todoErrorMsg, setTodoErrorMsg] = useState<string | null>(null)

  const handleAddTodo = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setTodoErrorMsg(null)
    if (!newTodoText.trim()) return

    try {
      await createTodoMutation.mutateAsync({
        date: activeDate,
        text: newTodoText,
      })
      setNewTodoText("")
      showSuccessToast("Todo added successfully")
    } catch (err) {
      setTodoErrorMsg(err instanceof Error ? err.message : "Failed to add todo")
    }
  }

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
  // Timetable State & Handlers
  // ==========================================
  const { data: timetableList = [], isLoading: timetableLoading, isError: timetableError } = useTimetableQuery()
  const createBlockMutation = useCreateTimetableBlockMutation()
  const deleteBlockMutation = useDeleteTimetableBlockMutation()

  const [showTimetableAddForm, setShowTimetableAddForm] = useState(false)
  const [timetableTitle, setTimetableTitle] = useState("")
  const [timetableStartTime, setTimetableStartTime] = useState("08:00")
  const [timetableEndTime, setTimetableEndTime] = useState("09:00")
  const [timetableCategory, setTimetableCategory] = useState("General")
  const [timetableErrorMsg, setTimetableErrorMsg] = useState<string | null>(null)
  const [timetableScheduleType, setTimetableScheduleType] = useState<"fixed" | "custom">("custom")

  const activeDayOfWeek = parseISO(activeDate).getDay()
  const activeDayBlocks = timetableList
    .filter((block) => block.dayOfWeek === -1 || block.date === activeDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

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

  const handleAddTimetableBlock = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setTimetableErrorMsg(null)
    if (!timetableTitle.trim() || !timetableStartTime || !timetableEndTime) return

    if (timetableStartTime >= timetableEndTime) {
      setTimetableErrorMsg("End time must be after start time.")
      return
    }

    try {
      await createBlockMutation.mutateAsync({
        dayOfWeek: timetableScheduleType === "fixed" ? -1 : activeDayOfWeek,
        startTime: timetableStartTime,
        endTime: timetableEndTime,
        title: timetableTitle,
        category: timetableCategory,
        color: CATEGORY_COLORS[timetableCategory] || "blue",
        date: timetableScheduleType === "fixed" ? undefined : activeDate,
      })
      setTimetableTitle("")
      setShowTimetableAddForm(false)
      showSuccessToast("Schedule block added")
    } catch {
      setTimetableErrorMsg("Failed to save timetable block.")
    }
  }

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

    // Priorities
    listPriorities,
    prioritiesLoading,
    prioritiesError,
    newPriorityText,
    setNewPriorityText,
    priorityErrorMsg,
    handleAddPriority,
    handleTogglePriority,
    handleDeletePriority,
    priorityCreatePending: createPriorityMutation.isPending,

    // Todos
    todos,
    todosLoading,
    todosError,
    newTodoText,
    setNewTodoText,
    todoErrorMsg,
    handleAddTodo,
    handleToggleTodo,
    handleDeleteTodo,
    todoCreatePending: createTodoMutation.isPending,

    // Timetable
    timetableList,
    timetableLoading,
    timetableError,
    showTimetableAddForm,
    setShowTimetableAddForm,
    timetableTitle,
    setTimetableTitle,
    timetableStartTime,
    setTimetableStartTime,
    timetableEndTime,
    setTimetableEndTime,
    timetableCategory,
    setTimetableCategory,
    timetableErrorMsg,
    timetableScheduleType,
    setTimetableScheduleType,
    handleAddTimetableBlock,
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
  }
}

export type UseDailyPageReturn = ReturnType<typeof useDailyPage>
