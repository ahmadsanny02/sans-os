"use client"

import React from "react"
import Link from "next/link"
import {
  Timer,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Settings,
  Zap,
  Target,
  Flame,
  CheckCircle2,
  Calendar,
  Coffee,
  Star,
  ExternalLink,
} from "lucide-react"
import { UsePomodoroPageReturn } from "@/hooks/usePomodoroPage"
import { usePomodoroStore } from "@/store/pomodoroStore"
import { startPip } from "./PomodoroPipController"

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

export function PomodoroTimerView({
  localConfig,
  selectedBlockId,
  handleSelectBlock,
  todayBlocks,
  autoActiveBlock,
  estimatedSessions,
  timetableLoading,
  currentTime,
  phase,
  handleQuickStart,
}: UsePomodoroPageReturn) {
  const store = usePomodoroStore()

  const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes()
  const activeOrFutureBlocks = todayBlocks.filter(
    (block) => timeToMinutes(block.endTime) > currentMins
  )

  // Calculate total focus time today in minutes
  const totalFocusMinutesToday = store.sessionCount * localConfig.focusDuration

  // Determine current active block details
  const activeBlock = todayBlocks.find((b) => b.id === (selectedBlockId || autoActiveBlock?.id))

  // Calculate progress percentage for SVG ring
  const totalSeconds =
    phase === "focus"
      ? localConfig.focusDuration * 60
      : phase === "break"
      ? localConfig.breakDuration * 60
      : phase === "long-break"
      ? localConfig.longBreakDuration * 60
      : localConfig.focusDuration * 60

  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalSeconds - store.remainingSeconds) / totalSeconds) * 100)
  )

  const strokeDashoffset = 565.48 * (1 - progressPercent / 100)

  const phaseMeta = {
    focus: { label: "Focus Sprint", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
    break: { label: "Short Break", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    "long-break": { label: "Long Rest", color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
    idle: { label: "Ready to Focus", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  }[phase]

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-4 animate-in fade-in duration-200">
      {/* Header Banner with Configure Quick-Link */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Timer className="h-3.5 w-3.5" /> Live Pomodoro Dashboard
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Focus Studio</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Immerse yourself in deep work. Track active sprints, sync with daily flow blocks, and manage live sessions.
          </p>
        </div>

        <Link
          href="/settings?tab=pomodoro"
          className="relative z-10 flex shrink-0 items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-xs font-bold text-foreground shadow-sm hover:bg-secondary transition-all cursor-pointer"
        >
          <Settings className="h-4 w-4 text-primary" />
          Configure Timer & Sounds
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Interactive Timer Ring Display */}
        <div className="lg:col-span-2 bento-card p-8 flex flex-col items-center justify-center space-y-8 min-h-[440px]">
          {/* Phase Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold border ${phaseMeta.border} ${phaseMeta.bg} ${phaseMeta.color}`}>
            <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
            {phaseMeta.label}
          </div>

          {/* SVG Progress Circle & Clock */}
          <div className="relative flex items-center justify-center">
            <svg className="h-72 w-72 transform -rotate-90" viewBox="0 0 200 200">
              {/* Background Ring */}
              <circle
                cx="100"
                cy="100"
                r="90"
                className="stroke-secondary"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="100"
                cy="100"
                r="90"
                className="stroke-primary transition-all duration-1000 ease-linear"
                strokeWidth="10"
                strokeDasharray="565.48"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Center Clock Text & Subtitle */}
            <div className="absolute flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-5xl sm:text-6xl font-black tracking-tighter tabular-nums text-foreground">
                {formatTime(store.remainingSeconds)}
              </span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {activeBlock ? activeBlock.title : "Unassigned Sprint"}
              </span>
            </div>
          </div>

          {/* Timer Action Controls */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => store.stopTimer()}
              className="p-3 rounded-xl border border-border/60 bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            {!store.isRunning ? (
              <button
                onClick={() => {
                  if (phase === "idle") {
                    handleQuickStart()
                  } else {
                    store.startTimer(todayBlocks)
                  }
                }}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-glow hover:bg-primary/95 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="h-5 w-5 fill-current" />
                {phase === "idle" ? "Start Sprint" : "Resume"}
              </button>
            ) : (
              <button
                onClick={() => store.pauseTimer()}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-amber-500 text-white font-black text-sm shadow-md hover:bg-amber-600 transition-all active:scale-95 cursor-pointer"
              >
                <Pause className="h-5 w-5 fill-current" />
                Pause
              </button>
            )}

            <button
              onClick={() => store.skipPhase()}
              className="p-3 rounded-xl border border-border/60 bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Skip to Next Phase"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Widgets: Live Session Stats & Timetable Picker */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Daily Stats Card */}
          <div className="bento-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Daily Focus Overview
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary/40 border border-border/40 p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed</span>
                <p className="text-xl font-extrabold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {store.sessionCount} <span className="text-xs text-muted-foreground font-normal">sprints</span>
                </p>
              </div>

              <div className="rounded-xl bg-secondary/40 border border-border/40 p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Focus Time</span>
                <p className="text-xl font-extrabold text-foreground flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-500" />
                  {totalFocusMinutesToday} <span className="text-xs text-muted-foreground font-normal">mins</span>
                </p>
              </div>
            </div>
          </div>

          {/* Timetable Target Selection */}
          <div className="bento-card p-6 space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Associated Block
              </h3>
              {selectedBlockId && (
                <button
                  onClick={() => handleSelectBlock(null)}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {activeOrFutureBlocks.map((block) => {
                const isSelected = selectedBlockId === block.id
                return (
                  <button
                    key={block.id}
                    onClick={() => handleSelectBlock(block.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 font-bold"
                        : "border-border/40 bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="space-y-0.5 truncate">
                      <p className="font-bold truncate text-foreground">{block.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {block.startTime} – {block.endTime} · {block.category || "General"}
                      </p>
                    </div>
                    {isSelected && <Target className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                )
              })}

              {activeOrFutureBlocks.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No upcoming timetable blocks for today.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
