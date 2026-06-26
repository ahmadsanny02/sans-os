"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { TimetableBlock } from "@/hooks/useDaily"

export interface PomodoroConfig {
  focusDuration: number // minutes
  breakDuration: number // minutes
  longBreakDuration: number // minutes
  sessionsBeforeLongBreak: number
  soundEnabled: boolean
  soundVolume: number // 0 to 1
  soundType: "sine" | "triangle" | "square" | "sawtooth"
}

export type PomodoroPhase = "idle" | "focus" | "break" | "long-break"
export type IntegrationMode = "auto" | "manual"

interface PomodoroState {
  // --- Persisted to localStorage ---
  config: PomodoroConfig
  integrationMode: IntegrationMode
  selectedBlockId: string | null // for manual mode
  activeBlockEndTime: string | null // for auto mode boundary check
  activeBlockDate: string | null // for auto mode boundary check
  activeBlockSessions: number | null // total sessions in block
  isLongBreakAfterBlock: boolean

  // --- Runtime / Persistent ---
  isRunning: boolean
  phase: PomodoroPhase
  remainingSeconds: number
  sessionCount: number // completed focus sessions
  isModalOpen: boolean
  lastActiveTimestamp: number | null
  isPipActive: boolean
  isPipExpanded: boolean

  // --- Actions ---
  setConfig: (patch: Partial<PomodoroConfig>) => void
  setIntegrationMode: (mode: IntegrationMode) => void
  setSelectedBlock: (id: string | null) => void

  startTimer: (timetableList?: TimetableBlock[]) => boolean
  pauseTimer: () => void
  stopTimer: () => void
  skipPhase: () => void
  tick: (timetableList?: TimetableBlock[]) => void

  openModal: () => void
  closeModal: () => void
  toggleModal: () => void
  adjustForElapsedTime: (timetableList?: TimetableBlock[]) => void
  setIsPipActive: (active: boolean) => void
  setIsPipExpanded: (expanded: boolean) => void
}

function getAutoState(
  timetableList: TimetableBlock[],
  nowDate: Date,
  config: PomodoroConfig
): Partial<PomodoroState> {
  const year = nowDate.getFullYear()
  const month = String(nowDate.getMonth() + 1).padStart(2, "0")
  const day = String(nowDate.getDate()).padStart(2, "0")
  const todayStr = `${year}-${month}-${day}`

  const todayBlocks = timetableList.filter(
    (b) =>
      (b.dayOfWeek === -1 ||
        b.date === todayStr ||
        (b.dayOfWeek === nowDate.getDay() && !b.date)) &&
      b.isTodo
  )

  const timeToMinutes = (t: string): number => {
    const [h, m] = t.split(":").map(Number)
    return h * 60 + m
  }

  const currentSecs = nowDate.getHours() * 3600 + nowDate.getMinutes() * 60 + nowDate.getSeconds()
  const currentMins = nowDate.getHours() * 60 + nowDate.getMinutes()

  // Prioritize "This Day Only" (Custom) blocks over "Every Day" (Fixed) blocks
  const sortedBlocks = [...todayBlocks].sort((a, b) => {
    if (a.dayOfWeek !== -1 && b.dayOfWeek === -1) return -1
    if (a.dayOfWeek === -1 && b.dayOfWeek !== -1) return 1
    return 0
  })

  // 1. Check if there is an active block right now
  const activeBlock = sortedBlocks.find(
    (b) =>
      timeToMinutes(b.startTime) <= currentMins &&
      timeToMinutes(b.endTime) > currentMins
  )

  if (activeBlock) {
    const startMins = timeToMinutes(activeBlock.startTime)
    const endMins = timeToMinutes(activeBlock.endTime)
    const elapsedSecs = currentSecs - startMins * 60
    const cycleSecs = (config.focusDuration + config.breakDuration) * 60
    const moduloSecs = elapsedSecs % cycleSecs

    let phase: PomodoroPhase = "focus"
    let remaining = config.focusDuration * 60 - moduloSecs

    if (moduloSecs < config.focusDuration * 60) {
      phase = "focus"
      remaining = config.focusDuration * 60 - moduloSecs
    } else {
      phase = "break"
      remaining = cycleSecs - moduloSecs
    }

    const duration = endMins - startMins
    const est = Math.floor(duration / (config.focusDuration + config.breakDuration))
    const isFocus = phase === "focus"
    const completedCycles = Math.floor(elapsedSecs / cycleSecs)

    return {
      isRunning: true,
      phase,
      remainingSeconds: Math.max(1, Math.floor(remaining)),
      sessionCount: isFocus ? completedCycles : completedCycles + 1,
      activeBlockEndTime: activeBlock.endTime,
      activeBlockDate: todayStr,
      activeBlockSessions: est > 0 ? est : null,
      isLongBreakAfterBlock: false,
    }
  }

  // 2. If no active block, check if we are in the long break of a recently ended block.
  const pastBlocks = todayBlocks.filter(
    (b) => timeToMinutes(b.endTime) <= currentMins
  )

  // Sort past blocks descending by endTime
  pastBlocks.sort((a, b) => timeToMinutes(b.endTime) - timeToMinutes(a.endTime))

  if (pastBlocks.length > 0) {
    const lastBlock = pastBlocks[0]
    const endMins = timeToMinutes(lastBlock.endTime)
    const elapsedSecsSinceEnd = currentSecs - endMins * 60
    const longBreakSecs = config.longBreakDuration * 60

    if (elapsedSecsSinceEnd >= 0 && elapsedSecsSinceEnd < longBreakSecs) {
      const startMins = timeToMinutes(lastBlock.startTime)
      const duration = endMins - startMins
      const est = Math.floor(duration / (config.focusDuration + config.breakDuration))

      return {
        isRunning: true,
        phase: "long-break",
        remainingSeconds: Math.max(1, Math.floor(longBreakSecs - elapsedSecsSinceEnd)),
        sessionCount: est,
        activeBlockEndTime: null,
        activeBlockDate: null,
        activeBlockSessions: est > 0 ? est : null,
        isLongBreakAfterBlock: true,
      }
    }
  }

  // 3. Otherwise, we are completely outside of blocks and break gaps.
  return {
    isRunning: false,
    phase: "idle",
    remainingSeconds: config.focusDuration * 60,
    sessionCount: 0,
    activeBlockEndTime: null,
    activeBlockDate: null,
    activeBlockSessions: null,
    isLongBreakAfterBlock: false,
  }
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      // Defaults
      config: {
        focusDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        soundEnabled: true,
        soundVolume: 0.5,
        soundType: "sine",
      },
      integrationMode: "auto",
      selectedBlockId: null,
      activeBlockEndTime: null,
      activeBlockDate: null,
      activeBlockSessions: null,
      isLongBreakAfterBlock: false,

      // Runtime defaults
      isRunning: false,
      phase: "idle",
      remainingSeconds: 25 * 60,
      sessionCount: 0,
      isModalOpen: false,
      lastActiveTimestamp: null,
      isPipActive: false,
      isPipExpanded: false,

      // Config actions
      setConfig: (patch) =>
        set((s) => ({ config: { ...s.config, ...patch } })),

      setIntegrationMode: (integrationMode) => set({ integrationMode }),

      setSelectedBlock: (selectedBlockId) => set({ selectedBlockId }),

      // Timer actions
      startTimer: (timetableList) => {
        const { phase, config, integrationMode, selectedBlockId } = get()
        const now = Date.now()

        const timeToMinutes = (t: string): number => {
          const [h, m] = t.split(":").map(Number)
          return h * 60 + m
        }

        if (phase === "idle") {
          if (integrationMode === "auto") {
            if (!timetableList || timetableList.length === 0) {
              return false
            }

            const autoState = getAutoState(timetableList, new Date(), config)
            if (!autoState.isRunning) {
              return false
            }

            set({
              ...autoState,
              isModalOpen: true,
              lastActiveTimestamp: now,
            })
            return true
          }

          // Manual or normal mode starts normally
          let estimatedSessions: number | null = null
          if (selectedBlockId && timetableList && timetableList.length > 0) {
            const selectedBlock = timetableList.find((b) => b.id === selectedBlockId)
            if (selectedBlock) {
              const duration = timeToMinutes(selectedBlock.endTime) - timeToMinutes(selectedBlock.startTime)
              const cycleMins = config.focusDuration + config.breakDuration
              const est = Math.floor(duration / cycleMins)
              if (est > 0) estimatedSessions = est
            }
          }

          set({
            phase: "focus",
            remainingSeconds: config.focusDuration * 60,
            sessionCount: 0,
            isRunning: true,
            isModalOpen: true,
            lastActiveTimestamp: now,
            activeBlockEndTime: null,
            activeBlockDate: null,
            activeBlockSessions: estimatedSessions,
            isLongBreakAfterBlock: false,
          })
          return true
        }

        // Resume from paused
        if (integrationMode === "auto") {
          if (!timetableList || timetableList.length === 0) {
            return false
          }
          const autoState = getAutoState(timetableList, new Date(), config)
          if (!autoState.isRunning) {
            return false
          }
          set({
            ...autoState,
            isModalOpen: true,
            lastActiveTimestamp: now,
          })
          return true
        }

        set({ 
          isRunning: true, 
          isModalOpen: true,
          lastActiveTimestamp: now,
        })
        return true
      },

      pauseTimer: () => set({ isRunning: false, lastActiveTimestamp: null }),

      stopTimer: () => {
        const { config } = get()
        set({
          isRunning: false,
          phase: "idle",
          remainingSeconds: config.focusDuration * 60,
          sessionCount: 0,
          lastActiveTimestamp: null,
          activeBlockEndTime: null,
          activeBlockDate: null,
          activeBlockSessions: null,
          isLongBreakAfterBlock: false,
        })
      },

      skipPhase: () => {
        const { phase, config, sessionCount, isRunning, integrationMode, activeBlockSessions } = get()
        const now = Date.now()

        // Skip phase is not allowed in auto mode (locked to schedule)
        if (integrationMode === "auto") return

        const totalSessions = activeBlockSessions || config.sessionsBeforeLongBreak

        if (phase === "focus") {
          const newCount = sessionCount + 1
          const isLong = newCount % totalSessions === 0
          const nextPhase: PomodoroPhase = isLong ? "long-break" : "break"
          set({
            phase: nextPhase,
            remainingSeconds:
              (isLong ? config.longBreakDuration : config.breakDuration) * 60,
            sessionCount: newCount,
            lastActiveTimestamp: isRunning ? now : null,
          })
        } else if (phase === "break" || phase === "long-break") {
          set({
            phase: "focus",
            remainingSeconds: config.focusDuration * 60,
            lastActiveTimestamp: isRunning ? now : null,
            isLongBreakAfterBlock: false,
          })
        }
      },

      tick: (timetableList) => {
        const {
          isRunning,
          phase,
          remainingSeconds,
          config,
          sessionCount,
          integrationMode,
          activeBlockSessions,
        } = get()
        if (!isRunning || phase === "idle") return

        const now = Date.now()

        // Auto mode recalculation
        if (integrationMode === "auto") {
          if (timetableList && timetableList.length > 0) {
            const autoState = getAutoState(timetableList, new Date(), config)
            set(autoState)
          }
          return
        }

        if (remainingSeconds > 1) {
          set({ 
            remainingSeconds: remainingSeconds - 1,
            lastActiveTimestamp: now,
          })
          return
        }

        const totalSessions = activeBlockSessions || config.sessionsBeforeLongBreak

        // Remaining === 1 → transition (manual mode only)
        if (phase === "focus") {
          const newCount = sessionCount + 1
          const isLong = newCount % totalSessions === 0
          const nextPhase: PomodoroPhase = isLong ? "long-break" : "break"
          set({
            phase: nextPhase,
            remainingSeconds:
              (isLong ? config.longBreakDuration : config.breakDuration) * 60,
            sessionCount: newCount,
            lastActiveTimestamp: now,
          })
        } else if (phase === "long-break" && get().isLongBreakAfterBlock) {
          // Finished the post-block long break! Stop the timer.
          set({
            phase: "idle",
            remainingSeconds: config.focusDuration * 60,
            sessionCount: 0,
            isRunning: false,
            lastActiveTimestamp: null,
            activeBlockSessions: null,
            isLongBreakAfterBlock: false,
          })
        } else {
          set({
            phase: "focus",
            remainingSeconds: config.focusDuration * 60,
            lastActiveTimestamp: now,
          })
        }
      },

      // Modal actions
      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),
      toggleModal: () => set((s) => ({ isModalOpen: !s.isModalOpen })),
      setIsPipActive: (isPipActive) => set({ isPipActive }),
      setIsPipExpanded: (isPipExpanded) => set({ isPipExpanded }),

      adjustForElapsedTime: (timetableList) => {
        const {
          isRunning,
          phase,
          remainingSeconds,
          lastActiveTimestamp,
          config,
          sessionCount,
          integrationMode,
          activeBlockSessions,
        } = get()
        if (!isRunning || phase === "idle" || !lastActiveTimestamp) return

        const now = Date.now()

        // Auto mode boundary recalculation
        if (integrationMode === "auto") {
          if (timetableList && timetableList.length > 0) {
            const autoState = getAutoState(timetableList, new Date(), config)
            set(autoState)
          }
          return
        }

        const elapsedSeconds = Math.floor((now - lastActiveTimestamp) / 1000)

        if (elapsedSeconds <= 0) return

        if (elapsedSeconds < remainingSeconds) {
          set({
            remainingSeconds: remainingSeconds - elapsedSeconds,
            lastActiveTimestamp: now,
          })
        } else {
          // Time exceeded
          const totalSessions = activeBlockSessions || config.sessionsBeforeLongBreak
          if (phase === "focus") {
            const newCount = sessionCount + 1
            const isLong = newCount % totalSessions === 0
            const nextPhase: PomodoroPhase = isLong ? "long-break" : "break"
            set({
              phase: nextPhase,
              remainingSeconds: (isLong ? config.longBreakDuration : config.breakDuration) * 60,
              sessionCount: newCount,
              isRunning: false,
              lastActiveTimestamp: null,
            })
          } else {
            set({
              phase: "focus",
              remainingSeconds: config.focusDuration * 60,
              isRunning: false,
              lastActiveTimestamp: null,
            })
          }
        }
      },
    }),
    {
      name: "sans-os-pomodoro",
      // Custom merge function to safely deep-merge config object (e.g. for backward compatibility)
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PomodoroState> | null | undefined
        return {
          ...currentState,
          ...persisted,
          config: {
            ...currentState.config,
            ...(persisted?.config || {}),
          },
        }
      },
      // Persist config, integration mode, and the active timer state to survive page refreshes
      partialize: (state) => ({
        config: state.config,
        integrationMode: state.integrationMode,
        selectedBlockId: state.selectedBlockId,
        activeBlockEndTime: state.activeBlockEndTime,
        activeBlockDate: state.activeBlockDate,
        activeBlockSessions: state.activeBlockSessions,
        isLongBreakAfterBlock: state.isLongBreakAfterBlock,
        isRunning: state.isRunning,
        phase: state.phase,
        remainingSeconds: state.remainingSeconds,
        sessionCount: state.sessionCount,
        isModalOpen: state.isModalOpen,
        lastActiveTimestamp: state.lastActiveTimestamp,
      }),
    }
  )
)
