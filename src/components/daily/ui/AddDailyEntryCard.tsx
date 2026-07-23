"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Calendar, Clock, Loader2, Link2, AlertCircle } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { CustomSelect } from "@/components/ui/CustomSelect"
import { getCategoryStyle, isCategoryInModule } from "@/lib/categoryUtils"

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
  timetableSubCategory: string
  setTimetableSubCategory: (c: string) => void
  priorityCategory: string
  setPriorityCategory: (c: string) => void
  prioritySubCategory: string
  setPrioritySubCategory: (c: string) => void
  timetableScheduleType: "custom" | "weekly" | "fixed"
  setTimetableScheduleType: (t: "custom" | "weekly" | "fixed") => void
  chooseDate: string
  setChooseDate: (d: string) => void
  timetableDayOfWeek: number
  setTimetableDayOfWeek: (w: number) => void
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
  timetableSubCategory,
  setTimetableSubCategory,
  priorityCategory,
  setPriorityCategory,
  prioritySubCategory,
  setPrioritySubCategory,
  timetableScheduleType,
  setTimetableScheduleType,
  chooseDate,
  setChooseDate,
  timetableDayOfWeek,
  setTimetableDayOfWeek,
  onClose,
}: AddDailyEntryCardProps) {
  const { categories, subCategories } = useCategories()
  const timetableCategories = categories.filter((c) => isCategoryInModule(c.module, "timetable"))
  const defaultFallbackCategories = ["General"]

  const activePriorityCatId = categories.find((c) => c.name.toLowerCase() === priorityCategory.toLowerCase())?.id
  const availablePrioritySubs = activePriorityCatId ? subCategories.filter((sc) => sc.categoryId === activePriorityCatId) : []

  const activeTimetableCatId = categories.find((c) => c.name.toLowerCase() === timetableCategory.toLowerCase())?.id
  const availableTimetableSubs = activeTimetableCatId ? subCategories.filter((sc) => sc.categoryId === activeTimetableCatId) : []

  // Optional multi-item batch creation state
  const [extraDailyRows, setExtraDailyRows] = React.useState<Array<{ id: string; title: string; link: string }>>([])


  const handleDailyBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entryTitle.trim()) return

    await handleAddDailyEntry(e)

    if (extraDailyRows.length > 0) {
      for (const row of extraDailyRows) {
        if (row.title.trim()) {
          setEntryTitle(row.title.trim())
          setEntryLink(row.link.trim())
          const fakeEvent = { preventDefault: () => {} } as React.FormEvent
          await handleAddDailyEntry(fakeEvent)
        }
      }
      setExtraDailyRows([])
    }
  }

  return (
    <div className="border border-border bg-card/45 dark:bg-card/20 rounded-2xl p-6 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
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

      <form onSubmit={handleDailyBatchSubmit} className="space-y-5">
        {/* Title and Link Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="entryTitle" className="text-xs font-bold text-muted-foreground">
              What are you planning to do? *
            </label>
            <input
              id="entryTitle"
              type="text"
              required
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
              placeholder="e.g. Code Review, Gym Session, Morning Standup..."
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
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
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Extra Daily Flow Item Rows (Optional Multi-Item Batch Creation) */}
        {extraDailyRows.map((row, idx) => (
          <div key={row.id} className="grid gap-4 md:grid-cols-2 pt-3 border-t border-dashed border-border/40 relative">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">
                Task Title #{idx + 2} *
              </label>
              <input
                type="text"
                required
                value={row.title}
                onChange={(e) => {
                  const updated = [...extraDailyRows]
                  updated[idx].title = e.target.value
                  setExtraDailyRows(updated)
                }}
                placeholder="Flow title..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                Reference Link #{idx + 2} (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={row.link}
                  onChange={(e) => {
                    const updated = [...extraDailyRows]
                    updated[idx].link = e.target.value
                    setExtraDailyRows(updated)
                  }}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setExtraDailyRows(extraDailyRows.filter((r) => r.id !== row.id))}
                  className="p-2.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-all shrink-0 cursor-pointer"
                  title="Remove item"
                >
                  <Plus className="h-4 w-4 rotate-45" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* + Add Another Flow Item Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setExtraDailyRows([...extraDailyRows, { id: Math.random().toString(), title: "", link: "" }])}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors py-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Add Another Flow Item</span>
          </button>
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
                  ? "bg-primary/10 border-primary/30 text-primary"
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
                  ? "bg-primary/10 border-primary/30 text-primary"
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
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-background border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30"
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Top 5 Priorities</span>
            </button>
          </div>
        </div>

        {/* Unified Date & Priority Selection */}
        <AnimatePresence initial={false}>
          {(targetTodo || targetPriority || (targetTimetable && timetableScheduleType === "custom")) && (
            <motion.div
              className="relative z-30 pb-24"
              initial={{ height: 0, opacity: 0, overflow: "hidden" }}
              animate={{ height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }}
              exit={{ height: 0, opacity: 0, overflow: "hidden" }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label htmlFor="chooseDate" className="text-xs font-bold text-muted-foreground">
                    Choose Date
                  </label>
                  <input
                    id="chooseDate"
                    type="date"
                    required
                    value={chooseDate}
                    onChange={(e) => setChooseDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                {targetPriority && (
                  <>
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label htmlFor="priorityCategory" className="text-xs font-bold text-muted-foreground">
                        Priority Category
                      </label>
                      <CustomSelect
                        id="priorityCategory"
                        value={priorityCategory}
                        onChange={(val) => {
                          setPriorityCategory(val)
                          setPrioritySubCategory("")
                        }}
                        options={
                          timetableCategories.length > 0
                            ? timetableCategories.map((c) => ({ value: c.name, label: c.name }))
                            : defaultFallbackCategories.map((catName) => ({ value: catName, label: catName }))
                        }
                        fullWidth
                      />
                    </div>

                    {availablePrioritySubs.length > 0 && (
                      <div className="space-y-1.5 animate-in fade-in duration-200">
                        <label htmlFor="prioritySubCategory" className="text-xs font-bold text-muted-foreground">
                          Priority Sub-category
                        </label>
                        <CustomSelect
                          id="prioritySubCategory"
                          value={prioritySubCategory}
                          onChange={(val) => setPrioritySubCategory(val)}
                          options={[
                            { value: "", label: "None (No sub-category)" },
                            ...availablePrioritySubs.map((sc) => ({ value: sc.name, label: sc.name }))
                          ]}
                          fullWidth
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conditional Timetable Form Fields */}
        <AnimatePresence initial={false}>
          {targetTimetable && (
            <motion.div
              className="relative z-10"
              initial={{ height: 0, opacity: 0, overflow: "hidden" }}
              animate={{ height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }}
              exit={{ height: 0, opacity: 0, overflow: "hidden" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
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
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  {/* Category */}
                  {/* Category & Sub-category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="category" className="text-xs font-bold text-muted-foreground">
                        Category
                      </label>
                      <CustomSelect
                        id="category"
                        value={timetableCategory}
                        onChange={(val) => {
                          setTimetableCategory(val)
                          setTimetableSubCategory("")
                        }}
                        options={
                          timetableCategories.length > 0
                            ? timetableCategories.map((c) => ({ value: c.name, label: c.name }))
                            : defaultFallbackCategories.map((catName) => ({ value: catName, label: catName }))
                        }
                        fullWidth
                      />
                    </div>

                    {availableTimetableSubs.length > 0 && (
                      <div className="space-y-1.5 animate-in fade-in duration-200">
                        <label htmlFor="timetableSubCategory" className="text-xs font-bold text-muted-foreground">
                          Sub-category
                        </label>
                        <CustomSelect
                          id="timetableSubCategory"
                          value={timetableSubCategory}
                          onChange={(val) => setTimetableSubCategory(val)}
                          options={[
                            { value: "", label: "None (No sub-category)" },
                            ...availableTimetableSubs.map((sc) => ({ value: sc.name, label: sc.name }))
                          ]}
                          fullWidth
                        />
                      </div>
                    )}
                  </div>

                  {/* Schedule Type */}
                  <div className="space-y-1.5">
                    <label htmlFor="scheduleType" className="text-xs font-bold text-muted-foreground">
                      Schedule Type
                    </label>
                    <CustomSelect
                      id="scheduleType"
                      value={timetableScheduleType}
                      onChange={(val) => setTimetableScheduleType(val as "custom" | "weekly" | "fixed")}
                      options={[
                        { value: "custom", label: "Specific Date (One-off)" },
                        { value: "weekly", label: "Specific Day of Week (Weekly)" },
                        { value: "fixed", label: "Every Day (Fixed)" },
                      ]}
                      fullWidth
                    />
                  </div>



                  {/* Weekly Day Selection */}
                  {timetableScheduleType === "weekly" && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <label htmlFor="timetableDayOfWeek" className="text-xs font-bold text-muted-foreground">
                        Choose Day
                      </label>
                      <CustomSelect
                        id="timetableDayOfWeek"
                        value={timetableDayOfWeek}
                        onChange={(val) => setTimetableDayOfWeek(Number(val))}
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
                          timetableIsTodo ? "bg-emerald-500" : "bg-secondary"
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
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/35 px-5 py-2.5 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:bg-secondary/60 hover:text-foreground hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPendingCombined || !entryTitle.trim() || (!targetTimetable && !targetTodo && !targetPriority)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            {isPendingCombined ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin animate-duration-1000" />
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
