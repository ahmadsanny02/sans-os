"use client"

import React from "react"
import { Habit } from "@/hooks/useHabits"
import { format } from "date-fns"
import { Plus, Trash2, Check, Loader2, Sparkles, GripVertical, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { CustomSelect } from "@/components/ui/CustomSelect"
import { getCategoryStyle } from "@/lib/categoryUtils"

const CHECKED_THEME = {
  color: "text-primary",
  bg: "bg-primary/10",
  border: "border-primary/20",
}

interface HabitGridProps {
  activeDate: string
  monthDays: Date[]
  isLoadingHabits: boolean
  isErrorHabits: boolean
  listHabits: Habit[]
  isLogged: (habitId: string, dateStr: string) => boolean
  newHabitName: string
  setNewHabitName: (name: string) => void
  newHabitCategory?: string
  setNewHabitCategory?: (c: string) => void
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  handleAddHabit: (e: React.FormEvent) => Promise<void>
  handleDeleteHabit: (id: string) => Promise<void>
  handleToggleLog: (habitId: string, date: string) => void
  isPendingToggle: boolean
  toggleLogVariables: { habitId: string; date: string; status?: string } | undefined
  isPendingCreate: boolean
  handleReorderHabits: (orderedIds: string[]) => Promise<void>
  isPendingReorder: boolean
  onSelectDate?: (dateStr: string) => void
}

export function HabitGrid({
  activeDate,
  monthDays,
  isLoadingHabits,
  isErrorHabits,
  listHabits,
  isLogged,
  newHabitName,
  setNewHabitName,
  newHabitCategory = "Health & Fitness",
  setNewHabitCategory,
  showAddForm,
  setShowAddForm,
  handleAddHabit,
  handleDeleteHabit,
  handleToggleLog,
  isPendingToggle,
  toggleLogVariables,
  isPendingCreate,
  handleReorderHabits,
  isPendingReorder,
  onSelectDate,
}: HabitGridProps) {
  const { categories } = useCategories()
  const habitCategories = categories.filter((c) => c.module === "habits" || c.module === "general")
  const defaultFallbackCategories = ["General"]

  const [draggedId, setDraggedId] = React.useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return

    const draggedIdx = listHabits.findIndex((h) => h.id === draggedId)
    const targetIdx = listHabits.findIndex((h) => h.id === targetId)
    if (draggedIdx === -1 || targetIdx === -1) return

    const newHabits = [...listHabits]
    const [draggedItem] = newHabits.splice(draggedIdx, 1)
    newHabits.splice(targetIdx, 0, draggedItem)

    handleReorderHabits(newHabits.map((h) => h.id))
    setDraggedId(null)
  }

  const handleMoveUp = (idx: number) => {
    if (idx <= 0) return
    const newHabits = [...listHabits]
    const [item] = newHabits.splice(idx, 1)
    newHabits.splice(idx - 1, 0, item)
    handleReorderHabits(newHabits.map((h) => h.id))
  }

  const handleMoveDown = (idx: number) => {
    if (idx >= listHabits.length - 1) return
    const newHabits = [...listHabits]
    const [item] = newHabits.splice(idx, 1)
    newHabits.splice(idx + 1, 0, item)
    handleReorderHabits(newHabits.map((h) => h.id))
  }
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const prevActiveDateRef = React.useRef<string | null>(null)

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: "smooth" })
    }
  }

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: "smooth" })
    }
  }

  const handleScrollToActive = () => {
    if (!scrollContainerRef.current) return
    const activeEl = scrollContainerRef.current.querySelector<HTMLElement>("[data-active-date='true']")
    if (activeEl) {
      const container = scrollContainerRef.current
      const containerWidth = container.clientWidth
      const stickyWidth = window.innerWidth < 640 ? 128 : 256
      const elLeft = activeEl.offsetLeft
      const elWidth = activeEl.clientWidth
      
      const targetLeft = Math.max(0, elLeft - stickyWidth - (containerWidth - stickyWidth) / 2 + elWidth / 2)
      container.scrollTo({
        left: targetLeft,
        behavior: "smooth",
      })
    }
  }

  // Auto scroll table to active date column ONLY when activeDate explicitly changes
  React.useEffect(() => {
    if (!scrollContainerRef.current) return
    if (prevActiveDateRef.current === activeDate) return
    prevActiveDateRef.current = activeDate

    handleScrollToActive()
  }, [activeDate])

  return (
    <div className="space-y-6">
      {/* Header and Toggle Button */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Habits List
        </h3>
        <div className="flex items-center gap-2">
          {/* Mobile Scroll Controls */}
          <div className="flex items-center gap-1 sm:hidden">
            <button
              type="button"
              onClick={handleScrollLeft}
              className="p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground active:scale-95 transition-all border border-border/40"
              title="Scroll left"
              aria-label="Scroll dates left"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleScrollToActive}
              className="px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold tracking-wide active:scale-95 transition-all border border-primary/20"
              title="Go to active date"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleScrollRight}
              className="p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground active:scale-95 transition-all border border-border/40"
              title="Scroll right"
              aria-label="Scroll dates right"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {showAddForm ? "Cancel" : "Add Habit"}
          </button>
        </div>
      </div>

      {/* Slide-out Add Habit Card */}
      {showAddForm ? (
        <form
          onSubmit={handleAddHabit}
          className="bento-card p-4 space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="habitName" className="text-xs font-bold text-muted-foreground">
                Habit Name
              </label>
              <input
                id="habitName"
                type="text"
                required
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="e.g. Workout, Read books 15 mins..."
                className="w-full rounded-lg border border-border/60 bg-background px-3.5 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="habitCategory" className="text-xs font-bold text-muted-foreground">
                Category
              </label>
              <CustomSelect
                id="habitCategory"
                value={newHabitCategory || ""}
                onChange={(val) => setNewHabitCategory && setNewHabitCategory(val)}
                options={
                  habitCategories.length > 0
                    ? habitCategories.map((c) => ({ value: c.name, label: c.name }))
                    : defaultFallbackCategories.map((catName) => ({ value: catName, label: catName }))
                }
                fullWidth
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-border/40 px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPendingCreate}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 flex items-center gap-1"
            >
              {isPendingCreate ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      ) : null}

      {/* Habits Grid Table Card */}
      <div ref={scrollContainerRef} style={{ overflowX: "auto" }} className="bento-card scroll-smooth">
        <table className="w-full border-collapse text-center text-sm min-w-[850px] sm:min-w-[1200px]">
          <thead>
            <tr className="bg-secondary/50 text-xs font-bold text-muted-foreground border-b border-border/60 uppercase tracking-wider">
              <th className="px-2 sm:px-6 py-3 sm:py-4 text-left font-bold text-muted-foreground w-32 sm:w-64 min-w-[128px] sm:min-w-[256px] select-none  bg-card/95 backdrop-blur-md z-20 border-r border-border/60 shadow-sm">
                Habit
              </th>
              {monthDays.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd")
                const isSel = dayStr === activeDate
                return (
                  <th
                    key={day.toISOString()}
                    data-active-date={isSel ? "true" : undefined}
                    onClick={() => onSelectDate?.(dayStr)}
                    className={`px-0.5 sm:px-1 py-2 sm:py-3 font-bold select-none min-w-[32px] sm:min-w-[36px] cursor-pointer hover:bg-secondary/40 transition-colors ${
                      isSel ? "text-primary bg-primary/5 font-black" : ""
                    }`}
                    title={`Select ${format(day, "MMMM d, yyyy")}`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[8px] sm:text-[9px] uppercase tracking-normal opacity-75 font-semibold">
                        {format(day, "EE").slice(0, 2)}
                      </span>
                      <span className={`text-[11px] sm:text-xs h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full ${
                        isSel ? "bg-primary text-primary-foreground font-black shadow-glow" : ""
                      }`}>
                        {format(day, "d")}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {isLoadingHabits ? (
              Array.from({ length: 3 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  <td className="p-3 text-left">
                    <div className="h-4 w-24 bg-muted/20 rounded-md" />
                  </td>
                  {monthDays.map((_, dIdx) => (
                    <td key={dIdx} className="p-1">
                      <div className="h-6 w-6 bg-muted/20 rounded mx-auto" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isErrorHabits ? (
              <tr>
                <td colSpan={monthDays.length + 1} className="py-24 text-center text-sm text-destructive bg-card/50 font-semibold">
                  Error loading habits. Please check database configuration.
                </td>
              </tr>
            ) : listHabits.length === 0 ? (
              <tr>
                <td colSpan={monthDays.length + 1} className="py-12 text-center text-sm text-muted-foreground bg-card/50">
                  No habits registered yet. Add a new habit above.
                </td>
              </tr>
            ) : (
              listHabits.map((habit, idx) => {
                const isFirst = idx === 0
                const isLast = idx === listHabits.length - 1
                return (
                  <tr
                    key={habit.id}
                    onDragOver={(e) => handleDragOver(e)}
                    onDrop={(e) => handleDrop(e, habit.id)}
                    className={`transition-colors hover:bg-secondary/15 group ${
                      draggedId === habit.id ? "opacity-30 bg-secondary/35" : ""
                    }`}
                  >
                    {/* Habit Info Cell (Sticky left) */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-left w-32 sm:w-64 min-w-[128px] sm:min-w-[256px] bg-card/95 backdrop-blur-md z-10 border-r border-border/60 select-none">
                      <div className="flex items-center justify-between gap-1 sm:gap-1.5">
                        <div className="flex items-center gap-0.5 sm:gap-1 min-w-0 flex-1">
                          {/* Drag handle */}
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, habit.id)}
                            onDragEnd={() => setDraggedId(null)}
                            className="hidden sm:block cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors p-0.5 shrink-0"
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>

                          {/* Up/Down controls */}
                          <div className="flex flex-col shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(idx)}
                              disabled={isFirst || isPendingReorder}
                              className="text-muted-foreground/40 hover:text-foreground hover:bg-secondary rounded p-0.5 disabled:opacity-20 disabled:pointer-events-none transition-all"
                              title="Move up"
                              aria-label="Move habit up"
                            >
                              <ChevronUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(idx)}
                              disabled={isLast || isPendingReorder}
                              className="text-muted-foreground/40 hover:text-foreground hover:bg-secondary rounded p-0.5 disabled:opacity-20 disabled:pointer-events-none transition-all"
                              title="Move down"
                              aria-label="Move habit down"
                            >
                              <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </button>
                          </div>

                          <div className="flex flex-col min-w-0 flex-1 ml-0.5 sm:ml-1">
                            <p className="text-xs sm:text-sm font-semibold text-foreground leading-tight truncate" title={habit.name}>
                              {habit.name}
                            </p>
                            {habit.category && (
                              <span className={`inline-flex items-center text-[8px] sm:text-[9px] font-bold opacity-90 uppercase tracking-wider mt-0.5 truncate max-w-full ${getCategoryStyle(habit.category, categories).text}`}>
                                {habit.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                          aria-label={`Delete ${habit.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </td>

                    {/* Checkbox columns */}
                    {monthDays.map((day) => {
                      const dayStr = format(day, "yyyy-MM-dd")
                      const checked = isLogged(habit.id, dayStr)
                      const isPending = isPendingToggle && 
                        toggleLogVariables?.habitId === habit.id && 
                        toggleLogVariables?.date === dayStr
                      const isSelColumn = dayStr === activeDate

                      return (
                        <td
                          key={dayStr}
                          className={`px-0.5 sm:px-1 py-2 sm:py-3 text-center ${
                            isSelColumn ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleToggleLog(habit.id, dayStr)}
                              disabled={isPending}
                              className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg border text-transparent transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
                                checked
                                  ? `${CHECKED_THEME.bg} ${CHECKED_THEME.color} ${CHECKED_THEME.border} border-2 !text-current`
                                  : "border-border/60 hover:border-primary/50 dark:hover:bg-slate-800"
                              }`}
                              aria-label={`Mark ${habit.name} check-in`}
                            >
                              {isPending ? (
                                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-primary" />
                              ) : checked ? (
                                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />
                              ) : null}
                            </button>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
