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

  // --- Runtime / Persistent ---
  isRunning: boolean
  phase: PomodoroPhase
  remainingSeconds: number
  sessionCount: number // completed focus sessions
  isModalOpen: boolean
  lastActiveTimestamp: number | null

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
  adjustForElapsedTime: () => void
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
      lastActiveTimestamp: null,

      // Config actions
      setConfig: (patch) =>
        set((s) => ({ config: { ...s.config, ...patch } })),

      setIntegrationMode: (integrationMode) => set({ integrationMode }),

      setSelectedBlock: (selectedBlockId) => set({ selectedBlockId }),

      // Timer actions
      startTimer: () => {
        const { phase, config } = get()
        const now = Date.now()
        if (phase === "idle") {
          set({
            phase: "focus",
            remainingSeconds: config.focusDuration * 60,
            sessionCount: 0,
            isRunning: true,
            isModalOpen: true,
            lastActiveTimestamp: now,
          })
        } else {
          set({ 
            isRunning: true, 
            isModalOpen: true,
            lastActiveTimestamp: now,
          })
        }
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
