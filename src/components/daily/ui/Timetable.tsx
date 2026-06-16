"use client"

import React from "react"
import { TimetableBlock } from "@/hooks/useDaily"
import { Plus, Trash2, Clock, Loader2, CalendarRange, AlertCircle } from "lucide-react"

const COLORS: Record<string, { bg: string; text: string; border: string; bullet: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-500 dark:text-blue-400", border: "border-blue-500/20", bullet: "bg-blue-500" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-500 dark:text-emerald-400", border: "border-emerald-500/20", bullet: "bg-emerald-500" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500 dark:text-purple-400", border: "border-purple-500/20", bullet: "bg-purple-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500 dark:text-amber-400", border: "border-amber-500/20", bullet: "bg-amber-500" },
  red: { bg: "bg-rose-500/10", text: "text-rose-500 dark:text-rose-400", border: "border-rose-500/20", bullet: "bg-rose-500" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-500 dark:text-pink-400", border: "border-pink-500/20", bullet: "bg-pink-500" },
  teal: { bg: "bg-teal-500/10", text: "text-teal-500 dark:text-teal-400", border: "border-teal-500/20", bullet: "bg-teal-500" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-500 dark:text-orange-400", border: "border-orange-500/20", bullet: "bg-orange-500" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-500 dark:text-indigo-400", border: "border-indigo-500/20", bullet: "bg-indigo-500" },
  slate: { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400", border: "border-slate-500/20", bullet: "bg-slate-500" },
}

function calculateDuration(start: string, end: string): string {
  try {
    const [startH, startM] = start.split(":").map(Number)
    const [endH, endM] = end.split(":").map(Number)
    let diffMins = endH * 60 + endM - (startH * 60 + startM)
    if (diffMins < 0) diffMins += 24 * 60
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m` : ""}`.trim() || "0m"
  } catch {
    return ""
  }
}

interface TimetableProps {
  isLoading: boolean
  isError: boolean
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  title: string
  setTitle: (t: string) => void
  startTime: string
  setStartTime: (t: string) => void
  endTime: string
  setEndTime: (t: string) => void
  category: string
  setCategory: (c: string) => void
  scheduleType: "fixed" | "custom"
  setScheduleType: (t: "fixed" | "custom") => void
  errorMsg: string | null
  handleAddBlock: (e: React.FormEvent) => Promise<void>
  handleDeleteBlock: (id: string) => Promise<void>
  activeDayBlocks: TimetableBlock[]
  isPendingCreate: boolean
}

export function Timetable({
  isLoading,
  isError,
  showAddForm,
  setShowAddForm,
  title,
  setTitle,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  category,
  setCategory,
  scheduleType,
  setScheduleType,
  errorMsg,
  handleAddBlock,
  handleDeleteBlock,
  activeDayBlocks,
  isPendingCreate,
}: TimetableProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Timetable Schedule
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Flexible schedule blocks for today
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-sidebar-primary px-3 py-1.5 text-xs font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/90 hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? "Cancel" : "Add Block"}
        </button>
      </div>

      {/* Add Block Form Card */}
      {showAddForm && (
        <form
          onSubmit={handleAddBlock}
          className="rounded-xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-md space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="blockTitle" className="text-xs font-bold text-muted-foreground">
                Block Title
              </label>
              <input
                id="blockTitle"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep Work, Workout, Lunch Break..."
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="startTime" className="text-xs font-bold text-muted-foreground">
                Start Time
              </label>
              <input
                id="startTime"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="endTime" className="text-xs font-bold text-muted-foreground">
                End Time
              </label>
              <input
                id="endTime"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="blockCategory" className="text-xs font-bold text-muted-foreground">
                Category
              </label>
              <select
                id="blockCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Business">Business</option>
                <option value="Playing">Playing</option>
                <option value="Social">Social</option>
                <option value="Education">Education</option>
                <option value="Project">Project</option>
                <option value="Family">Family</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="scheduleType" className="text-xs font-bold text-muted-foreground">
                Schedule Type
              </label>
              <select
                id="scheduleType"
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value as "fixed" | "custom")}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
              >
                <option value="custom">This Day Only (Custom)</option>
                <option value="fixed">Every Day (Fixed)</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-destructive flex items-center gap-1 font-semibold">
              <AlertCircle className="h-3.5 w-3.5" />
              {errorMsg}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPendingCreate}
              className="rounded-lg bg-sidebar-primary px-3 py-1.5 text-xs font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary/95 flex items-center gap-1"
            >
              {isPendingCreate ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Save Block"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Timeline List Card */}
      <div className="relative border border-border bg-card rounded-2xl p-6 shadow-sm dark:bg-card/50">
        {isLoading ? (
          <div className="relative border-l border-border pl-6 space-y-6">
            <div className="relative">
              <span className="absolute -left-[30px] top-1.5 flex h-3 w-3 rounded-full border-2 border-background bg-muted animate-pulse" />
              <div className="h-16 w-full bg-muted/20 animate-pulse rounded-xl border border-border/40" />
            </div>
            <div className="relative">
              <span className="absolute -left-[30px] top-1.5 flex h-3 w-3 rounded-full border-2 border-background bg-muted animate-pulse" />
              <div className="h-16 w-full bg-muted/20 animate-pulse rounded-xl border border-border/40" />
            </div>
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-sm text-destructive font-semibold">
            Error loading timetable. Please check database configuration.
          </div>
        ) : activeDayBlocks.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
            <CalendarRange className="h-10 w-10 text-muted-foreground/50" />
            <span>No events scheduled for this day of week.</span>
          </div>
        ) : (
          <div className="relative border-l border-border pl-6 space-y-6">
            {activeDayBlocks.map((block) => {
              const theme = COLORS[block.color] || COLORS.blue
              const duration = calculateDuration(block.startTime, block.endTime)

              return (
                <div key={block.id} className="relative group">
                  {/* Timeline bullet node */}
                  <div className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-background ${theme.bullet}`} />

                  {/* Scheduled Block Box */}
                  <div className={`flex items-start justify-between rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${theme.bg} ${theme.border}`}>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {block.startTime} - {block.endTime}
                        </span>
                        {duration && (
                          <span className="rounded-full bg-background/50 px-2 py-0.5 text-[10px]">
                            {duration}
                          </span>
                        )}
                        {block.dayOfWeek === -1 && (
                          <span className="rounded-full bg-sidebar-primary/10 text-sidebar-primary dark:bg-sidebar-primary/20 dark:text-violet-400 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
                            Every Day
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-foreground">
                        {block.title}
                      </h4>
                      
                      {block.category && (
                        <span className={`inline-block text-[10px] font-bold tracking-wide uppercase ${theme.text}`}>
                          {block.category}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      aria-label="Delete schedule block"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
