"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface PomodoroConfig {
  focusDuration: number // minutes
  breakDuration: number // minutes
  longBreakDuration: number // minutes
  sessionsBeforeLongBreak: number
}

export type PomodoroPhase = "idle" | "focus" | "break" | "long-break"
export type IntegrationMode = "auto" | "manual"

interface PomodoroState {
  // --- Persisted to localStorage ---
  config: PomodoroConfig
  integrationMode: IntegrationMode
  selectedBlockId: string | null // for manual mode

  // --- Runtime (resets on page refresh) ---
  isRunning: boolean
  phase: PomodoroPhase
  remainingSeconds: number
  sessionCount: number // completed focus sessions
  isModalOpen: boolean

  // --- Actions ---
  setConfig: (patch: Partial<PomodoroConfig>) => void
  setIntegrationMode: (mode: IntegrationMode) => void
  setSelectedBlock: (id: string | null) => void

  startTimer: () => void
  pauseTimer: () => void
  stopTimer: () => void
  skipPhase: () => void
  tick: () => void

  openModal: () => void
  closeModal: () => void
  toggleModal: () => void
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
      },
      integrationMode: "auto",
      selectedBlockId: null,

      // Runtime defaults
      isRunning: false,
      phase: "idle",
      remainingSeconds: 25 * 60,
      sessionCount: 0,
      isModalOpen: false,

      // Config actions
      setConfig: (patch) =>
        set((s) => ({ config: { ...s.config, ...patch } })),

      setIntegrationMode: (integrationMode) => set({ integrationMode }),

      setSelectedBlock: (selectedBlockId) => set({ selectedBlockId }),

      // Timer actions
      startTimer: () => {
        const { phase, config } = get()
        if (phase === "idle") {
          set({
            phase: "focus",
            remainingSeconds: config.focusDuration * 60,
            sessionCount: 0,
            isRunning: true,
            isModalOpen: true,
          })
        } else {
          set({ isRunning: true, isModalOpen: true })
        }
      },

      pauseTimer: () => set({ isRunning: false }),

      stopTimer: () => {
        const { config } = get()
        set({
          isRunning: false,
          phase: "idle",
          remainingSeconds: config.focusDuration * 60,
          sessionCount: 0,
        })
      },

      skipPhase: () => {
        const { phase, config, sessionCount } = get()
        if (phase === "focus") {
          const newCount = sessionCount + 1
          const isLong = newCount % config.sessionsBeforeLongBreak === 0
          const nextPhase: PomodoroPhase = isLong ? "long-break" : "break"
          set({
            phase: nextPhase,
            remainingSeconds:
              (isLong ? config.longBreakDuration : config.breakDuration) * 60,
            sessionCount: newCount,
          })
        } else if (phase === "break" || phase === "long-break") {
          set({
            phase: "focus",
            remainingSeconds: config.focusDuration * 60,
          })
        }
      },

      tick: () => {
        const { isRunning, phase, remainingSeconds, config, sessionCount } =
          get()
        if (!isRunning || phase === "idle") return

        if (remainingSeconds > 1) {
          set({ remainingSeconds: remainingSeconds - 1 })
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
          })
        } else {
          set({
            phase: "focus",
            remainingSeconds: config.focusDuration * 60,
          })
        }
      },

      // Modal actions
      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),
      toggleModal: () => set((s) => ({ isModalOpen: !s.isModalOpen })),
    }),
    {
      name: "sans-os-pomodoro",
      // Only persist config and integration settings — timer state resets on refresh
      partialize: (state) => ({
        config: state.config,
        integrationMode: state.integrationMode,
        selectedBlockId: state.selectedBlockId,
      }),
    }
  )
)
