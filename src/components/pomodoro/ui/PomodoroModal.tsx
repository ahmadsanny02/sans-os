"use client"

import React, { useEffect, useRef, useMemo, useState } from "react"
import { usePomodoroStore, PomodoroPhase } from "@/store/pomodoroStore"
import { useTimetableQuery, TimetableBlock } from "@/hooks/useDaily"
import { playPomodoroSound } from "@/lib/pomodoroSound"
import {
  Play,
  Pause,
  Square,
  SkipForward,
  X,
  Timer,
  ExternalLink,
  Tv,
} from "lucide-react"
import Link from "next/link"
import { startPip } from "./PomodoroPipController"
import { showErrorToast } from "@/lib/sweetalert"

// ---------- Helpers ----------

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, "0")
  const s = (secs % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

const PHASE_META: Record<
  PomodoroPhase,
  { label: string; emoji: string; color: string; ring: string }
> = {
  idle: {
    label: "Ready",
    emoji: "🎯",
    color: "text-violet-400",
    ring: "stroke-violet-500/40",
  },
  focus: {
    label: "Focus",
    emoji: "🎯",
    color: "text-violet-400",
    ring: "stroke-violet-500",
  },
  break: {
    label: "Break",
    emoji: "☕",
    color: "text-emerald-400",
    ring: "stroke-emerald-500",
  },
  "long-break": {
    label: "Long Break",
    emoji: "🌟",
    color: "text-cyan-400",
    ring: "stroke-cyan-500",
  },
}

// ---------- Progress Ring ----------

interface RingProps {
  progress: number // 0–1
  phase: PomodoroPhase
  children: React.ReactNode
}

function ProgressRing({ progress, phase, children }: RingProps) {
  const R = 56
  const C = 2 * Math.PI * R
  const offset = C * (1 - progress)
  const meta = PHASE_META[phase]

  return (
    <div className="relative flex items-center justify-center" style={{ width: 144, height: 144 }}>
      <svg
        width={144}
        height={144}
        viewBox="0 0 144 144"
        className="-rotate-90 absolute inset-0"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="72"
          cy="72"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-white/5"
        />
        {/* Progress */}
        <circle
          cx="72"
          cy="72"
          r={R}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={`transition-all duration-1000 ${meta.ring}`}
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center">{children}</div>
    </div>
  )
}

// ---------- Main Modal ----------

export function PomodoroModal() {
  const isModalOpen = usePomodoroStore((s) => s.isModalOpen)
  const isRunning = usePomodoroStore((s) => s.isRunning)
  const phase = usePomodoroStore((s) => s.phase)
  const remainingSeconds = usePomodoroStore((s) => s.remainingSeconds)
  const sessionCount = usePomodoroStore((s) => s.sessionCount)
  const config = usePomodoroStore((s) => s.config)
  const integrationMode = usePomodoroStore((s) => s.integrationMode)
  const selectedBlockId = usePomodoroStore((s) => s.selectedBlockId)
  const activeBlockSessions = usePomodoroStore((s) => s.activeBlockSessions)

  const startTimer = usePomodoroStore((s) => s.startTimer)
  const pauseTimer = usePomodoroStore((s) => s.pauseTimer)
  const stopTimer = usePomodoroStore((s) => s.stopTimer)
  const skipPhase = usePomodoroStore((s) => s.skipPhase)
  const tick = usePomodoroStore((s) => s.tick)
  const closeModal = usePomodoroStore((s) => s.closeModal)
  const adjustForElapsedTime = usePomodoroStore((s) => s.adjustForElapsedTime)
  const isPipActive = usePomodoroStore((s) => s.isPipActive)
  const setIsPipActive = usePomodoroStore((s) => s.setIsPipActive)
  const setIsPipExpanded = usePomodoroStore((s) => s.setIsPipExpanded)

  const isPipSupported = typeof window !== "undefined" && "documentPictureInPicture" in window

  const { data: timetableList = [] } = useTimetableQuery()

  // --- Adjust for elapsed time on mount/load & tab focus ---
  useEffect(() => {
    adjustForElapsedTime(timetableList)

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        adjustForElapsedTime(timetableList)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [adjustForElapsedTime, timetableList])

  // --- Countdown interval ---
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => tick(timetableList), 1000)
    return () => clearInterval(id)
  }, [isRunning, tick, timetableList])

  // --- Sound on phase change ---
  const prevPhaseRef = useRef<PomodoroPhase>(phase)
  useEffect(() => {
    const prev = prevPhaseRef.current
    if (prev !== phase && phase !== "idle") {
      const soundType =
        phase === "focus" ? "focus" : phase === "break" ? "break" : "long-break"
      playPomodoroSound(soundType)
    }
    prevPhaseRef.current = phase
  }, [phase])

  // --- Browser tab title ---
  useEffect(() => {
    if (isRunning && phase !== "idle") {
      const emoji = PHASE_META[phase].emoji
      document.title = `${formatSeconds(remainingSeconds)} ${emoji} — SansOS`
    } else {
      document.title = "SansOS Workspace"
    }
    return () => {
      document.title = "SansOS Workspace"
    }
  }, [isRunning, phase, remainingSeconds])

  // --- Determine active block ---
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const todayStr = useMemo(() => {
    const year = currentTime.getFullYear()
    const month = String(currentTime.getMonth() + 1).padStart(2, "0")
    const day = String(currentTime.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }, [currentTime])

  const activeBlock = useMemo((): TimetableBlock | undefined => {
    if (integrationMode === "manual") {
      return timetableList.find((b) => b.id === selectedBlockId)
    }
    // Auto: find block active right now
    const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes()
    const todayBlocks = timetableList.filter((b) => b.dayOfWeek === -1 || b.date === todayStr)
    const sortedBlocks = [...todayBlocks].sort((a, b) => {
      if (a.dayOfWeek !== -1 && b.dayOfWeek === -1) return -1
      if (a.dayOfWeek === -1 && b.dayOfWeek !== -1) return 1
      return 0
    })
    return sortedBlocks.find((b) => {
      return (
        timeToMinutes(b.startTime) <= currentMins &&
        timeToMinutes(b.endTime) > currentMins
      )
    })
  }, [timetableList, integrationMode, selectedBlockId, todayStr, currentTime])

  // --- Progress calculation ---
  const totalSeconds = useMemo(() => {
    if (phase === "focus") return config.focusDuration * 60
    if (phase === "break") return config.breakDuration * 60
    if (phase === "long-break") return config.longBreakDuration * 60
    return config.focusDuration * 60
  }, [phase, config])

  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1

  const meta = PHASE_META[phase]
  const totalSessions = activeBlockSessions || config.sessionsBeforeLongBreak
  const displaySession = useMemo(() => {
    if (phase === "focus") {
      return (sessionCount % totalSessions) + 1
    }
    const completedInCycle = sessionCount % totalSessions
    return completedInCycle === 0 ? totalSessions : completedInCycle
  }, [phase, sessionCount, totalSessions])

  if (!isModalOpen) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-72 rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-label="Pomodoro Timer"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-bold text-white/80 tracking-wide uppercase">
            Pomodoro
          </span>
          {isRunning && (
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-1">
          {isPipSupported && (
            <button
              onClick={() => {
                if (isPipActive) {
                  setIsPipActive(false)
                } else {
                  startPip(setIsPipActive, setIsPipExpanded)
                }
              }}
              className={`rounded p-1 transition-colors ${
                isPipActive
                  ? "text-violet-400 bg-white/10"
                  : "text-white/40 hover:text-white/70 hover:bg-white/10"
              }`}
              aria-label={isPipActive ? "Close floating window" : "Open floating window"}
              title={isPipActive ? "Close floating window" : "Open floating window (Picture-in-Picture)"}
            >
              <Tv className="h-3.5 w-3.5" />
            </button>
          )}
          <Link
            href="/pomodoro"
            className="rounded p-1 hover:bg-white/10 transition-colors"
            aria-label="Open Pomodoro settings"
            onClick={closeModal}
          >
            <ExternalLink className="h-3.5 w-3.5 text-white/40 hover:text-white/70" />
          </Link>
          <button
            onClick={closeModal}
            className="rounded p-1 hover:bg-white/10 transition-colors"
            aria-label="Close Pomodoro modal"
          >
            <X className="h-3.5 w-3.5 text-white/40 hover:text-white/70" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col items-center gap-4 px-4 py-5">
        {/* Ring */}
        <ProgressRing progress={progress} phase={phase}>
          <span className="text-2xl font-mono font-bold text-white tracking-tight">
            {formatSeconds(remainingSeconds)}
          </span>
          <span className={`text-[11px] font-bold tracking-widest uppercase mt-0.5 ${meta.color}`}>
            {meta.label}
          </span>
        </ProgressRing>

        {/* Session info */}
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span>
            {phase === "idle"
              ? "Ready to start"
              : `Session ${displaySession} of ${totalSessions}`}
          </span>
          <span>•</span>
          {/* Dot indicators */}
          <div className="flex gap-1">
            {Array.from({ length: totalSessions }).map(
              (_, i) => (
                <span
                  key={i}
                  className={`inline-block h-1.5 w-1.5 rounded-full transition-colors ${
                    i < (sessionCount % totalSessions)
                      ? "bg-violet-400"
                      : "bg-white/20"
                  }`}
                />
              )
            )}
          </div>
        </div>

        {/* Active block badge */}
        {activeBlock && (
          <div className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs">
            <p className="font-semibold text-white/80 truncate">{activeBlock.title}</p>
            <p className="text-white/40 mt-0.5">
              {activeBlock.startTime} – {activeBlock.endTime}
              {integrationMode === "auto" && (
                <span className="ml-1 text-emerald-400/80">● live</span>
              )}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2 w-full">
          {phase === "idle" ? (
            <button
              onClick={() => {
                const started = startTimer(timetableList)
                if (!started && integrationMode === "auto") {
                  showErrorToast("No active timetable schedule block right now!")
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2.5 transition-all"
            >
              <Play className="h-4 w-4" />
              Start Focus
            </button>
          ) : (
            <>
              {/* Pause/Resume */}
              <button
                onClick={() => {
                  if (isRunning) {
                    pauseTimer()
                  } else {
                    const started = startTimer(timetableList)
                    if (!started && integrationMode === "auto") {
                      showErrorToast("No active timetable schedule block right now!")
                    }
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold py-2.5 transition-all ${
                  isRunning
                    ? "bg-amber-600 hover:bg-amber-500"
                    : "bg-violet-600 hover:bg-violet-500"
                }`}
                aria-label={isRunning ? "Pause timer" : "Resume timer"}
              >
                {isRunning ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isRunning ? "Pause" : "Resume"}
              </button>

              {/* Skip */}
              <button
                onClick={skipPhase}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-white/70 transition-all"
                aria-label="Skip to next phase"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              {/* Stop */}
              <button
                onClick={stopTimer}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-all"
                aria-label="Stop timer"
              >
                <Square className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
