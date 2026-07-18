"use client"

import React, { useMemo } from "react"
import { Priority, TimetableBlock } from "@/hooks/useDaily"
import { Project } from "@/hooks/useProjects"
import { CalendarMonthGrid } from "./CalendarMonthGrid"
import {
  Calendar,
  Clock,
  Check,
  ListTodo,
  Briefcase,
  Search,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import {
  format,
  eachDayOfInterval,
  isToday,
} from "date-fns"
import { Badge } from "@/components/ui/Badge"
import { CustomSelect } from "@/components/ui/CustomSelect"

const TIMETABLE_COLORS: Record<string, { bg: string; text: string; border: string; bullet: string }> = {
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

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const YEARS_LIST = [2024, 2025, 2026, 2027, 2028, 2029, 2030]

interface CalendarViewProps {
  currentMonth: Date
  selectedDate: string
  setSelectedDate: (d: string) => void
  rangePriorities: Priority[]
  dayPriorities: Priority[]
  isLoadingPriorities: boolean
  timetableList: TimetableBlock[]
  activeTimetableBlocks: TimetableBlock[]
  isLoadingTimetable: boolean
  selectedDateFormatted: string
  handleTogglePriority: (id: string, completed: boolean) => void
  isPendingToggle: boolean
  gridLoading: boolean
  gridError: boolean
  // Master Schedule / All Agendas
  agendaMonth: number
  setAgendaMonth: (m: number) => void
  agendaYear: number
  setAgendaYear: (y: number) => void
  agendaTypeFilter: string
  setAgendaTypeFilter: (t: string) => void
  agendaSearch: string
  setAgendaSearch: (s: string) => void
  agendaMonthStart: Date
  agendaMonthEnd: Date
  agendaPriorities: Priority[]
  isLoadingAgendaPriorities: boolean
  projectsList: Project[]
  isLoadingProjects: boolean
}

export function CalendarView({
  currentMonth,
  selectedDate,
  setSelectedDate,
  rangePriorities,
  dayPriorities,
  isLoadingPriorities,
  timetableList,
  activeTimetableBlocks,
  isLoadingTimetable,
  selectedDateFormatted,
  handleTogglePriority,
  isPendingToggle,
  gridLoading,
  gridError,
  agendaMonth,
  setAgendaMonth,
  agendaYear,
  setAgendaYear,
  agendaTypeFilter,
  setAgendaTypeFilter,
  agendaSearch,
  setAgendaSearch,
  agendaMonthStart,
  agendaMonthEnd,
  agendaPriorities,
  isLoadingAgendaPriorities,
  projectsList,
  isLoadingProjects,
}: CalendarViewProps) {
  // Generate days list for the selected agenda month/year
  const monthDays = useMemo(() => {
    try {
      return eachDayOfInterval({ start: agendaMonthStart, end: agendaMonthEnd })
    } catch {
      return []
    }
  }, [agendaMonthStart, agendaMonthEnd])

  // Process and group all agenda items by date YYYY-MM-DD
  const groupedAgendas = useMemo(() => {
    const searchLower = agendaSearch.toLowerCase().trim()

    return monthDays.map((dayDate) => {
      const dayStr = format(dayDate, "yyyy-MM-dd")
      const dayOfWeek = dayDate.getDay()

      // 1. Priorities
      let dayPrios = agendaPriorities.filter((p) => p.date === dayStr)
      if (agendaTypeFilter === "timetable" || agendaTypeFilter === "project") {
        dayPrios = []
      }
      if (searchLower && dayPrios.length > 0) {
        dayPrios = dayPrios.filter((p) => p.text.toLowerCase().includes(searchLower))
      }

      // 2. Timetable Blocks
      let dayBlocks = timetableList.filter((b) => {
        return (
          b.dayOfWeek === -1 ||
          b.date === dayStr ||
          (b.dayOfWeek === dayOfWeek && !b.date)
        )
      })
      if (agendaTypeFilter === "priority" || agendaTypeFilter === "project") {
        dayBlocks = []
      }
      if (searchLower && dayBlocks.length > 0) {
        dayBlocks = dayBlocks.filter(
          (b) =>
            b.title.toLowerCase().includes(searchLower) ||
            (b.category && b.category.toLowerCase().includes(searchLower))
        )
      }

      // 3. Project Deadlines (Projects & Tasks)
      let projectItems: { id: string; name: string; type: "project" | "task"; projectName?: string; deadline: string; priority: string; status?: string; completed?: boolean }[] = []
      if (agendaTypeFilter !== "priority" && agendaTypeFilter !== "timetable") {
        projectsList.forEach((proj) => {
          if (proj.deadline) {
            try {
              const projDate = format(new Date(proj.deadline), "yyyy-MM-dd")
              if (projDate === dayStr) {
                projectItems.push({
                  id: proj.id,
                  name: proj.name,
                  type: "project",
                  deadline: proj.deadline,
                  priority: proj.priority,
                  status: proj.status,
                })
              }
            } catch {}
          }

          proj.tasks.forEach((task) => {
            if (task.deadline) {
              try {
                const taskDate = format(new Date(task.deadline), "yyyy-MM-dd")
                if (taskDate === dayStr) {
                  projectItems.push({
                    id: task.id,
                    name: task.name,
                    type: "task",
                    projectName: proj.name,
                    deadline: task.deadline,
                    priority: task.priority,
                    completed: task.completed,
                  })
                }
              } catch {}
            }
          })
        })
      }

      if (searchLower && projectItems.length > 0) {
        projectItems = projectItems.filter(
          (item) =>
            item.name.toLowerCase().includes(searchLower) ||
            (item.projectName && item.projectName.toLowerCase().includes(searchLower))
        )
      }

      const totalCount = dayPrios.length + dayBlocks.length + projectItems.length

      return {
        dayDate,
        dayStr,
        dayPriorities: dayPrios,
        timetableBlocks: dayBlocks,
        projectItems,
        totalCount,
      }
    }).filter((group) => group.totalCount > 0)
  }, [
    monthDays,
    agendaPriorities,
    timetableList,
    projectsList,
    agendaTypeFilter,
    agendaSearch,
  ])

  // Overall Agenda Statistics for selected month & year
  const totalAgendasCount = groupedAgendas.reduce((acc, curr) => acc + curr.totalCount, 0)
  const totalPrioritiesCount = groupedAgendas.reduce((acc, curr) => acc + curr.dayPriorities.length, 0)
  const totalTimetableCount = groupedAgendas.reduce((acc, curr) => acc + curr.timetableBlocks.length, 0)
  const totalProjectsCount = groupedAgendas.reduce((acc, curr) => acc + curr.projectItems.length, 0)

  const handleResetToCurrentMonth = () => {
    const now = new Date()
    setAgendaMonth(now.getMonth())
    setAgendaYear(now.getFullYear())
  }

  return (
    <div className="space-y-6">
      {/* Top Split View: Monthly Grid + Selected Day Agenda Panel */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Calendar Column */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          <CalendarMonthGrid
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            rangePriorities={rangePriorities}
            timetableList={timetableList}
            isLoading={gridLoading}
            isError={gridError}
          />
        </div>

        {/* Selected Day Agenda Detail Panel */}
        <div className="lg:col-span-4 xl:col-span-3 bento-card p-5 flex flex-col h-[fit-content] space-y-6">
          <div className="border-b border-border/40 pb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              Day Agenda
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-snug">
              {selectedDateFormatted}
            </p>
          </div>

          {/* Agenda Details Section */}
          <div className="space-y-6">
            {/* 1. Daily Priorities list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ListTodo className="h-3.5 w-3.5" />
                Priorities
              </h4>

              {isLoadingPriorities ? (
                <div className="space-y-2 pt-1 animate-pulse">
                  <div className="h-10 w-full bg-muted/25 dark:bg-card/15 rounded-lg border border-border/40" />
                  <div className="h-10 w-full bg-muted/25 dark:bg-card/15 rounded-lg border border-border/40" />
                </div>
              ) : dayPriorities.length === 0 ? (
                <p className="text-xs text-muted-foreground italic pl-1">No priorities scheduled</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {dayPriorities.map((priority) => (
                    <div
                      key={priority.id}
                      onClick={() => !isPendingToggle && handleTogglePriority(priority.id, priority.completed)}
                      className={`flex items-start gap-2.5 rounded-lg border p-2.5 transition-all text-xs bg-background/50 cursor-pointer ${
                        priority.completed ? "border-border/40 opacity-60" : "border-border/60 hover:border-primary/40"
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTogglePriority(priority.id, priority.completed)
                        }}
                        disabled={isPendingToggle}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all mt-0.5 cursor-pointer disabled:cursor-not-allowed ${
                          priority.completed
                            ? "bg-primary border-primary text-primary-foreground shadow-glow"
                            : "border-border/65 hover:border-primary hover:bg-primary/10 bg-card"
                        }`}
                        aria-label="Toggle completed"
                      >
                        {priority.completed && <Check className="h-3 w-3 stroke-[3]" />}
                      </button>
                      <span className={`leading-normal truncate ${priority.completed ? "line-through text-muted-foreground" : "text-foreground font-semibold"}`}>
                        {priority.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Timetable events list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Timeline Schedule
              </h4>

              {isLoadingTimetable ? (
                <div className="space-y-2.5 pt-1 animate-pulse">
                  <div className="h-12 w-full bg-muted/25 dark:bg-card/15 rounded-lg border border-border/40" />
                  <div className="h-12 w-full bg-muted/25 dark:bg-card/15 rounded-lg border border-border/40" />
                </div>
              ) : activeTimetableBlocks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic pl-1">No schedule blocks configured</p>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {activeTimetableBlocks.map((block) => {
                    const theme = TIMETABLE_COLORS[block.color || "blue"] || TIMETABLE_COLORS.blue
                    return (
                      <div
                        key={block.id}
                        className={`flex items-start gap-2.5 border-l-2 pl-2.5 py-1 ${theme.text}`}
                        style={{ borderLeftColor: `var(--${block.color}-500)` }}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[10px] font-bold opacity-80 flex items-center gap-1">
                            <span>{block.startTime} - {block.endTime}</span>
                          </p>
                          <h5 className="text-xs font-bold text-foreground leading-normal truncate">
                            {block.title}
                          </h5>
                          {block.category && (
                            <span className="text-[9px] font-bold opacity-75 uppercase tracking-wide">
                              {block.category}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- MASTER SCHEDULE & ALL AGENDAS SECTION (Month & Year filtering) --- */}
      <div className="bento-card p-6 space-y-6 animate-in fade-in duration-300">
        {/* Header Title & Month/Year Selectors */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary shrink-0" />
              <h3 className="text-lg font-black text-foreground tracking-tight">
                Master Schedule: All Agendas & Events
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browse, filter, and inspect scheduled agendas for any month and year
            </p>
          </div>

          {/* Month & Year Custom Selectors */}
          <div className="flex flex-wrap items-center gap-3 select-none">
            <CustomSelect
              label="Month:"
              value={agendaMonth}
              onChange={(val) => setAgendaMonth(Number(val))}
              options={MONTH_NAMES.map((mName, idx) => ({ value: idx, label: mName }))}
            />

            <CustomSelect
              label="Year:"
              value={agendaYear}
              onChange={(val) => setAgendaYear(Number(val))}
              options={YEARS_LIST.map((yVal) => ({ value: yVal, label: String(yVal) }))}
            />

            {/* Reset to Current Month */}
            <button
              onClick={handleResetToCurrentMonth}
              className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-secondary/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all shadow-sm cursor-pointer"
              title="Reset to current month"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Today
            </button>
          </div>
        </div>

        {/* Filter Controls (Search & Type Pills) */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 min-w-max">
            {[
              { id: "all", label: "All Agendas", icon: Layers },
              { id: "priority", label: "Top Priorities", icon: ListTodo },
              { id: "timetable", label: "Timetable Blocks", icon: Clock },
              { id: "project", label: "Project Deadlines", icon: Briefcase },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = agendaTypeFilter === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setAgendaTypeFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-glass shadow-glow"
                      : "bg-secondary/20 hover:bg-secondary/50 border-border/60 text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={agendaSearch}
              onChange={(e) => setAgendaSearch(e.target.value)}
              placeholder="Search agenda..."
              className="w-full rounded-xl border border-border bg-background/50 pl-9 pr-3 py-1.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
            />
          </div>
        </div>

        {/* Summary Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border/50 bg-card/40 p-3 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Events</span>
            <p className="text-xl font-extrabold text-foreground">{totalAgendasCount}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/40 p-3 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ListTodo className="h-3 w-3 text-primary" /> Priorities
            </span>
            <p className="text-xl font-extrabold text-foreground">{totalPrioritiesCount}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/40 p-3 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-500" /> Timetable
            </span>
            <p className="text-xl font-extrabold text-foreground">{totalTimetableCount}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/40 p-3 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3 text-amber-500" /> Projects
            </span>
            <p className="text-xl font-extrabold text-foreground">{totalProjectsCount}</p>
          </div>
        </div>

        {/* Grouped Days List View */}
        {isLoadingAgendaPriorities || isLoadingTimetable || isLoadingProjects ? (
          <div className="space-y-3 pt-2">
            <div className="h-20 w-full bg-muted/20 animate-pulse rounded-xl border border-border/40" />
            <div className="h-20 w-full bg-muted/20 animate-pulse rounded-xl border border-border/40" />
          </div>
        ) : groupedAgendas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 py-12 text-center space-y-2">
            <Layers className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-bold text-foreground">
              No agendas found for {MONTH_NAMES[agendaMonth]} {agendaYear}
            </p>
            <p className="text-xs text-muted-foreground">
              Try selecting another month/year or clearing your search filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {groupedAgendas.map((group) => {
              const isSelected = group.dayStr === selectedDate
              const isTodayDate = isToday(group.dayDate)

              return (
                <div
                  key={group.dayStr}
                  className={`rounded-2xl border transition-all p-4 space-y-3 ${
                    isSelected
                      ? "border-primary/40 bg-primary/5 shadow-glass"
                      : "border-border/60 bg-card/30 hover:bg-card/60"
                  }`}
                >
                  {/* Date Header Row */}
                  <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDate(group.dayStr)}
                        className="text-sm font-extrabold text-foreground hover:text-primary transition-colors flex items-center gap-1.5 group cursor-pointer"
                      >
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        <span>{format(group.dayDate, "EEEE, MMMM d, yyyy")}</span>
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </button>
                      {isTodayDate && <Badge variant="info">Today</Badge>}
                      {isSelected && <Badge variant="primary">Selected</Badge>}
                    </div>

                    <span className="text-xs font-bold text-muted-foreground bg-secondary/60 px-2.5 py-0.5 rounded-full border border-border/40">
                      {group.totalCount} {group.totalCount === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {/* Day Items List */}
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* 1. Priorities */}
                    {group.dayPriorities.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => !isPendingToggle && handleTogglePriority(p.id, p.completed)}
                        className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs transition-all cursor-pointer ${
                          p.completed
                            ? "border-border/40 bg-secondary/20 opacity-70"
                            : "border-border/60 bg-card/60 hover:border-primary/40 shadow-sm"
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTogglePriority(p.id, p.completed)
                          }}
                          disabled={isPendingToggle}
                          className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-all mt-0.5 cursor-pointer disabled:cursor-not-allowed ${
                            p.completed
                              ? "bg-primary border-primary text-primary-foreground shadow-glow"
                              : "border-border/65 hover:border-primary bg-card"
                          }`}
                        >
                          {p.completed && <Check className="h-3 w-3 stroke-[3]" />}
                        </button>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-primary block">
                            Priority
                          </span>
                          <p className={`font-semibold leading-snug break-words ${p.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {p.text}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* 2. Timetable Blocks */}
                    {group.timetableBlocks.map((b) => {
                      const color = TIMETABLE_COLORS[b.color || "blue"] || TIMETABLE_COLORS.blue
                      return (
                        <div
                          key={b.id}
                          className={`rounded-xl border p-3 text-xs space-y-1 bg-card/60 shadow-sm ${color.border}`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                              {b.category || "Timetable"}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground">
                              {b.startTime} - {b.endTime}
                            </span>
                          </div>
                          <p className="font-bold text-foreground leading-snug break-words">
                            {b.title}
                          </p>
                        </div>
                      )
                    })}

                    {/* 3. Project Deadlines */}
                    {group.projectItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-1 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> {item.type === "project" ? "Project Deadline" : "Task Deadline"}
                          </span>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {item.priority}
                          </span>
                        </div>
                        <p className="font-bold text-foreground leading-snug break-words">
                          {item.name}
                        </p>
                        {item.projectName && (
                          <p className="text-[10px] text-muted-foreground italic">
                            Project: {item.projectName}
                          </p>
                        )}
                      </div>
                    ))}
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
