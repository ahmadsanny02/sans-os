"use client"

import React, { useMemo, useState, useEffect } from "react"
import { usePomodoroStore, PomodoroPhase } from "@/store/pomodoroStore"
import { useTimetableQuery, TimetableBlock } from "@/hooks/useDaily"
import { showErrorToast } from "@/lib/sweetalert"
import {
  Play,
  Pause,
  Square,
  SkipForward,
  Minimize2,
  Timer,
  Target,
} from "lucide-react"

// ---------- Helpers ----------

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, "0")
  const s = (secs % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

const PHASE_META: Record<
  PomodoroPhase,
  { label: string; emoji: string; color: string; border: string; bg: string; glow: string }
> = {
  idle: {
    label: "Ready",
    emoji: "🎯",
    color: "text-primary",
    border: "border-zinc-700/60",
    bg: "bg-zinc-800/10",
    glow: "shadow-zinc-500/5",
  },
  focus: {
    label: "Focus",
    emoji: "🎯",
    color: "text-primary",
    border: "border-primary",
    bg: "bg-primary/10",
    glow: "shadow-primary/20",
  },
  break: {
    label: "Break",
    emoji: "☕",
    color: "text-emerald-400",
    border: "border-emerald-500",
    bg: "bg-emerald-500/10",
    glow: "shadow-emerald-500/20",
  },
  "long-break": {
    label: "Long Break",
    emoji: "🌟",
    color: "text-cyan-400",
    border: "border-cyan-500",
    bg: "bg-cyan-500/10",
    glow: "shadow-cyan-500/20",
  },
}

export function PomodoroPipView() {
  const isRunning = usePomodoroStore((s) => s.isRunning)
  const phase = usePomodoroStore((s) => s.phase)
  const remainingSeconds = usePomodoroStore((s) => s.remainingSeconds)
  const sessionCount = usePomodoroStore((s) => s.sessionCount)
  const config = usePomodoroStore((s) => s.config)
  const integrationMode = usePomodoroStore((s) => s.integrationMode)
  const selectedBlockId = usePomodoroStore((s) => s.selectedBlockId)
  const activeBlockSessions = usePomodoroStore((s) => s.activeBlockSessions)

  const isPipExpanded = usePomodoroStore((s) => s.isPipExpanded)
  const setIsPipExpanded = usePomodoroStore((s) => s.setIsPipExpanded)

  const startTimer = usePomodoroStore((s) => s.startTimer)
  const pauseTimer = usePomodoroStore((s) => s.pauseTimer)
  const stopTimer = usePomodoroStore((s) => s.stopTimer)
  const skipPhase = usePomodoroStore((s) => s.skipPhase)

  const { data: timetableList = [] } = useTimetableQuery()

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
    const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes()
    const todayDayOfWeek = currentTime.getDay()
    const todayBlocks = timetableList.filter((b) => (b.dayOfWeek === -1 || b.date === todayStr || (b.dayOfWeek === todayDayOfWeek && !b.date)) && b.isTodo)
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

  const meta = PHASE_META[phase]
  const totalSessions = activeBlockSessions || config.sessionsBeforeLongBreak
  const displaySession = useMemo(() => {
    if (phase === "focus") {
      return (sessionCount % totalSessions) + 1
    }
    const completedInCycle = sessionCount % totalSessions
    return completedInCycle === 0 ? totalSessions : completedInCycle
  }, [phase, sessionCount, totalSessions])

  // Render Circle Mode (Collapsed)
  if (!isPipExpanded) {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center bg-zinc-950 p-1">
        <button
          onClick={() => setIsPipExpanded(true)}
          className={`w-[138px] h-[138px] rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300 text-left outline-none ${meta.border} ${meta.bg} shadow-lg ${meta.glow} hover:scale-105 hover:bg-zinc-800/40`}
          title="Click to expand controls"
        >
          <span className={`text-[10px] font-extrabold tracking-widest uppercase opacity-70 ${meta.color} leading-none mb-0.5`}>
            {meta.label}
          </span>
          <span className="text-[19px] font-mono font-black text-white tracking-tight leading-none my-0.5">
            {formatSeconds(remainingSeconds)}
          </span>
          <span className="text-[9px] font-bold text-white/40 leading-none flex items-center gap-0.5 justify-center">
            {sessionCount} <Target className="h-2.5 w-2.5 text-primary" />
          </span>
        </button>
      </div>
    )
  }

  // Render Square Mode (Expanded)
  return (
    <div className="w-full h-full min-h-screen flex flex-col bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/5 bg-zinc-900/60 shrink-0">
        <div className="flex items-center gap-1.5">
          <Timer className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-black text-white/80 tracking-widest uppercase">
            Pomodoro
          </span>
        </div>
        <button
          onClick={() => setIsPipExpanded(false)}
          className="rounded p-1 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
          title="Minimize to circle"
        >
          <Minimize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-3 gap-3">
        {/* Countdown Timer Display */}
        <div className="flex flex-col items-center select-none">
          <span className="text-4xl font-mono font-black tracking-tighter text-white tabular-nums">
            {formatSeconds(remainingSeconds)}
          </span>
          <span className={`text-xs font-bold tracking-widest uppercase mt-0.5 ${meta.color}`}>
            {meta.label} {phase !== "idle" && `${displaySession}/${totalSessions}`}
          </span>
        </div>

        {/* Completed dots */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalSessions }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i < (sessionCount % totalSessions)
                  ? "bg-primary"
                  : "bg-white/15"
              }`}
            />
          ))}
        </div>

        {/* Active schedule block badge */}
        {activeBlock && (
          <div className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-center max-w-[220px]">
            <p className="font-semibold text-white/90 text-[11px] truncate leading-tight">
              {activeBlock.title}
            </p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center gap-2 w-full max-w-[220px] mt-1">
          {phase === "idle" ? (
            <button
              onClick={() => {
                const started = startTimer(timetableList)
                if (!started && integrationMode === "auto") {
                  showErrorToast("No active timetable schedule block right now!")
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold py-2 transition-all"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Start Focus
            </button>
          ) : (
            <>
              {/* Pause/Play */}
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
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold py-2 transition-all ${
                  isRunning
                    ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                {isRunning ? "Pause" : "Resume"}
              </button>

              {/* Skip */}
              <button
                onClick={skipPhase}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-white/70 transition-all"
                title="Skip Phase"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>

              {/* Stop */}
              <button
                onClick={stopTimer}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-all"
                title="Stop Timer"
              >
                <Square className="h-3.5 w-3.5 fill-rose-400" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
