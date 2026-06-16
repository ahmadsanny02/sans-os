"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useWorkspaceStore } from "@/store/workspaceStore"
import {
  usePrioritiesQuery,
  useTogglePriorityMutation,
  useTimetableQuery,
} from "@/hooks/useDaily"
import {
  useDailyTodosQuery,
  useToggleDailyTodoMutation,
  useDailyLogQuery,
} from "@/hooks/useDailyLogs"
import {
  CheckSquare,
  Calendar,
  Briefcase,
  BookOpen,
  Languages,
  Image as ImageIcon,
  ArrowRight,
  TrendingUp,
  Clock,
  ListTodo,
  Check,
  Award,
} from "lucide-react"
import { parseISO } from "date-fns"

// Types
interface DashboardWidgetProps {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// Color scheme mapping for timetable blocks
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

// Named export widget component (compact version for dashboard layout)
export function DashboardWidget({
  title,
  description,
  href,
  icon: Icon,
}: DashboardWidgetProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sidebar-primary/50 hover:shadow-md dark:bg-card/50">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-secondary p-2.5 text-foreground transition-colors group-hover:bg-sidebar-primary group-hover:text-sidebar-primary-foreground shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-sidebar-primary truncate">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {description}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-sidebar-primary shrink-0 ml-1" />
      </div>
      <Link href={href} className="absolute inset-0" aria-label={`Go to ${title}`} />
    </div>
  )
}

// Sub-components / Widgets
function PrioritiesWidget({ activeDate }: { activeDate: string }) {
  const { data: priorities = [], isLoading, isError } = usePrioritiesQuery(activeDate)
  const togglePriorityMutation = useTogglePriorityMutation(activeDate)

  const handleToggle = (id: string, completed: boolean): void => {
    togglePriorityMutation.mutate({ id, completed: !completed })
  }

  return (
    <div className="rounded-2xl border border-border bg-card/25 dark:bg-card/10 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-sidebar-primary" />
          <h3 className="text-lg font-bold text-foreground">Top 5 Priorities</h3>
        </div>
        <span className="text-xs bg-secondary/80 px-2 py-0.5 rounded-full border border-border font-semibold text-muted-foreground flex items-center justify-center min-w-[32px] h-5">
          {isLoading ? (
            <span className="inline-block w-4 h-2.5 bg-muted/30 animate-pulse rounded" />
          ) : (
            `${priorities.filter((p) => p.completed).length}/5`
          )}
        </span>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2 pt-1">
            <div className="h-12 w-full bg-muted/20 animate-pulse rounded-xl" />
            <div className="h-12 w-full bg-muted/20 animate-pulse rounded-xl" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 py-8 text-center text-xs text-destructive">
            Error loading priorities.
          </div>
        ) : priorities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
            No priorities set for today.
          </div>
        ) : (
          <div className="space-y-2">
            {priorities.map((priority) => (
              <div
                key={priority.id}
                onClick={() => handleToggle(priority.id, priority.completed)}
                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all duration-200 bg-card hover:border-sidebar-primary/30 ${
                  priority.completed ? "opacity-75 border-border/50 bg-secondary/10" : "border-border shadow-sm"
                }`}
              >
                <button
                  disabled={togglePriorityMutation.isPending}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                    priority.completed
                      ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                      : "border-border hover:border-sidebar-primary/50"
                  }`}
                  aria-label="Toggle completed"
                >
                  {priority.completed ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                </button>
                <span
                  className={`text-xs font-semibold truncate leading-tight ${
                    priority.completed ? "line-through text-muted-foreground font-normal" : "text-foreground"
                  }`}
                >
                  {priority.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TodosWidget({ activeDate }: { activeDate: string }) {
  const { data: todos = [], isLoading, isError } = useDailyTodosQuery(activeDate)
  const toggleTodoMutation = useToggleDailyTodoMutation(activeDate)

  const handleToggle = (id: string, completed: boolean): void => {
    toggleTodoMutation.mutate({ id, completed: !completed })
  }

  return (
    <div className="rounded-2xl border border-border bg-card/25 dark:bg-card/10 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-sidebar-primary" />
          <h3 className="text-lg font-bold text-foreground">Daily Checklist</h3>
        </div>
        <span className="text-xs bg-secondary/80 px-2 py-0.5 rounded-full border border-border font-semibold text-muted-foreground flex items-center justify-center min-w-[50px] h-5">
          {isLoading ? (
            <span className="inline-block w-8 h-2.5 bg-muted/30 animate-pulse rounded" />
          ) : (
            `${todos.filter((t) => t.completed).length}/${todos.length} Done`
          )}
        </span>
      </div>

      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-2 pt-1">
            <div className="h-12 w-full bg-muted/20 animate-pulse rounded-xl" />
            <div className="h-12 w-full bg-muted/20 animate-pulse rounded-xl" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 py-8 text-center text-xs text-destructive">
            Error loading checklist.
          </div>
        ) : todos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
            No checklist items set for today.
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                onClick={() => handleToggle(todo.id, todo.completed)}
                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all duration-200 bg-card hover:border-sidebar-primary/30 ${
                  todo.completed ? "opacity-75 border-border/50 bg-secondary/10" : "border-border shadow-sm"
                }`}
              >
                <button
                  disabled={toggleTodoMutation.isPending}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                    todo.completed
                      ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                      : "border-border hover:border-sidebar-primary/50"
                  }`}
                  aria-label="Toggle todo status"
                >
                  {todo.completed ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                </button>
                <span
                  className={`text-xs font-semibold truncate leading-tight ${
                    todo.completed ? "line-through text-muted-foreground font-normal" : "text-foreground"
                  }`}
                >
                  {todo.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TimetableWidget({ activeDate }: { activeDate: string }) {
  const { data: timetableList = [], isLoading, isError } = useTimetableQuery()

  // Get current date and time in user's local timezone to compare ongoing/future blocks
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const realTodayStr = `${year}-${month}-${day}`

  const currentHour = String(now.getHours()).padStart(2, "0")
  const currentMin = String(now.getMinutes()).padStart(2, "0")
  const currentTimeStr = `${currentHour}:${currentMin}`

  const isToday = activeDate === realTodayStr

  // Filter & sort: show everyday fixed OR blocks matching activeDate
  // If viewing today's date, only show ongoing or future blocks (endTime >= currentTimeStr)
  const activeDayBlocks = timetableList
    .filter((block) => {
      const isForDay = block.dayOfWeek === -1 || block.date === activeDate
      if (!isForDay) return false

      if (isToday) {
        return block.endTime >= currentTimeStr
      }
      return true
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <div className="rounded-2xl border border-border bg-card/25 dark:bg-card/10 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-sidebar-primary" />
          <h3 className="text-lg font-bold text-foreground">Today&apos;s Schedule</h3>
        </div>
        <Link href="/daily" className="text-xs text-sidebar-primary hover:underline font-semibold flex items-center gap-0.5">
          Edit Timetable <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="relative border-l border-border/70 ml-2.5 pl-6 space-y-4">
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
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 py-8 text-center text-xs text-destructive">
            Error loading schedule.
          </div>
        ) : activeDayBlocks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
            No schedule blocks set for today.
          </div>
        ) : (
          <div className="relative border-l border-border/70 ml-2.5 pl-6 space-y-4">
            {activeDayBlocks.map((block) => {
              const color = TIMETABLE_COLORS[block.color || "blue"] || TIMETABLE_COLORS.blue
              return (
                <div key={block.id} className="relative">
                  {/* Bullet Marker */}
                  <span className={`absolute -left-[30px] top-1.5 flex h-3 w-3 rounded-full border-2 border-background ${color.bullet}`} />
                  
                  <div className={`rounded-xl border p-3 bg-card shadow-sm ${color.border} ${color.bg}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${color.bg} ${color.text} border ${color.border}`}>
                          {block.category || "General"}
                        </span>
                        <h4 className="text-sm font-bold text-foreground mt-1.5 leading-snug">
                          {block.title}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap bg-secondary/50 px-2 py-1 rounded-md shrink-0">
                        {block.startTime} - {block.endTime}
                      </span>
                    </div>
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

function MemoryBoxWidget({ activeDate }: { activeDate: string }) {
  const { data: log, isLoading } = useDailyLogQuery(activeDate)
  const picUrl = log?.picUrl

  return (
    <div className="rounded-2xl border border-border bg-card/25 dark:bg-card/10 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-sidebar-primary" />
          <h3 className="text-lg font-bold text-foreground">Pic of the Day</h3>
        </div>
      </div>

      <div className="relative rounded-xl border border-border bg-card p-1.5 overflow-hidden h-48 flex items-center justify-center shadow-inner bg-secondary/5">
        {isLoading ? (
          <div className="w-full h-full bg-muted/20 animate-pulse rounded-lg" />
        ) : picUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={picUrl}
            alt="Memory of the Day"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-center p-4">
            <p className="text-xs text-muted-foreground">No memory captured today.</p>
            <Link href="/daily" className="inline-block text-[11px] font-bold text-sidebar-primary hover:underline mt-2">
              Upload picture in Daily Flow
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// Default export dashboard page
export default function DashboardPage() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)

  const currentHour = new Date().getHours()
  let greeting = "Good Morning"
  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good Afternoon"
  } else if (currentHour >= 17 && currentHour < 21) {
    greeting = "Good Evening"
  } else if (currentHour >= 21 || currentHour < 4) {
    greeting = "Good Night"
  }

  const parsedActiveDate = parseISO(activeDate)
  const activeDateStr = parsedActiveDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Dashboard - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4">
      {/* Header welcome banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/5 p-8 shadow-sm">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
            <TrendingUp className="h-3.5 w-3.5" /> Workspace Active
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            {greeting}, Ahmad Sani Jabarulloh
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            {activeDateStr} • Manage your daily priorities and monitor your personal life operating system.
          </p>
        </div>
      </div>

      {/* Module Shortcuts Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <DashboardWidget
          title="Habits"
          description="Track monthly habits"
          href="/habits"
          icon={CheckSquare}
        />
        <DashboardWidget
          title="Daily Flow"
          description="Priorities & timetable"
          href="/daily"
          icon={Calendar}
        />
        <DashboardWidget
          title="Projects"
          description="Manage tasks & boards"
          href="/projects"
          icon={Briefcase}
        />
        <DashboardWidget
          title="Reading"
          description="Digital book logs"
          href="/reading"
          icon={BookOpen}
        />
        <DashboardWidget
          title="Language"
          description="Vocab review engine"
          href="/language"
          icon={Languages}
        />
        <DashboardWidget
          title="Vision Board"
          description="Interactive goal canvas"
          href="/vision-board"
          icon={ImageIcon}
        />
      </div>

      {/* Widgets Workspace */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column (lg:col-span-5) - Priorities & Checklist */}
        <div className="lg:col-span-5 space-y-8">
          <PrioritiesWidget activeDate={activeDate} />
          <TodosWidget activeDate={activeDate} />
        </div>

        {/* Right Column (lg:col-span-7) - Timetable & Memory Box */}
        <div className="lg:col-span-7 space-y-8">
          <TimetableWidget activeDate={activeDate} />
          <MemoryBoxWidget activeDate={activeDate} />
        </div>
      </div>
    </div>
  )
}

