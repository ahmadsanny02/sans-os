"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Calendar, Clock, Loader2, Link2, AlertCircle } from "lucide-react"

interface AddDailyEntryCardProps {
  entryTitle: string
  setEntryTitle: (t: string) => void
  entryLink: string
  setEntryLink: (t: string) => void
  targetTimetable: boolean
  setTargetTimetable: (t: boolean) => void
  targetTodo: boolean
  setTargetTodo: (t: boolean) => void
  targetPriority: boolean
  setTargetPriority: (t: boolean) => void
  combinedErrorMsg: string | null
  isPendingCombined: boolean
  handleAddDailyEntry: (e: React.FormEvent) => Promise<void>

  // Timetable sub-form states
  timetableStartTime: string
  setTimetableStartTime: (t: string) => void
  timetableEndTime: string
  setTimetableEndTime: (t: string) => void
  timetableDuration: string
  setTimetableDuration: (t: string) => void
  timetableIsTodo: boolean
  setTimetableIsTodo: (t: boolean) => void
  timetableCategory: string
  setTimetableCategory: (c: string) => void
  timetableScheduleType: "custom" | "weekly" | "fixed"
  setTimetableScheduleType: (t: "custom" | "weekly" | "fixed") => void
  timetableDate: string
  setTimetableDate: (d: string) => void
  timetableDayOfWeek: number
  setTimetableDayOfWeek: (w: number) => void

  // Daily Checklist & Priorities date fields
  todoDate: string
  setTodoDate: (d: string) => void
  priorityDate: string
  setPriorityDate: (d: string) => void
  onClose?: () => void
}

export function AddDailyEntryCard({
  entryTitle,
  setEntryTitle,
  entryLink,
  setEntryLink,
  targetTimetable,
  setTargetTimetable,
  targetTodo,
  setTargetTodo,
  targetPriority,
  setTargetPriority,
  combinedErrorMsg,
  isPendingCombined,
  handleAddDailyEntry,

  // Timetable fields
  timetableStartTime,
  setTimetableStartTime,
  timetableEndTime,
  setTimetableEndTime,
  timetableDuration,
  setTimetableDuration,
  timetableIsTodo,
  setTimetableIsTodo,
  timetableCategory,
  setTimetableCategory,
  timetableScheduleType,
  setTimetableScheduleType,
  timetableDate,
  setTimetableDate,
  timetableDayOfWeek,
  setTimetableDayOfWeek,

  // Daily Checklist & Priorities date fields
  todoDate,
  setTodoDate,
  priorityDate,
  setPriorityDate,
  onClose,
}: AddDailyEntryCardProps) {
  return (
    <div className="border border-border bg-card/45 dark:bg-card/20 rounded-2xl p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Add Flow Item
          </h3>
          <p className="text-xs text-muted-foreground">
            Quickly plan schedules, checklist items, or top priorities for today
          </p>
        </div>
      </div>

      <form onSubmit={handleAddDailyEntry} className="space-y-5">
        {/* Title and Link Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="entryTitle" className="text-xs font-bold text-muted-foreground">
              What are you planning to do?
            </label>
            <input
              id="entryTitle"
              type="text"
              required
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
              placeholder="e.g. Code Review, Gym Session, Morning Standup..."
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="entryLink" className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <Link2 className="h-3 w-3 text-muted-foreground" />
              Reference Link (Optional)
            </label>
            <input
              id="entryLink"
              type="url"
              value={entryLink}
              onChange={(e) => setEntryLink(e.target.value)}
              placeholder="e.g. https://github.com/pulls, https://zoom.us/j/..."
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>
        </div>

        {/* Destination Toggles */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground block">
            Add this entry to:
          </label>
          <div className="flex flex-wrap gap-3">
            {/* Timetable Checkbox Button */}
            <button
              type="button"
              onClick={() => setTargetTimetable(!targetTimetable)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer select-none ${
                targetTimetable
                  ? "bg-violet-500/10 border-violet-500/50 text-violet-600 dark:text-violet-400"
                  : "bg-background border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Timetable Schedule</span>
            </button>

            {/* Checklist Checkbox Button */}
            <button
              type="button"
              onClick={() => setTargetTodo(!targetTodo)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer select-none ${
                targetTodo
                  ? "bg-violet-500/10 border-violet-500/50 text-violet-600 dark:text-violet-400"
                  : "bg-background border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Daily Checklist (Task)</span>
            </button>

            {/* Priority Checkbox Button */}
            <button
              type="button"
              onClick={() => setTargetPriority(!targetPriority)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer select-none ${
                targetPriority
                  ? "bg-violet-500/10 border-violet-500/50 text-violet-600 dark:text-violet-400"
                  : "bg-background border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30"
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Top 5 Priorities</span>
            </button>
          </div>
        </div>

        {/* Conditional Timetable Form Fields */}
        <AnimatePresence initial={false}>
          {targetTimetable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-dashed border-border pt-4 mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {/* Start Time */}
                  <div className="space-y-1.5">
                    <label htmlFor="startTime" className="text-xs font-bold text-muted-foreground">
                      Start Time
                    </label>
                    <input
                      id="startTime"
                      type="time"
                      required={targetTimetable}
                      value={timetableStartTime}
                      onChange={(e) => setTimetableStartTime(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <label htmlFor="duration" className="text-xs font-bold text-muted-foreground">
                      Duration (minutes)
                    </label>
                    <input
                      id="duration"
                      type="number"
                      min="1"
                      required={targetTimetable}
                      value={timetableDuration}
                      onChange={(e) => setTimetableDuration(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                    />
                  </div>

                  {/* End Time */}
                  <div className="space-y-1.5">
                    <label htmlFor="endTime" className="text-xs font-bold text-muted-foreground">
                      End Time
                    </label>
                    <input
                      id="endTime"
                      type="time"
                      required={targetTimetable}
                      value={timetableEndTime}
                      onChange={(e) => setTimetableEndTime(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label htmlFor="category" className="text-xs font-bold text-muted-foreground">
                      Category
                    </label>
                    <select
                      id="category"
                      value={timetableCategory}
                      onChange={(e) => setTimetableCategory(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
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

                  {/* Schedule Type */}
                  <div className="space-y-1.5">
                    <label htmlFor="scheduleType" className="text-xs font-bold text-muted-foreground">
                      Schedule Type
                    </label>
                    <select
                      id="scheduleType"
                      value={timetableScheduleType}
                      onChange={(e) => setTimetableScheduleType(e.target.value as "custom" | "weekly" | "fixed")}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                    >
                      <option value="custom">Specific Date (One-off)</option>
                      <option value="weekly">Specific Day of Week (Weekly)</option>
                      <option value="fixed">Every Day (Fixed)</option>
                    </select>
                  </div>

                  {/* Custom Date Selection */}
                  {timetableScheduleType === "custom" && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label htmlFor="timetableDate" className="text-xs font-bold text-muted-foreground">
                        Choose Date
                      </label>
                      <input
                        id="timetableDate"
                        type="date"
                        required={targetTimetable && timetableScheduleType === "custom"}
                        value={timetableDate}
                        onChange={(e) => setTimetableDate(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                      />
                    </div>
                  )}

                  {/* Weekly Day Selection */}
                  {timetableScheduleType === "weekly" && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label htmlFor="timetableDayOfWeek" className="text-xs font-bold text-muted-foreground">
                        Choose Day
                      </label>
                      <select
                        id="timetableDayOfWeek"
                        value={timetableDayOfWeek}
                        onChange={(e) => setTimetableDayOfWeek(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
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
                  <div className="flex items-end pb-0.5 sm:col-span-2 md:col-span-1">
                    <button
                      type="button"
                      onClick={() => setTimetableIsTodo(!timetableIsTodo)}
                      className={`flex items-center justify-between w-full rounded-xl border px-3 py-2 transition-all duration-200 text-left h-[38px] cursor-pointer select-none ${
                        timetableIsTodo
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                          : "border-border bg-card/25 hover:border-border/80 hover:bg-card/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex flex-col justify-center min-w-0">
                        <span className={`text-[11px] font-bold leading-tight ${timetableIsTodo ? "text-emerald-500 dark:text-emerald-400" : "text-foreground"}`}>
                          To-Do / Focus Task
                        </span>
                        <span className="text-[9px] opacity-70 leading-tight truncate">
                          Integrate in Pomodoro
                        </span>
                      </div>
                      <div
                        className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out px-0.5 ${
                          timetableIsTodo ? "bg-emerald-500" : "bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                            timetableIsTodo ? "translate-x-3" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conditional Checklist Form Fields */}
        <AnimatePresence initial={false}>
          {targetTodo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-dashed border-border pt-4 mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <label htmlFor="todoDate" className="text-xs font-bold text-muted-foreground">
                      Choose Date (Daily Checklist)
                    </label>
                    <input
                      id="todoDate"
                      type="date"
                      required={targetTodo}
                      value={todoDate}
                      onChange={(e) => setTodoDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conditional Priority Form Fields */}
        <AnimatePresence initial={false}>
          {targetPriority && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-dashed border-border pt-4 mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <label htmlFor="priorityDate" className="text-xs font-bold text-muted-foreground">
                      Choose Date (Top 5 Priorities)
                    </label>
                    <input
                      id="priorityDate"
                      type="date"
                      required={targetPriority}
                      value={priorityDate}
                      onChange={(e) => setPriorityDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Messages */}
        {combinedErrorMsg && (
          <p className="text-xs text-destructive flex items-center gap-1 font-semibold">
            <AlertCircle className="h-3.5 w-3.5" />
            {combinedErrorMsg}
          </p>
        )}

        {/* Submit and Cancel Buttons */}
        <div className="flex justify-end items-center gap-3 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all hover:bg-muted/30 cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPendingCombined || !entryTitle.trim() || (!targetTimetable && !targetTodo && !targetPriority)}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-[1.01]"
          >
            {isPendingCombined ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving item...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Add to Flow</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
