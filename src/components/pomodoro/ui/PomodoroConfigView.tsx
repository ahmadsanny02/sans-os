"use client"

import React from "react"
import {
  Timer,
  Play,
  Save,
  Clock,
  Coffee,
  Star,
  LayoutGrid,
  Zap,
  Calendar,
  Target,
  Volume2,
} from "lucide-react"
import { UsePomodoroPageReturn } from "@/hooks/usePomodoroPage"
import { IntegrationMode } from "@/store/pomodoroStore"
import { TimetableBlock } from "@/hooks/useDaily"
import { playPomodoroSound } from "@/lib/pomodoroSound"

// ---------- Sub-components ----------

interface SliderCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  color: string
  onChange: (v: number) => void
}

function SliderCard({
  icon: Icon,
  label,
  description,
  value,
  min,
  max,
  step,
  unit,
  color,
  onChange,
}: SliderCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/30 p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${color} bg-opacity-10`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className={`text-2xl font-black tabular-nums ${color}`}>
          {value}
          <span className="text-sm font-semibold ml-0.5 opacity-70">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-600"
        aria-label={label}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground/60 font-medium">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  )
}

interface ModeBadgeProps {
  active: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  onClick: () => void
}

function ModeBadge({ active, icon: Icon, label, description, onClick }: ModeBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all ${
        active
          ? "border-violet-500/60 bg-violet-500/10 shadow-sm"
          : "border-border bg-card/20 hover:border-border/80 hover:bg-card/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={`h-4 w-4 ${active ? "text-violet-400" : "text-muted-foreground"}`}
        />
        <span
          className={`text-sm font-bold ${active ? "text-violet-400" : "text-foreground"}`}
        >
          {label}
        </span>
        {active && (
          <span className="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-semibold border border-violet-500/30">
            Active
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed pl-6">
        {description}
      </p>
    </button>
  )
}

// ---------- Block Card ----------

interface BlockSelectorProps {
  todayBlocks: TimetableBlock[]
  selectedBlockId: string | null
  onSelect: (id: string) => void
  estimatedSessions: number
  focusDuration: number
  breakDuration: number
}

function BlockSelector({
  todayBlocks,
  selectedBlockId,
  onSelect,
  estimatedSessions,
  focusDuration,
  breakDuration,
}: BlockSelectorProps) {
  if (todayBlocks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
        No schedule blocks found for today.{" "}
        <a href="/daily" className="underline text-violet-400">
          Add one in Daily Flow
        </a>
        .
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {todayBlocks.map((block) => {
        const isActive = block.id === selectedBlockId
        const startMin =
          Number(block.startTime.split(":")[0]) * 60 +
          Number(block.startTime.split(":")[1])
        const endMin =
          Number(block.endTime.split(":")[0]) * 60 +
          Number(block.endTime.split(":")[1])
        const durationMins = endMin - startMin
        const sessions = Math.floor(durationMins / (focusDuration + breakDuration))
        const colorDot: Record<string, string> = {
          blue: "bg-blue-500",
          violet: "bg-violet-500",
          emerald: "bg-emerald-500",
          rose: "bg-rose-500",
          amber: "bg-amber-500",
          cyan: "bg-cyan-500",
        }

        return (
          <button
            key={block.id}
            type="button"
            onClick={() => onSelect(block.id)}
            className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
              isActive
                ? "border-violet-500/50 bg-violet-500/10"
                : "border-border bg-card/20 hover:border-border/70"
            }`}
          >
            <span
              className={`h-3 w-3 shrink-0 rounded-full ${colorDot[block.color] ?? "bg-violet-500"}`}
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${isActive ? "text-violet-400" : "text-foreground"}`}>
                {block.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {block.startTime} – {block.endTime} · {durationMins}m
              </p>
            </div>
            {sessions > 0 && (
              <span className="shrink-0 text-[11px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                ~{sessions} <Target className="h-3 w-3 shrink-0" />
              </span>
            )}
          </button>
        )
      })}
      {selectedBlockId && estimatedSessions > 0 && (
        <div className="rounded-xl bg-violet-500/5 border border-violet-500/20 px-4 py-3 flex items-center gap-2 text-xs">
          <Zap className="h-3.5 w-3.5 text-violet-400 shrink-0" />
          <span className="text-violet-300">
            Estimated{" "}
            <strong>{estimatedSessions} Pomodoro sessions</strong> fit in this
            block ({focusDuration}m focus + {breakDuration}m break each).
          </span>
        </div>
      )}
    </div>
  )
}

// ---------- Main View ----------

export function PomodoroConfigView({
  localConfig,
  isDirty,
  handleUpdateLocalConfig,
  handleSaveConfig,
  integrationMode,
  handleSetMode,
  selectedBlockId,
  handleSelectBlock,
  todayBlocks,
  autoActiveBlock,
  estimatedSessions,
  timetableLoading,
  todayString,
  phase,
  handleQuickStart,
}: UsePomodoroPageReturn) {
  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/5 p-8 shadow-sm">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-500 dark:text-violet-400">
            <Timer className="h-3.5 w-3.5" /> Pomodoro Settings
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Focus Configuration
          </h1>
          <p className="text-sm text-muted-foreground">
            Customize your Pomodoro sessions, break durations, and timetable
            block integration.
          </p>
        </div>
      </div>

      {/* Quick Start Card */}
      <div className="rounded-2xl border border-border bg-card/25 dark:bg-card/10 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-foreground">
              {phase === "idle" ? "Ready to Focus?" : "Timer in Progress"}
            </p>
            <p className="text-xs text-muted-foreground">
              {phase === "idle"
                ? "Start a session using your current configuration."
                : "A Pomodoro session is already running."}
            </p>
          </div>
          <button
            onClick={handleQuickStart}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all"
          >
            <Play className="h-4 w-4" />
            {phase === "idle" ? "Start Pomodoro" : "Open Timer"}
          </button>
        </div>
      </div>

      {/* Timer Config */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-violet-400" />
          Timer Durations
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <SliderCard
            icon={Timer}
            label="Focus Duration"
            description="Work sprint length"
            value={localConfig.focusDuration}
            min={5}
            max={60}
            step={5}
            unit="min"
            color="text-violet-500"
            onChange={(v) => handleUpdateLocalConfig({ focusDuration: v })}
          />
          <SliderCard
            icon={Coffee}
            label="Short Break"
            description="Brief rest between sessions"
            value={localConfig.breakDuration}
            min={1}
            max={30}
            step={1}
            unit="min"
            color="text-emerald-500"
            onChange={(v) => handleUpdateLocalConfig({ breakDuration: v })}
          />
          <SliderCard
            icon={Star}
            label="Long Break"
            description="Extended rest after full cycle"
            value={localConfig.longBreakDuration}
            min={5}
            max={60}
            step={5}
            unit="min"
            color="text-cyan-500"
            onChange={(v) => handleUpdateLocalConfig({ longBreakDuration: v })}
          />
          <SliderCard
            icon={LayoutGrid}
            label="Sessions / Cycle"
            description="Focus sessions before long break"
            value={localConfig.sessionsBeforeLongBreak}
            min={2}
            max={8}
            step={1}
            unit=""
            color="text-amber-500"
            onChange={(v) =>
              handleUpdateLocalConfig({ sessionsBeforeLongBreak: v })
            }
          />
        </div>


        {/* Sound Settings */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-violet-400" />
            Sound Settings
          </h2>

          <div className="rounded-2xl border border-border bg-card/25 dark:bg-card/10 p-5 space-y-5">
            {/* Sound Toggle & Test Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-foreground">
                  Sound Notifications
                </span>
                <p className="text-xs text-muted-foreground">
                  Play acoustic tones when a focus or break period starts.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {localConfig.soundEnabled && (
                  <div className="flex items-center gap-1.5 rounded-xl bg-zinc-800/50 dark:bg-zinc-900/50 border border-border/50 p-1">
                    <span className="text-[10px] text-muted-foreground font-semibold px-2 uppercase tracking-wider">Test:</span>
                    <button
                      type="button"
                      onClick={() => playPomodoroSound("focus", localConfig)}
                      className="flex items-center gap-1 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-850 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                      title="Test focus sound"
                    >
                      Focus
                    </button>
                    <div className="h-3 w-px bg-border/50" />
                    <button
                      type="button"
                      onClick={() => playPomodoroSound("break", localConfig)}
                      className="flex items-center gap-1 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-850 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                      title="Test break sound"
                    >
                      Break
                    </button>
                    <div className="h-3 w-px bg-border/50" />
                    <button
                      type="button"
                      onClick={() => playPomodoroSound("long-break", localConfig)}
                      className="flex items-center gap-1 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-850 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                      title="Test long break sound"
                    >
                      Long
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleUpdateLocalConfig({ soundEnabled: !localConfig.soundEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    localConfig.soundEnabled ? "bg-violet-600" : "bg-zinc-700"
                  }`}
                  role="switch"
                  aria-checked={localConfig.soundEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      localConfig.soundEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Volume and Wave Type Controls */}
            {localConfig.soundEnabled && (
              <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-border/40">
                {/* Volume Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span>Notification Volume</span>
                    <span className="text-violet-400 tabular-nums">
                      {Math.round(localConfig.soundVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={localConfig.soundVolume}
                    onChange={(e) => handleUpdateLocalConfig({ soundVolume: Number(e.target.value) })}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-600 bg-zinc-800"
                    aria-label="Sound notification volume"
                  />
                </div>

                {/* Wave Type Selector */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-foreground">
                    Sound Style (Tone Type)
                  </span>
                  <select
                    value={localConfig.soundType}
                    onChange={(e) => handleUpdateLocalConfig({ soundType: e.target.value as "sine" | "triangle" | "square" | "sawtooth" })}
                    className="w-full rounded-xl border border-border bg-zinc-900/60 px-3.5 py-2 text-xs text-white focus:border-violet-500/80 outline-none transition-colors cursor-pointer"
                  >
                    <option value="sine">Sine (Soft Chime)</option>
                    <option value="triangle">Triangle (Retro Warm)</option>
                    <option value="square">Square (Retro Arcade)</option>
                    <option value="sawtooth">Sawtooth (Bright Alarm)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timetable Integration */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-400" />
            Timetable Integration
          </h2>

          <div className="flex flex-col lg:flex-row gap-3">
            <ModeBadge
              active={integrationMode === "auto"}
              icon={Zap}
              label="Auto"
              description="Automatically detects which schedule block is running right now based on the real-time clock."
              onClick={() => handleSetMode("auto" as IntegrationMode)}
            />
            <ModeBadge
              active={integrationMode === "manual"}
              icon={Calendar}
              label="Manual"
              description="You choose which schedule block to associate with your Pomodoro session."
              onClick={() => handleSetMode("manual" as IntegrationMode)}
            />
          </div>

          {/* Auto mode: show all today blocks with active one highlighted */}
          {integrationMode === "auto" && (
            <div className="rounded-xl border border-border bg-card/20 p-4 space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Timetable Schedule — {todayString}
              </p>
              {timetableLoading ? (
                <div className="space-y-2">
                  <div className="h-14 w-full bg-muted/20 animate-pulse rounded-xl" />
                  <div className="h-14 w-full bg-muted/20 animate-pulse rounded-xl" />
                </div>
              ) : todayBlocks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                  No schedule blocks found for today.{" "}
                  <a href="/daily" className="underline text-violet-400">
                    Add one in Daily Flow
                  </a>
                  .
                </div>
              ) : (
                <div className="space-y-2">
                  {todayBlocks
                    .slice()
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((block) => {
                      const isActive = autoActiveBlock?.id === block.id
                      const colorDot: Record<string, string> = {
                        blue: "bg-blue-500",
                        violet: "bg-violet-500",
                        emerald: "bg-emerald-500",
                        rose: "bg-rose-500",
                        amber: "bg-amber-500",
                        cyan: "bg-cyan-500",
                      }
                      const startMin =
                        Number(block.startTime.split(":")[0]) * 60 +
                        Number(block.startTime.split(":")[1])
                      const endMin =
                        Number(block.endTime.split(":")[0]) * 60 +
                        Number(block.endTime.split(":")[1])
                      const durationMins = endMin - startMin
                      const sessions = Math.floor(
                        durationMins / (localConfig.focusDuration + localConfig.breakDuration)
                      )

                      return (
                        <div
                          key={block.id}
                          className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                            isActive
                              ? "border-emerald-500/50 bg-emerald-500/10"
                              : "border-border bg-card/20 opacity-60"
                          }`}
                        >
                          <span
                            className={`h-3 w-3 shrink-0 rounded-full ${
                              isActive ? "bg-emerald-500 animate-pulse" : (colorDot[block.color] ?? "bg-violet-500")
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className={`text-sm font-semibold truncate ${
                                  isActive ? "text-emerald-400" : "text-foreground"
                                }`}
                              >
                                {block.title}
                              </p>
                              {isActive && (
                                <span className="shrink-0 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                                  Detected Active Block
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {block.startTime} – {block.endTime} · {durationMins}m
                            </p>
                          </div>
                          {sessions > 0 && (
                            <span className="shrink-0 text-[11px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              ~{sessions} <Target className="h-3 w-3 shrink-0" />
                            </span>
                          )}
                        </div>
                      )
                    })}
                  {!autoActiveBlock && (
                    <p className="text-xs text-muted-foreground text-center py-1">
                      No block is active right now. Start Focus will be blocked until a schedule block begins.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual mode block selector */}
          {integrationMode === "manual" && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Select Block for Today — {todayString}
              </p>
              {timetableLoading ? (
                <div className="space-y-2">
                  <div className="h-14 w-full bg-muted/20 animate-pulse rounded-xl" />
                  <div className="h-14 w-full bg-muted/20 animate-pulse rounded-xl" />
                </div>
              ) : (
                <BlockSelector
                  todayBlocks={todayBlocks}
                  selectedBlockId={selectedBlockId}
                  onSelect={handleSelectBlock}
                  estimatedSessions={estimatedSessions}
                  focusDuration={localConfig.focusDuration}
                  breakDuration={localConfig.breakDuration}
                />
              )}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="rounded-2xl border border-border bg-card/20 p-5 space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-violet-400" /> How It Works
          </p>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-none">
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              Click the floating timer button in the bottom-right corner to open/close the timer anywhere.
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              A sound plays every time focus or break begins.
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              In <strong className="text-foreground">Auto mode</strong>, the timer automatically shows which block you&apos;re in.
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              In <strong className="text-foreground">Manual mode</strong>, pick a block to see how many sessions fit within it.
            </li>
          </ul>
        </div>

        {/* Floating Save Banner */}
        {isDirty && (
          <div className="flex items-center justify-self-end gap-4 rounded-2xl border border-violet-500/30 bg-zinc-950/90 backdrop-blur-md px-5 py-3.5 max-w-fit shadow-2xl shadow-violet-500/10 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-xl bg-violet-500/10 p-2 text-violet-400 shrink-0">
                <Zap className="h-5 w-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">Unsaved Changes</p>
                <p className="text-[11px] text-muted-foreground truncate">You have modified the Pomodoro configuration.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveConfig}
              className="flex items-center gap-1.5 shrink-0 rounded-xl bg-sidebar-primary hover:bg-sidebar-primary/90 active:scale-95 px-4 py-2 text-xs font-bold text-sidebar-primary-foreground shadow-sm transition-all cursor-pointer"
            >
              <Save className="h-3.5" />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
