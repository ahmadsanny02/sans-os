import React from "react"
import Link from "next/link"
import {
  CheckSquare,
  Calendar,
  Briefcase,
  BookOpen,
  Languages,
  Image as ImageIcon,
  ArrowRight,
  TrendingUp,
} from "lucide-react"

// Types
interface DashboardWidgetProps {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badgeText?: string
  badgeColor?: string
}

// Named export widget component
export function DashboardWidget({
  title,
  description,
  href,
  icon: Icon,
  badgeText,
  badgeColor = "bg-primary/10 text-primary",
}: DashboardWidgetProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sidebar-primary/50 hover:shadow-md dark:bg-card/50">
      {/* Background radial highlight */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sidebar-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-secondary p-3 text-foreground transition-colors group-hover:bg-sidebar-primary group-hover:text-sidebar-primary-foreground">
          <Icon className="h-6 w-6" />
        </div>
        {badgeText ? (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColor}`}>
            {badgeText}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-sidebar-primary">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
        <span className="text-xs text-muted-foreground group-hover:text-foreground">
          Open Module
        </span>
        <div className="flex items-center gap-1 text-sm font-semibold text-sidebar-primary">
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Direct click handler */}
      <Link href={href} className="absolute inset-0" aria-label={`Go to ${title}`} />
    </div>
  )
}

// Default export dashboard page
export default function DashboardPage() {
  const currentHour = new Date().getHours()
  let greeting = "Good Morning"
  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good Afternoon"
  } else if (currentHour >= 17 && currentHour < 21) {
    greeting = "Good Evening"
  } else if (currentHour >= 21 || currentHour < 4) {
    greeting = "Good Night"
  }

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
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
            {todayStr} • Manage your daily priorities and monitor your personal life operating system.
          </p>
        </div>
      </div>

      {/* Core Grid Matrix Layout */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardWidget
          title="Habit Tracker"
          description="Daily checklist matrix of habits with weekly and monthly consistency recaps."
          href="/habits"
          icon={CheckSquare}
          badgeText="Habit Tracker"
          badgeColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />

        <DashboardWidget
          title="Timetable & Daily"
          description="Flexible scheduling timetable and top 5 daily priorities list with automatic rollover."
          href="/daily"
          icon={Calendar}
          badgeText="Daily Flow"
          badgeColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />

        <DashboardWidget
          title="Projects & Tasks"
          description="Two-tiered hierarchical project manager sorted by deadlines and priority parameters."
          href="/projects"
          icon={Briefcase}
          badgeText="Projects Hub"
          badgeColor="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        />

        <DashboardWidget
          title="Reading Journal"
          description="Digital reading journal log featuring conditional rating/review inputs for completed books."
          href="/reading"
          icon={BookOpen}
          badgeText="Reading Logs"
          badgeColor="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        />

        <DashboardWidget
          title="Language Logs"
          description="Log English vocabulary definitions, translations, and mastery levels."
          href="/language"
          icon={Languages}
          badgeText="Vocab Engine"
          badgeColor="bg-pink-500/10 text-pink-600 dark:text-pink-400"
        />

        <DashboardWidget
          title="Vision Board"
          description="Interactive drag-and-drop workspace canvas to map out visions and goals."
          href="/vision-board"
          icon={ImageIcon}
          badgeText="Vision Canvas"
          badgeColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>
    </div>
  )
}
