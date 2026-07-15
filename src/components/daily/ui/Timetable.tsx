"use client"

import React from "react"
import { TimetableBlock } from "@/hooks/useDaily"
import { Trash2, Clock, CalendarRange, Link2, Pencil } from "lucide-react"
import { useState } from "react"

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
  handleDeleteBlock: (id: string) => Promise<void>
  handleUpdateBlock: (body: {
    id: string
    dayOfWeek?: number
    startTime?: string
    endTime?: string
    title?: string
    category?: string
    color?: string
    date?: string | null
    isTodo?: boolean
    link?: string
  }) => Promise<void>
  activeDayBlocks: TimetableBlock[]
}

const CATEGORY_COLORS: Record<string, string> = {
  Personal: "teal",
  Work: "blue",
  Business: "indigo",
  Playing: "pink",
  Social: "purple",
  Education: "orange",
  Project: "red",
  Family: "green",
  General: "slate",
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  const hStr = h.toString().padStart(2, "0")
  const mStr = m.toString().padStart(2, "0")
  return `${hStr}:${mStr}`
}

export function Timetable({
  isLoading,
  isError,
  handleDeleteBlock,
  handleUpdateBlock,
  activeDayBlocks,
}: TimetableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editLink, setEditLink] = useState("")
  const [editStartTime, setEditStartTime] = useState("08:00")
  const [editEndTime, setEditEndTime] = useState("09:00")
  const [editDuration, setEditDuration] = useState("60")
  const [editCategory, setEditCategory] = useState("General")
  const [editColor, setEditColor] = useState("blue")
  const [editIsTodo, setEditIsTodo] = useState(false)
  const [editScheduleType, setEditScheduleType] = useState<"custom" | "weekly" | "fixed">("custom")
  const [editDate, setEditDate] = useState("")
  const [editDayOfWeek, setEditDayOfWeek] = useState(0)

  const handleStartEdit = (block: TimetableBlock) => {
    setEditingId(block.id)
    setEditTitle(block.title)
    setEditLink(block.link || "")
    setEditStartTime(block.startTime)
    setEditEndTime(block.endTime)
    setEditCategory(block.category || "General")
    setEditColor(block.color || "blue")
    setEditIsTodo(block.isTodo)
    
    if (block.dayOfWeek === -1) {
      setEditScheduleType("fixed")
      setEditDate("")
      setEditDayOfWeek(0)
    } else if (block.date) {
      setEditScheduleType("custom")
      setEditDate(block.date)
      setEditDayOfWeek(block.dayOfWeek)
    } else {
      setEditScheduleType("weekly")
      setEditDate("")
      setEditDayOfWeek(block.dayOfWeek)
    }

    try {
      const startMins = timeToMinutes(block.startTime)
      const endMins = timeToMinutes(block.endTime)
      let diff = endMins - startMins
      if (diff < 0) diff += 24 * 60
      setEditDuration(diff.toString())
    } catch {
      setEditDuration("60")
    }
  }

  const handleStartTimeChange = (newVal: string) => {
    setEditStartTime(newVal)
    if (editDuration) {
      const dur = parseInt(editDuration, 10)
      if (!isNaN(dur) && dur > 0) {
        const startMins = timeToMinutes(newVal)
        const endMins = startMins + dur
        setEditEndTime(minutesToTime(endMins))
      }
    }
  }

  const handleEndTimeChange = (newVal: string) => {
    setEditEndTime(newVal)
    if (editStartTime) {
      const startMins = timeToMinutes(editStartTime)
      const endMins = timeToMinutes(newVal)
      let diff = endMins - startMins
      if (diff < 0) diff += 24 * 60
      setEditDuration(diff.toString())
    }
  }

  const handleDurationChange = (newVal: string) => {
    setEditDuration(newVal)
    const dur = parseInt(newVal, 10)
    if (!isNaN(dur) && dur > 0 && editStartTime) {
      const startMins = timeToMinutes(editStartTime)
      const endMins = startMins + dur
      setEditEndTime(minutesToTime(endMins))
    }
  }

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
      </div>

      {/* Timeline List (Flat Bento Container) */}
      <div className="relative mt-2">
        {isLoading ? (
          <div className="relative border-l border-border/40 pl-6 space-y-6">
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
          <div className="relative border-l border-border/40 pl-6 space-y-6">
            {activeDayBlocks.map((block) => {
              const theme = COLORS[block.color] || COLORS.blue
              const duration = calculateDuration(block.startTime, block.endTime)
              const isEditing = editingId === block.id

              return (
                <div key={block.id} className="relative group">
                  {/* Timeline bullet node */}
                  <div className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-background ${theme.bullet}`} />

                  {isEditing ? (
                    <div className="border border-border/60 bg-card/45 dark:bg-card/20 rounded-2xl p-5 shadow-sm backdrop-blur-md space-y-4">
                      <div className="text-xs font-bold text-muted-foreground">Edit Schedule Block</div>
                      
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {/* Title */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                            required
                          />
                        </div>

                        {/* Link */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Reference Link</label>
                          <input
                            type="url"
                            value={editLink}
                            onChange={(e) => setEditLink(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                            placeholder="https://..."
                          />
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Category</label>
                          <select
                            value={editCategory}
                            onChange={(e) => {
                              const cat = e.target.value
                              setEditCategory(cat)
                              setEditColor(CATEGORY_COLORS[cat] || "blue")
                            }}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
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

                        {/* Start Time */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Start Time</label>
                          <input
                            type="time"
                            value={editStartTime}
                            onChange={(e) => handleStartTimeChange(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                            required
                          />
                        </div>

                        {/* Duration */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Duration (mins)</label>
                          <input
                            type="number"
                            value={editDuration}
                            onChange={(e) => handleDurationChange(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                            required
                          />
                        </div>

                        {/* End Time */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">End Time</label>
                          <input
                            type="time"
                            value={editEndTime}
                            onChange={(e) => handleEndTimeChange(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                            required
                          />
                        </div>

                        {/* Schedule Type */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Schedule Type</label>
                          <select
                            value={editScheduleType}
                            onChange={(e) => {
                              const type = e.target.value as "custom" | "weekly" | "fixed"
                              setEditScheduleType(type)
                            }}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                          >
                            <option value="custom">Specific Date (One-off)</option>
                            <option value="weekly">Specific Day (Weekly)</option>
                            <option value="fixed">Every Day (Fixed)</option>
                          </select>
                        </div>

                        {/* Date Choice if custom */}
                        {editScheduleType === "custom" && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">Choose Date</label>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                              required
                            />
                          </div>
                        )}

                        {/* Day choice if weekly */}
                        {editScheduleType === "weekly" && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">Choose Day</label>
                            <select
                              value={editDayOfWeek}
                              onChange={(e) => setEditDayOfWeek(Number(e.target.value))}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
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

                        {/* Focus Task Toggle */}
                        <div className="flex items-end pb-0.5">
                          <button
                            type="button"
                            onClick={() => setEditIsTodo(!editIsTodo)}
                            className={`flex items-center justify-between w-full rounded-xl border px-3 py-2.5 transition-all duration-200 text-left h-[38px] cursor-pointer select-none ${
                              editIsTodo
                                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                : "border-border bg-card/25 hover:border-border/80 hover:bg-card/40 text-muted-foreground"
                            }`}
                          >
                            <span className={`text-[11px] font-bold leading-tight ${editIsTodo ? "text-emerald-500 dark:text-emerald-400" : "text-foreground"}`}>
                              To-Do / Focus Task
                            </span>
                            <div
                              className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out px-0.5 ${
                                editIsTodo ? "bg-emerald-500" : "bg-zinc-700"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                  editIsTodo ? "translate-x-3" : "translate-x-0"
                                }`}
                              />
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/35 px-4 py-2 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:bg-secondary/60 hover:text-foreground hover:scale-[1.02] active:scale-95 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            if (!editTitle.trim() || editStartTime >= editEndTime) return
                            
                            let finalDayOfWeek = -1
                            let finalDate: string | null = null

                            if (editScheduleType === "fixed") {
                              finalDayOfWeek = -1
                              finalDate = null
                            } else if (editScheduleType === "weekly") {
                              finalDayOfWeek = editDayOfWeek
                              finalDate = null
                            } else {
                              finalDayOfWeek = new Date(editDate).getDay()
                              finalDate = editDate
                            }

                            await handleUpdateBlock({
                              id: block.id,
                              title: editTitle.trim(),
                              link: editLink.trim(),
                              category: editCategory,
                              color: editColor,
                              startTime: editStartTime,
                              endTime: editEndTime,
                              isTodo: editIsTodo,
                              dayOfWeek: finalDayOfWeek,
                              date: finalDate,
                            })
                            setEditingId(null)
                          }}
                          disabled={!editTitle.trim() || editStartTime >= editEndTime}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Scheduled Block Box */
                    <div className={`flex items-start justify-between rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${theme.bg} ${theme.border}`}>
                      <div className="space-y-1 flex-1 min-w-0 pr-2">
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
                            <span className="rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-violet-400 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
                              Every Day
                            </span>
                          )}
                          {block.isTodo && (
                            <span className="rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
                              To-Do
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-base font-bold text-foreground break-words whitespace-normal max-w-full">
                            {block.title}
                          </h4>
                          {block.link && (
                            <a
                              href={block.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                              title="Open Link"
                            >
                              <Link2 className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        
                        {block.category && (
                          <span className={`inline-block text-[10px] font-bold tracking-wide uppercase ${theme.text}`}>
                            {block.category}
                          </span>
                        )}
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex items-center gap-1 transition-all shrink-0">
                        <button
                          onClick={() => handleStartEdit(block)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          aria-label="Edit schedule block"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlock(block.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          aria-label="Delete schedule block"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
