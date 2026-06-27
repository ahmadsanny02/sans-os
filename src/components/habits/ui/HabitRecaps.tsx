"use client"

import React from "react"
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

interface ChartDataPoint {
  dayLabel: string
  completions: number
}

interface HabitRecapsProps {
  isStatsLoading: boolean
  totalHabits: number
  completedLogsCount: number
  successRate: number
  chartData: ChartDataPoint[]
}

export function HabitRecaps({
  isStatsLoading,
  totalHabits,
  completedLogsCount,
  successRate,
  chartData,
}: HabitRecapsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* 1. Monthly Statistics Card */}
      <div className="col-span-3 lg:col-span-1 glass-card glow-border rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden">
        <h4 className="text-[10px] font-extrabold tracking-widest text-muted-foreground flex items-center gap-2 uppercase">
          <CalendarDays className="h-4 w-4 text-primary" />
          Monthly Recap
        </h4>
        
        {isStatsLoading ? (
          <div className="mt-4 space-y-4 flex-1 flex flex-col justify-center animate-pulse">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Total Habits
              </span>
              <div className="h-5 w-8 bg-muted/20 rounded-md" />
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" /> Total Check-ins
              </span>
              <div className="h-5 w-14 bg-muted/20 rounded-md" />
            </div>

            <div className="flex items-center justify-between pb-2.5">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" /> Success Rate
              </span>
              <div className="h-6 w-12 bg-muted/20 rounded-md" />
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                <Activity className="h-4 w-4 text-primary/80" /> Total Habits
              </span>
              <span className="text-sm font-bold text-foreground font-display">{totalHabits}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                <Award className="h-4 w-4 text-primary/80" /> Total Check-ins
              </span>
              <span className="text-sm font-bold text-foreground font-display">{completedLogsCount} times</span>
            </div>

            <div className="flex items-center justify-between pb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                <Percent className="h-4 w-4 text-primary/80" /> Success Rate
              </span>
              <span className="text-2xl font-black text-primary font-display">
                {successRate}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Weekly Consistency Chart */}
      <div className="col-span-3 lg:col-span-2 glass-card glow-border rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="mb-4">
          <h4 className="text-[10px] font-extrabold tracking-widest text-muted-foreground flex items-center gap-2 uppercase">
            <Activity className="h-4 w-4 text-primary" />
            Weekly Consistency Trend
          </h4>
        </div>

        <div className="h-48 w-full">
          {isStatsLoading ? (
            <div className="h-full w-full flex items-end justify-between gap-4 px-2 pt-6">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-muted/10 animate-pulse rounded-t-lg"
                  style={{ height: `${[30, 45, 60, 40, 80, 50, 70][idx]}%` }}
                />
              ))}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-white/5" />
                <XAxis 
                  dataKey="dayLabel" 
                  tickLine={false} 
                  className="text-[9px] fill-muted-foreground font-semibold font-display"
                />
                <YAxis 
                  allowDecimals={false} 
                  tickLine={false} 
                  className="text-[9px] fill-muted-foreground font-semibold font-display"
                />
                <Tooltip 
                  cursor={{ fill: "rgba(255, 255, 255, 0.02)" }}
                  contentStyle={{
                    backgroundColor: "rgba(10, 10, 12, 0.9)",
                    borderColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    fontSize: "11px",
                    color: "var(--foreground)",
                    backdropFilter: "blur(12px)",
                  }}
                />
                <Bar 
                  dataKey="completions" 
                  name="Successful Check-ins" 
                  fill="url(#barGradient)" 
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
