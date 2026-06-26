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
  duration: string
  setDuration: (t: string) => void
  isTodo: boolean
  setIsTodo: (t: boolean) => void
  category: string
  setCategory: (c: string) => void
  scheduleType: "custom" | "weekly" | "fixed"
  setScheduleType: (t: "custom" | "weekly" | "fixed") => void
  timetableDate: string
  setTimetableDate: (d: string) => void
  timetableDayOfWeek: number
  setTimetableDayOfWeek: (w: number) => void
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
  duration,
  setDuration,
  isTodo,
  setIsTodo,
  category,
  setCategory,
  scheduleType,
  setScheduleType,
  timetableDate,
  setTimetableDate,
  timetableDayOfWeek,
  setTimetableDayOfWeek,
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-2 space-y-1.5">
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
              <label htmlFor="duration" className="text-xs font-bold text-muted-foreground">
                Duration (minutes)
              </label>
              <input
                id="duration"
                type="number"
                min="1"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Minutes"
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

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                onChange={(e) => setScheduleType(e.target.value as "custom" | "weekly" | "fixed")}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
              >
                <option value="custom">Specific Date (One-off)</option>
                <option value="weekly">Specific Day of Week (Weekly)</option>
                <option value="fixed">Every Day (Fixed)</option>
              </select>
            </div>

            {scheduleType === "custom" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label htmlFor="timetableDate" className="text-xs font-bold text-muted-foreground">
                  Choose Date
                </label>
                <input
                  id="timetableDate"
                  type="date"
                  required
                  value={timetableDate}
                  onChange={(e) => setTimetableDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
                />
              </div>
            )}

            {scheduleType === "weekly" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label htmlFor="timetableDayOfWeek" className="text-xs font-bold text-muted-foreground">
                  Choose Day
                </label>
                <select
                  id="timetableDayOfWeek"
                  value={timetableDayOfWeek}
                  onChange={(e) => setTimetableDayOfWeek(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>
            )}

            <div className="flex items-end pb-0.5">
              <button
                type="button"
                onClick={() => setIsTodo(!isTodo)}
                className={`flex items-center justify-between w-full rounded-lg border px-3 py-1.5 transition-all duration-200 text-left h-[38px] cursor-pointer select-none ${
                  isTodo
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "border-border bg-card/25 hover:border-border/80 hover:bg-card/40 text-muted-foreground"
                }`}
              >
                <div className="flex flex-col justify-center min-w-0">
                  <span className={`text-xs font-bold leading-tight ${isTodo ? "text-emerald-500 dark:text-emerald-400" : "text-foreground"}`}>
                    To-Do / Focus Task
                  </span>
                  <span className="text-[9px] opacity-70 leading-tight truncate">
                    Integrate in Pomodoro
                  </span>
                </div>
                <div
                  className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out px-0.5 ${
                    isTodo ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      isTodo ? "translate-x-3" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
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
                        {block.isTodo && (
                          <span className="rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
                            To-Do
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
