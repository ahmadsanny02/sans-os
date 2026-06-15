import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface Habit {
  id: string
  userId: string
  name: string
  category: string
  frequency: string
  createdAt: string
}

export interface HabitLog {
  id: string
  userId: string
  habitId: string
  date: string
  status: string
  notes: string | null
  loggedAt: string
}

export interface HabitsResponse {
  habits: Habit[]
  logs: HabitLog[]
}

export interface HabitStatsResponse {
  totalHabits: number
  completedCount: number
  logs: HabitLog[]
}

// 1. Fetch habits and logs for date range
async function fetchHabits(startDate: string, endDate: string): Promise<HabitsResponse> {
  const res = await fetch(`/api/habits?startDate=${startDate}&endDate=${endDate}`)
  if (!res.ok) {
    throw new Error("Failed to fetch habits")
  }
  return res.json()
}

export function useHabitsQuery(startDate: string, endDate: string) {
  return useQuery<HabitsResponse>({
    queryKey: ["habits", startDate, endDate],
    queryFn: () => fetchHabits(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })
}

// 2. Fetch stats for a specific month
async function fetchHabitStats(month: string): Promise<HabitStatsResponse> {
  const res = await fetch(`/api/habits/stats?month=${month}`)
  if (!res.ok) {
    throw new Error("Failed to fetch habit stats")
  }
  return res.json()
}

export function useHabitStatsQuery(month: string) {
  return useQuery<HabitStatsResponse>({
    queryKey: ["habits", "stats", month],
    queryFn: () => fetchHabitStats(month),
    enabled: !!month,
  })
}

// 3. Create habit mutation
async function createHabit(body: { name: string; category?: string; frequency?: string }): Promise<Habit> {
  const res = await fetch("/api/habits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create habit")
  }
  return res.json()
}

export function useCreateHabitMutation() {
  const queryClient = useQueryClient()
  return useMutation<Habit, Error, { name: string; category?: string; frequency?: string }>({
    mutationFn: createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] })
    },
  })
}

// 4. Toggle check-in log mutation
async function toggleHabitLog(body: { habitId: string; date: string; status?: string }): Promise<{ toggled: boolean; log?: HabitLog }> {
  const res = await fetch("/api/habits/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to toggle habit log")
  }
  return res.json()
}

export function useToggleLogMutation() {
  const queryClient = useQueryClient()
  return useMutation<{ toggled: boolean; log?: HabitLog }, Error, { habitId: string; date: string; status?: string }>({
    mutationFn: toggleHabitLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] })
    },
  })
}

// 5. Delete habit mutation
async function deleteHabit(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/habits?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete habit")
  }
  return res.json()
}

export function useDeleteHabitMutation() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] })
    },
  })
}
