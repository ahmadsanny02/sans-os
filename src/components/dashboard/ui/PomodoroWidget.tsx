"use client"

import React, { useEffect, useMemo } from "react"
import { usePomodoroStore, PomodoroPhase } from "@/store/pomodoroStore"
import { Badge } from "@/components/ui/Badge"
import { TimetableBlock } from "@/hooks/useDaily"
import { showError, showErrorToast } from "@/lib/sweetalert"
import {
  Play,
  Pause,
  Square,
  Timer,
  ExternalLink,
  Target,
  Flame,
  Settings
} from "lucide-react"

interface PomodoroWidgetProps {
  activeDayBlocks: TimetableBlock[]
}

const PHASE_CONFIG: Record<
  PomodoroPhase,
  { label: string; colorClass: string; bgClass: string; borderClass: string; textClass: string }
> = {
  idle: {
    label: "Ready to Focus",
    colorClass: "bg-muted-foreground/30",
    bgClass: "bg-secondary/20",
    borderClass: "border-border/60",
    textClass: "text-muted-foreground",
  },
  focus: {
    label: "Focus Session",
    colorClass: "bg-primary",
    bgClass: "bg-primary/5",
    borderClass: "border-primary/20",
    textClass: "text-primary",
  },
  break: {
    label: "Short Break",
    colorClass: "bg-emerald-500",
    bgClass: "bg-emerald-500/5",
    borderClass: "border-emerald-500/20",
    textClass: "text-emerald-500 dark:text-emerald-400",
  },
  "long-break": {
    label: "Long Break",
    colorClass: "bg-amber-500",
    bgClass: "bg-amber-500/5",
    borderClass: "border-amber-500/20",
    textClass: "text-amber-500 dark:text-amber-400",
  },
}

export function PomodoroWidget({ activeDayBlocks }: PomodoroWidgetProps) {
  // Store values
  const isRunning = usePomodoroStore((s) => s.isRunning)
  const phase = usePomodoroStore((s) => s.phase)
  const remainingSeconds = usePomodoroStore((s) => s.remainingSeconds)
  const sessionCount = usePomodoroStore((s) => s.sessionCount)
  const config = usePomodoroStore((s) => s.config)
  const integrationMode = usePomodoroStore((s) => s.integrationMode)
  const activeBlockSessions = usePomodoroStore((s) => s.activeBlockSessions)
  
  // Store actions
  const startTimer = usePomodoroStore((s) => s.startTimer)
  const pauseTimer = usePomodoroStore((s) => s.pauseTimer)
  const stopTimer = usePomodoroStore((s) => s.stopTimer)
  const openModal = usePomodoroStore((s) => s.openModal)
  const tick = usePomodoroStore((s) => s.tick)
  const adjustForElapsedTime = usePomodoroStore((s) => s.adjustForElapsedTime)

  // Real-time ticking logic while running
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      tick(activeDayBlocks)
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, tick, activeDayBlocks])

  // Sync elapsed time on mount and focus changes
  useEffect(() => {
    adjustForElapsedTime(activeDayBlocks)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        adjustForElapsedTime(activeDayBlocks)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [adjustForElapsedTime, activeDayBlocks])

  // Format MM:SS helper
  const displayTime = useMemo(() => {
    const m = Math.floor(remainingSeconds / 60)
    const s = remainingSeconds % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }, [remainingSeconds])

  // Phase metadata config
  const meta = PHASE_CONFIG[phase]

  // Calculate active progress fraction
  const totalSeconds = useMemo(() => {
    if (phase === "focus") return config.focusDuration * 60
    if (phase === "break") return config.breakDuration * 60
    if (phase === "long-break") return config.longBreakDuration * 60
    return config.focusDuration * 60
  }, [phase, config])

  const progressPercent = useMemo(() => {
    if (phase === "idle" || totalSeconds <= 0) return 0
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100
  }, [phase, remainingSeconds, totalSeconds])

  const totalSessionsNeeded = activeBlockSessions || config.sessionsBeforeLongBreak
  const currentSessionDisplay = useMemo(() => {
    if (phase === "focus") {
      return (sessionCount % totalSessionsNeeded) + 1
    }
    const completed = sessionCount % totalSessionsNeeded
    return completed === 0 ? totalSessionsNeeded : completed
  }, [phase, sessionCount, totalSessionsNeeded])

  const handleToggleTimer = () => {
    if (isRunning) {
      pauseTimer()
    } else {
      const started = startTimer(activeDayBlocks)
      if (!started) {
        if (integrationMode === "auto") {
          showError(
            "No Active Timetable Block",
            "You are in Auto Mode, but there is no active todo block scheduled in your timetable right now. Please switch to Manual Mode in Pomodoro Config or schedule a timetable block for this time."
          )
        } else {
          showErrorToast("Could not start timer. Please check settings.")
        }
      }
    }
  }

  return (
    <div className={`bento-card p-5 space-y-4 transition-all duration-300 border ${meta.borderClass} ${meta.bgClass}`}>
      {/* 1. Header Area */}
      <div className="flex items-center justify-between border-b border-border/30 pb-2">
        <div className="flex items-center gap-2">
          <div className={`rounded-lg p-1.5 shrink-0 ${isRunning ? "text-primary animate-pulse" : "text-muted-foreground"}`}>
            <Timer className="h-4.5 w-4.5" />
          </div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">Focus Session</h3>
        </div>

        <div className="flex items-center gap-2">
          <Badge>
            {integrationMode === "auto" ? "Auto Sync" : "Manual"}
          </Badge>
          <button
            onClick={openModal}
            className="p-1 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Configure Pomodoro Session"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Playback / Timer Body */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${meta.textClass}`}>
            {meta.label}
          </span>
          <h4 className="text-4xl font-black text-foreground font-mono leading-none tracking-tight">
            {displayTime}
          </h4>
        </div>

        {/* 3. Controls Stack */}
        <div className="flex items-center gap-1.5 select-none">
          <button
            onClick={handleToggleTimer}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-all hover:scale-[1.04] active:scale-95 hover:bg-primary/95 cursor-pointer"
            title={isRunning ? "Pause Session" : "Start Session"}
          >
            {isRunning ? <Pause className="h-4 w-4 fill-primary-foreground text-primary-foreground" /> : <Play className="h-4 w-4 fill-primary-foreground text-primary-foreground ml-0.5" />}
          </button>

          {phase !== "idle" && (
            <button
              onClick={stopTimer}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              title="Stop Session"
            >
              <Square className="h-4 w-4 fill-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Progress Indicator */}
      {phase !== "idle" && (
        <div className="space-y-1.5 animate-in fade-in duration-200">
          <div className="w-full bg-secondary/60 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${meta.colorClass}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3 shrink-0" /> Session {currentSessionDisplay}/{totalSessionsNeeded}
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 shrink-0 text-amber-500" /> Completed: {sessionCount}
            </span>
          </div>
        </div>
      )}

      {/* 5. Sub-actions */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 font-bold border-t border-border/20 pt-2 bg-transparent select-none">
        <span className="truncate pr-4">
          {integrationMode === "auto" 
            ? "Tied to timetable blocks" 
            : "Standalone focus timer"}
        </span>
        <button
          onClick={openModal}
          className="flex items-center gap-1 text-primary hover:underline hover:text-primary/90 cursor-pointer shrink-0 transition-colors"
        >
          Expand Controller <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
