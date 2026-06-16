"use client"

import React from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useHabitsQuery, useHabitStatsQuery } from "@/hooks/useHabits"
import { format, parseISO, startOfWeek, addDays, getDaysInMonth, startOfMonth, endOfMonth } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { Activity, Award, CalendarDays, Percent } from "lucide-react"

// Types
interface ChartDataPoint {
  dayLabel: string
  completions: number
}

export function HabitRecaps() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)
  const userConfig = useWorkspaceStore((state) => state.userConfig)

  const baseDate = parseISO(activeDate)
  const weekStart = startOfWeek(baseDate, { weekStartsOn: userConfig.startOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Calculate Active Month boundaries (to match HabitGrid query range exactly)
  const monthStart = startOfMonth(baseDate)
  const monthEnd = endOfMonth(baseDate)
  const startDateStr = format(monthStart, "yyyy-MM-dd")
  const endDateStr = format(monthEnd, "yyyy-MM-dd")

  const { data: monthlyData, isLoading: habitsLoading } = useHabitsQuery(startDateStr, endDateStr)

  // Calculate Active Month stats
  const currentMonthStr = activeDate.substring(0, 7) // "YYYY-MM"
  const { data: monthlyStats, isLoading: statsLoading } = useHabitStatsQuery(currentMonthStr)

  const isLoading = statsLoading || habitsLoading

  // Prepare weekly chart data from monthlyData logs in-memory
  const chartData: ChartDataPoint[] = weekDays.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd")
    const completions = monthlyData?.logs.filter((l) => l.date === dayStr && l.status === "completed").length || 0
    return {
      dayLabel: format(day, "EEE"),
      completions,
    }
  })

  // Calculate monthly metrics
  const daysInMonth = getDaysInMonth(baseDate)
  const totalHabits = monthlyStats?.totalHabits || 0
  const completedLogsCount = monthlyStats?.completedCount || 0
  const totalTargetOpportunity = totalHabits * daysInMonth
  const successRate = totalTargetOpportunity > 0 
    ? Math.round((completedLogsCount / totalTargetOpportunity) * 100) 
    : 0

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* 1. Monthly Statistics Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:bg-card/50 flex flex-col justify-between">
        <h4 className="text-sm font-bold tracking-wider text-muted-foreground flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-purple-500" />
          MONTHLY RECAP
        </h4>
        
        {isLoading ? (
          <div className="mt-4 space-y-4 flex-1 flex flex-col justify-center animate-pulse">
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" /> Total Habits
              </span>
              <div className="h-5 w-8 bg-muted/20 rounded-md" />
            </div>

            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" /> Total Check-ins
              </span>
              <div className="h-5 w-14 bg-muted/20 rounded-md" />
            </div>

            <div className="flex items-center justify-between pb-2.5">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Percent className="h-4 w-4 text-purple-500" /> Success Rate
              </span>
              <div className="h-6 w-12 bg-muted/20 rounded-md" />
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" /> Total Habits
              </span>
              <span className="text-lg font-bold text-foreground">{totalHabits}</span>
            </div>

            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" /> Total Check-ins
              </span>
              <span className="text-lg font-bold text-foreground">{completedLogsCount} times</span>
            </div>

            <div className="flex items-center justify-between pb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Percent className="h-4 w-4 text-purple-500" /> Success Rate
              </span>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {successRate}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Weekly Consistency Chart */}
      <div className="col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm dark:bg-card/50">
        <div className="mb-4">
          <h4 className="text-sm font-bold tracking-wider text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-500" />
            WEEKLY CONSISTENCY TREND
          </h4>
        </div>

        <div className="h-48 w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-end justify-between gap-4 px-2 pt-6">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-muted/20 animate-pulse rounded-t-lg"
                  style={{ height: `${[30, 45, 60, 40, 80, 50, 70][idx]}%` }}
                />
              ))}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                <XAxis 
                  dataKey="dayLabel" 
                  tickLine={false} 
                  className="text-[10px] fill-muted-foreground font-semibold"
                />
                <YAxis 
                  allowDecimals={false} 
                  tickLine={false} 
                  className="text-[10px] fill-muted-foreground font-semibold"
                />
                <Tooltip 
                  cursor={{ fill: "rgba(139, 92, 246, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--foreground)",
                  }}
                />
                <Bar 
                  dataKey="completions" 
                  name="Successful Check-ins" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

