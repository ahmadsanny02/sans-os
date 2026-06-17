"use client"

import { useState, useMemo } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import {
  usePomodoroStore,
  PomodoroConfig,
  IntegrationMode,
} from "@/store/pomodoroStore"
import { useTimetableQuery, TimetableBlock } from "@/hooks/useDaily"
import { showSuccessToast } from "@/lib/sweetalert"
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
  const activeDate = useWorkspaceStore((s) => s.activeDate)

  // Store state
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

  // Timetable query
  const { data: timetableList = [], isLoading: timetableLoading } =
    useTimetableQuery()

  // Today's blocks (fixed weekly + custom date blocks)
  const todayDayOfWeek = new Date().getDay()
  const todayString = format(new Date(), "yyyy-MM-dd")
  const activeDayString = activeDate

  const todayBlocks = useMemo(
    () =>
      timetableList.filter((b) => {
        if (b.dayOfWeek === -1) return b.date === activeDayString
        return b.dayOfWeek === todayDayOfWeek && !b.date
      }),
    [timetableList, todayDayOfWeek, activeDayString]
  )

  // Auto mode: detect currently active block by real-time clock
  const autoActiveBlock = useMemo((): TimetableBlock | undefined => {
    const now = new Date()
    const currentMins =
      now.getHours() * 60 + now.getMinutes()
    return todayBlocks.find(
      (b) =>
        timeToMinutes(b.startTime) <= currentMins &&
        timeToMinutes(b.endTime) > currentMins
    )
  }, [todayBlocks])

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

  // Local form state (controlled inputs, mirrors store config until saved)
  const [localConfig, setLocalConfig] = useState<PomodoroConfig>({ ...config })

  const isDirty =
    localConfig.focusDuration !== config.focusDuration ||
    localConfig.breakDuration !== config.breakDuration ||
    localConfig.longBreakDuration !== config.longBreakDuration ||
    localConfig.sessionsBeforeLongBreak !== config.sessionsBeforeLongBreak ||
    localConfig.soundEnabled !== config.soundEnabled ||
    localConfig.soundVolume !== config.soundVolume ||
    localConfig.soundType !== config.soundType

  const handleUpdateLocalConfig = (patch: Partial<PomodoroConfig>): void => {
    setLocalConfig((prev) => ({ ...prev, ...patch }))
  }

  const handleSaveConfig = (): void => {
    setConfig(localConfig)
    showSuccessToast("Pomodoro configuration saved!")
  }

  const handleSetMode = (mode: IntegrationMode): void => {
    setIntegrationMode(mode)
    if (mode === "auto") setSelectedBlock(null)
  }

  const handleSelectBlock = (blockId: string): void => {
    setSelectedBlock(blockId)
  }

  const handleQuickStart = (): void => {
    if (isDirty) {
      // Auto-save before starting
      setConfig(localConfig)
    }
    if (phase !== "idle") {
      openModal()
    } else {
      startTimer()
    }
  }

  return {
    // Config
    config,
    localConfig,
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
    // Timer state
    isRunning,
    phase,
    handleQuickStart,
  }
}

export type UsePomodoroPageReturn = ReturnType<typeof usePomodoroPage>
