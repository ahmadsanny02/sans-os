"use client"

import { useState, useMemo, useEffect } from "react"
import {
  usePomodoroStore,
  PomodoroConfig,
  IntegrationMode,
} from "@/store/pomodoroStore"
import { useTimetableQuery, TimetableBlock } from "@/hooks/useDaily"
import { showErrorToast } from "@/lib/sweetalert"
import { format } from "date-fns"

// Helper: convert "HH:MM" string to total minutes from midnight
function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

// Helper: calculate total minutes of a timetable block
function blockDurationMinutes(block: TimetableBlock): number {
  return timeToMinutes(block.endTime) - timeToMinutes(block.startTime)
}

export function usePomodoroPage() {
  const config = usePomodoroStore((s) => s.config)
  const setConfig = usePomodoroStore((s) => s.setConfig)
  const integrationMode = usePomodoroStore((s) => s.integrationMode)
  const setIntegrationMode = usePomodoroStore((s) => s.setIntegrationMode)
  const selectedBlockId = usePomodoroStore((s) => s.selectedBlockId)
  const setSelectedBlock = usePomodoroStore((s) => s.setSelectedBlock)
  const isRunning = usePomodoroStore((s) => s.isRunning)
  const phase = usePomodoroStore((s) => s.phase)
  const startTimer = usePomodoroStore((s) => s.startTimer)
  const openModal = usePomodoroStore((s) => s.openModal)

  // Real-time ticking state to trigger recalculations
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Timetable query
  const { data: timetableList = [], isLoading: timetableLoading } =
    useTimetableQuery()

  // Today's blocks — matches the same logic as the dashboard widget:
  // - One-off blocks: date matches todayString
  // - Fixed blocks: dayOfWeek === -1
  const todayString = useMemo(() => format(currentTime, "yyyy-MM-dd"), [currentTime])

  const todayBlocks = useMemo(
    () => {
      const todayDayOfWeek = currentTime.getDay()
      return timetableList.filter(
        (b) =>
          (b.dayOfWeek === -1 ||
            b.date === todayString ||
            (b.dayOfWeek === todayDayOfWeek && !b.date)) &&
          b.isTodo
      )
    },
    [timetableList, todayString, currentTime]
  )

  // Auto mode: detect currently active block by real-time clock
  const autoActiveBlock = useMemo((): TimetableBlock | undefined => {
    const currentMins =
      currentTime.getHours() * 60 + currentTime.getMinutes()
    const sortedBlocks = [...todayBlocks].sort((a, b) => {
      if (a.dayOfWeek !== -1 && b.dayOfWeek === -1) return -1
      if (a.dayOfWeek === -1 && b.dayOfWeek !== -1) return 1
      return 0
    })
    return sortedBlocks.find(
      (b) =>
        timeToMinutes(b.startTime) <= currentMins &&
        timeToMinutes(b.endTime) > currentMins
    )
  }, [todayBlocks, currentTime])

  // Manual mode: selected block object
  const selectedBlock = useMemo(
    () => timetableList.find((b) => b.id === selectedBlockId),
    [timetableList, selectedBlockId]
  )

  // The "active" block to display — depends on mode
  const activeBlock =
    integrationMode === "auto" ? autoActiveBlock : selectedBlock

  // Estimated sessions for the active block
  const estimatedSessions = useMemo((): number => {
    if (!activeBlock) return 0
    const duration = blockDurationMinutes(activeBlock)
    const cycleTime = config.focusDuration + config.breakDuration
    return Math.floor(duration / cycleTime)
  }, [activeBlock, config.focusDuration, config.breakDuration])

  // Display config reads directly from store config for auto-saving
  const displayConfig = config
  const isDirty = false

  const handleUpdateLocalConfig = (patch: Partial<PomodoroConfig>): void => {
    setConfig(patch)
  }

  const handleSaveConfig = (): void => {
    // No-op since changes are auto-saved in real-time
  }

  const handleSetMode = (mode: IntegrationMode): void => {
    setIntegrationMode(mode)
    if (mode === "auto") setSelectedBlock(null)
  }

  const handleSelectBlock = (blockId: string): void => {
    setSelectedBlock(blockId)
  }

  const handleQuickStart = (): void => {
    if (phase !== "idle") {
      openModal()
    } else {
      const started = startTimer(timetableList)
      if (!started && integrationMode === "auto") {
        showErrorToast("No active timetable schedule block right now!")
      }
    }
  }

  return {
    // Config
    config,
    localConfig: displayConfig,
    isDirty,
    handleUpdateLocalConfig,
    handleSaveConfig,
    // Integration
    integrationMode,
    handleSetMode,
    selectedBlockId,
    handleSelectBlock,
    // Blocks
    todayBlocks,
    autoActiveBlock,
    selectedBlock,
    activeBlock,
    estimatedSessions,
    timetableLoading,
    todayString,
    currentTime,
    // Timer state
    isRunning,
    phase,
    handleQuickStart,
  }
}

export type UsePomodoroPageReturn = ReturnType<typeof usePomodoroPage>
