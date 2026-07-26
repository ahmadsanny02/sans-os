"use client"

import React, { useState } from "react"
import {
  TimetableBlock,
  TimetableSubSchedule,
  useCreateTimetableSubScheduleMutation,
  useUpdateTimetableSubScheduleMutation,
  useToggleTimetableSubScheduleMutation,
  useDeleteTimetableSubScheduleMutation,
} from "@/hooks/useDaily"
import { Trash2, Clock, CalendarRange, Link2, Pencil, Plus, CheckSquare, Square, X, Check, ListChecks } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { CustomSelect } from "@/components/ui/CustomSelect"
import { CustomTimePicker } from "@/components/ui/CustomTimePicker"
import { isCategoryInModule } from "@/lib/categoryUtils"

const COLORS: Record<string, { bg: string; text: string; border: string; bullet: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-500 dark:text-blue-400", border: "border-blue-500/20", bullet: "bg-blue-500" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-500 dark:text-emerald-400", border: "border-emerald-500/20", bullet: "bg-emerald-500" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500 dark:text-emerald-400", border: "border-emerald-500/20", bullet: "bg-emerald-500" },
  purple: { bg: "bg-violet-500/10", text: "text-violet-500 dark:text-violet-400", border: "border-violet-500/20", bullet: "bg-purple-500" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-500 dark:text-violet-400", border: "border-violet-500/20", bullet: "bg-violet-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500 dark:text-amber-400", border: "border-amber-500/20", bullet: "bg-amber-500" },
  red: { bg: "bg-rose-500/10", text: "text-rose-500 dark:text-rose-400", border: "border-rose-500/20", bullet: "bg-rose-500" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-500 dark:text-rose-400", border: "border-rose-500/20", bullet: "bg-rose-500" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-500 dark:text-pink-400", border: "border-pink-500/20", bullet: "bg-pink-500" },
  teal: { bg: "bg-teal-500/10", text: "text-teal-500 dark:text-teal-400", border: "border-teal-500/20", bullet: "bg-teal-500" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-500 dark:text-orange-400", border: "border-orange-500/20", bullet: "bg-orange-500" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-500 dark:text-indigo-400", border: "border-indigo-500/20", bullet: "bg-indigo-500" },
  slate: { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400", border: "border-slate-500/20", bullet: "bg-slate-500" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500 dark:text-cyan-400", border: "border-cyan-500/20", bullet: "bg-cyan-500" },
  fuchsia: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-500 dark:text-fuchsia-400", border: "border-fuchsia-500/20", bullet: "bg-fuchsia-500" },
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20", bullet: "bg-primary" },
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
    subCategory?: string | null
  }) => Promise<void>
  activeDayBlocks: TimetableBlock[]
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

function TimetableSubSchedulesSection({ block }: { block: TimetableBlock }) {
  const createSubMutation = useCreateTimetableSubScheduleMutation()
  const updateSubMutation = useUpdateTimetableSubScheduleMutation()
  const toggleSubMutation = useToggleTimetableSubScheduleMutation()
  const deleteSubMutation = useDeleteTimetableSubScheduleMutation()

  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newStart, setNewStart] = useState("")
  const [newEnd, setNewEnd] = useState("")

  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editStart, setEditStart] = useState("")
  const [editEnd, setEditEnd] = useState("")

  const subSchedules = block.subSchedules || []
  const completedCount = subSchedules.filter((s) => s.completed).length
  const totalCount = subSchedules.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleCreateSub = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    await createSubMutation.mutateAsync({
      timetableBlockId: block.id,
      title: newTitle.trim(),
      startTime: newStart || null,
      endTime: newEnd || null,
    })
    setNewTitle("")
    setNewStart("")
    setNewEnd("")
    setIsAdding(false)
  }

  const handleStartEditSub = (sub: TimetableSubSchedule) => {
    setEditingSubId(sub.id)
    setEditTitle(sub.title)
    setEditStart(sub.startTime || "")
    setEditEnd(sub.endTime || "")
  }

  const handleSaveEditSub = async (id: string) => {
    if (!editTitle.trim()) return
    await updateSubMutation.mutateAsync({
      id,
      title: editTitle.trim(),
      startTime: editStart || null,
      endTime: editEnd || null,
    })
    setEditingSubId(null)
  }

  return (
    <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <ListChecks className="h-3.5 w-3.5 text-primary" />
          <span>Sub Schedules</span>
          {totalCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-extrabold">
              {completedCount}/{totalCount} ({progress}%)
            </span>
          )}
        </div>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors py-0.5 px-1.5 rounded-lg hover:bg-primary/10 cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>Add Sub</span>
          </button>
        )}
      </div>

      {totalCount > 0 && (
        <div className="w-full h-1.5 rounded-full bg-secondary/80 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Sub-schedules list */}
      {subSchedules.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {subSchedules.map((sub) => {
            const isEditingThis = editingSubId === sub.id

            if (isEditingThis) {
              return (
                <div key={sub.id} className="flex flex-col gap-2 p-2.5 rounded-xl bg-background/90 border border-border text-xs shadow-sm">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Sub-schedule title..."
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 outline-none text-xs focus:border-primary"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <CustomTimePicker
                      value={editStart}
                      onChange={(val) => setEditStart(val)}
                      showIcon={false}
                      inputClassName="rounded-lg border border-border bg-background px-2 py-1 outline-none text-[11px]"
                      className="w-20"
                    />
                    <span className="text-muted-foreground text-[10px]">to</span>
                    <CustomTimePicker
                      value={editEnd}
                      onChange={(val) => setEditEnd(val)}
                      showIcon={false}
                      inputClassName="rounded-lg border border-border bg-background px-2 py-1 outline-none text-[11px]"
                      className="w-20"
                    />
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        type="button"
                        onClick={() => handleSaveEditSub(sub.id)}
                        disabled={!editTitle.trim() || updateSubMutation.isPending}
                        className="p-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSubId(null)}
                        className="p-1 rounded-md bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={sub.id}
                className="group/sub flex items-center justify-between p-2 rounded-xl bg-background/50 hover:bg-background/90 border border-border/40 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <button
                    type="button"
                    onClick={() => toggleSubMutation.mutate({ id: sub.id, completed: !sub.completed })}
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
                    title={sub.completed ? "Mark incomplete" : "Mark completed"}
                  >
                    {sub.completed ? (
                      <CheckSquare className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                  <span
                    className={`break-words ${
                      sub.completed ? "line-through text-muted-foreground/70" : "text-foreground font-medium"
                    }`}
                  >
                    {sub.title}
                  </span>
                  {(sub.startTime || sub.endTime) && (
                    <span className="shrink-0 text-[10px] font-semibold text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded-md">
                      {sub.startTime || "..."} - {sub.endTime || "..."}
                    </span>
                  )}
                </div>

                <div className="opacity-0 group-hover/sub:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleStartEditSub(sub)}
                    className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    title="Edit sub-schedule"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSubMutation.mutate({ id: sub.id, timetableBlockId: block.id })}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Delete sub-schedule"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Sub Schedule Form */}
      {isAdding && (
        <form onSubmit={handleCreateSub} className="flex flex-col gap-2 p-2.5 rounded-xl bg-background/90 border border-primary/30 text-xs shadow-sm animate-in fade-in duration-150">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Sub-schedule title..."
            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 outline-none text-xs focus:border-primary"
            autoFocus
            required
          />
          <div className="flex items-center gap-2">
            <CustomTimePicker
              value={newStart}
              onChange={(val) => setNewStart(val)}
              showIcon={false}
              inputClassName="rounded-lg border border-border bg-background px-2 py-1 outline-none text-[11px]"
              className="w-20"
              placeholder="--:--"
            />
            <span className="text-muted-foreground text-[10px]">to</span>
            <CustomTimePicker
              value={newEnd}
              onChange={(val) => setNewEnd(val)}
              showIcon={false}
              inputClassName="rounded-lg border border-border bg-background px-2 py-1 outline-none text-[11px]"
              className="w-20"
              placeholder="--:--"
            />
            <div className="flex items-center gap-1 ml-auto">
              <button
                type="submit"
                disabled={!newTitle.trim() || createSubMutation.isPending}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false)
                  setNewTitle("")
                }}
                className="p-1 rounded-lg border border-border bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
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
  const [editSubCategory, setEditSubCategory] = useState<string | null>(null)
  const [editColor, setEditColor] = useState("blue")
  const [editIsTodo, setEditIsTodo] = useState(false)
  const [editScheduleType, setEditScheduleType] = useState<"custom" | "weekly" | "fixed">("custom")
  const [editDate, setEditDate] = useState("")
  const [editDayOfWeek, setEditDayOfWeek] = useState(0)
  const { categories, subCategories } = useCategories()
  const timetableCategories = categories.filter((c) => isCategoryInModule(c.module, "timetable"))
  const defaultFallbackCategories = ["General"]

  const activeCatId = categories.find((c) => c.name.toLowerCase() === editCategory.toLowerCase())?.id
  const availableSubs = activeCatId ? subCategories.filter((sc) => sc.categoryId === activeCatId) : []

  const handleStartEdit = (block: TimetableBlock) => {
    setEditingId(block.id)
    setEditTitle(block.title)
    setEditLink(block.link || "")
    setEditStartTime(block.startTime)
    setEditEndTime(block.endTime)
    setEditCategory(block.category || "General")
    setEditSubCategory(block.subCategory || "")
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
              const blockColor = categories.find((c) => c.name.toLowerCase() === block.category?.toLowerCase())?.color || block.color
              const theme = COLORS[blockColor] || COLORS.blue
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

                        {/* Category & Sub-category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">Category</label>
                            <CustomSelect
                              value={editCategory}
                              onChange={(val) => {
                                const cat = String(val)
                                setEditCategory(cat)
                                setEditColor(categories.find((c) => c.name.toLowerCase() === cat.toLowerCase())?.color || "blue")
                                setEditSubCategory("")
                              }}
                              options={
                                timetableCategories.length > 0
                                  ? timetableCategories.map((c) => ({ value: c.name, label: c.name }))
                                  : defaultFallbackCategories.map((catName) => ({ value: catName, label: catName }))
                              }
                              fullWidth
                            />
                          </div>

                          {availableSubs.length > 0 && (
                            <div className="space-y-1.5 animate-in fade-in duration-200">
                              <label className="text-xs font-bold text-muted-foreground">Sub-category</label>
                              <CustomSelect
                                value={editSubCategory || ""}
                                onChange={(val) => setEditSubCategory(String(val) || null)}
                                options={[
                                  { value: "", label: "None (No sub-category)" },
                                  ...availableSubs.map((sc) => ({ value: sc.name, label: sc.name }))
                                ]}
                                fullWidth
                              />
                            </div>
                          )}
                        </div>

                        {/* Start Time */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Start Time</label>
                          <CustomTimePicker
                            value={editStartTime}
                            onChange={(val) => handleStartTimeChange(val)}
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
                          <CustomTimePicker
                            value={editEndTime}
                            onChange={(val) => handleEndTimeChange(val)}
                            required
                          />
                        </div>

                        {/* Schedule Type */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">Schedule Type</label>
                          <CustomSelect
                            value={editScheduleType}
                            onChange={(val) => setEditScheduleType(val as "custom" | "weekly" | "fixed")}
                            options={[
                              { value: "custom", label: "Specific Date (One-off)" },
                              { value: "weekly", label: "Specific Day (Weekly)" },
                              { value: "fixed", label: "Every Day (Fixed)" },
                            ]}
                            fullWidth
                          />
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
                            <CustomSelect
                              value={editDayOfWeek}
                              onChange={(val) => setEditDayOfWeek(Number(val))}
                              options={[
                                { value: 0, label: "Sunday" },
                                { value: 1, label: "Monday" },
                                { value: 2, label: "Tuesday" },
                                { value: 3, label: "Wednesday" },
                                { value: 4, label: "Thursday" },
                                { value: 5, label: "Friday" },
                                { value: 6, label: "Saturday" },
                              ]}
                              fullWidth
                            />
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
                                editIsTodo ? "bg-emerald-500" : "bg-secondary"
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
                              subCategory: editSubCategory || null,
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
                    <div className={`flex flex-col rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${theme.bg} ${theme.border}`}>
                      <div className="flex items-start justify-between">
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
                              {block.subCategory && <span className="opacity-70 font-medium"> • {block.subCategory}</span>}
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

                      {/* Sub-Schedules Breakdown Section */}
                      <TimetableSubSchedulesSection block={block} />
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
