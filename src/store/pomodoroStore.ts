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
  tick: () => void

  openModal: () => void
  closeModal: () => void
  toggleModal: () => void
  adjustForElapsedTime: () => void
  setIsPipActive: (active: boolean) => void
  setIsPipExpanded: (expanded: boolean) => void
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
        const { phase, config, integrationMode } = get()
        const now = Date.now()

        if (phase === "idle") {
          if (integrationMode === "auto") {
            if (!timetableList || timetableList.length === 0) {
              return false
            }

            const nowDate = new Date()
            const year = nowDate.getFullYear()
            const month = String(nowDate.getMonth() + 1).padStart(2, "0")
            const day = String(nowDate.getDate()).padStart(2, "0")
            const todayStr = `${year}-${month}-${day}`

            const todayBlocks = timetableList.filter(
              (b) => b.dayOfWeek === -1 || b.date === todayStr
            )

            const currentMins = nowDate.getHours() * 60 + nowDate.getMinutes()

            const timeToMinutes = (t: string): number => {
              const [h, m] = t.split(":").map(Number)
              return h * 60 + m
            }

            const activeBlock = todayBlocks.find(
              (b) =>
                timeToMinutes(b.startTime) <= currentMins &&
                timeToMinutes(b.endTime) > currentMins
            )

            if (!activeBlock) {
              return false
            }

            const startMins = timeToMinutes(activeBlock.startTime)
            const elapsedMins = currentMins - startMins
            const cycleMins = config.focusDuration + config.breakDuration
            const modulo = elapsedMins % cycleMins

            let nextPhase: PomodoroPhase = "focus"
            let seconds = config.focusDuration * 60

            if (modulo < config.focusDuration) {
              nextPhase = "focus"
              seconds = (config.focusDuration - modulo) * 60
            } else {
              nextPhase = "break"
              seconds = (cycleMins - modulo) * 60
            }

            set({
              phase: nextPhase,
              remainingSeconds: seconds,
              sessionCount: 0,
              isRunning: true,
              isModalOpen: true,
              lastActiveTimestamp: now,
            })
            return true
          }

          // Manual or normal mode starts normally
          set({
            phase: "focus",
            remainingSeconds: config.focusDuration * 60,
            sessionCount: 0,
            isRunning: true,
            isModalOpen: true,
            lastActiveTimestamp: now,
          })
          return true
        }

        // Resume from paused
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
        })
      },

      skipPhase: () => {
        const { phase, config, sessionCount, isRunning } = get()
        const now = Date.now()
        if (phase === "focus") {
          const newCount = sessionCount + 1
          const isLong = newCount % config.sessionsBeforeLongBreak === 0
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
          })
        }
      },

      tick: () => {
        const { isRunning, phase, remainingSeconds, config, sessionCount } =
          get()
        if (!isRunning || phase === "idle") return

        const now = Date.now()

        if (remainingSeconds > 1) {
          set({ 
            remainingSeconds: remainingSeconds - 1,
            lastActiveTimestamp: now,
          })
          return
        }

        // Remaining === 1 → transition
        if (phase === "focus") {
          const newCount = sessionCount + 1
          const isLong = newCount % config.sessionsBeforeLongBreak === 0
          const nextPhase: PomodoroPhase = isLong ? "long-break" : "break"
          set({
            phase: nextPhase,
            remainingSeconds:
              (isLong ? config.longBreakDuration : config.breakDuration) * 60,
            sessionCount: newCount,
            lastActiveTimestamp: now,
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

      adjustForElapsedTime: () => {
        const { isRunning, phase, remainingSeconds, lastActiveTimestamp, config, sessionCount } = get()
        if (!isRunning || phase === "idle" || !lastActiveTimestamp) return

        const now = Date.now()
        const elapsedSeconds = Math.floor((now - lastActiveTimestamp) / 1000)

        if (elapsedSeconds <= 0) return

        if (elapsedSeconds < remainingSeconds) {
          set({
            remainingSeconds: remainingSeconds - elapsedSeconds,
            lastActiveTimestamp: now,
          })
        } else {
          // Time exceeded
          if (phase === "focus") {
            const newCount = sessionCount + 1
            const isLong = newCount % config.sessionsBeforeLongBreak === 0
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
