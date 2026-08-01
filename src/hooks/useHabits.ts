import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface Habit {
  id: string
  userId: string
  name: string
  category: string
  subCategory?: string | null
  frequency: string
  orderIndex: number
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
async function createHabit(body: { name: string; category?: string; subCategory?: string | null; frequency?: string }): Promise<Habit> {
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
  return useMutation<Habit, Error, { name: string; category?: string; subCategory?: string | null; frequency?: string }>({
    mutationFn: createHabit,
    onSuccess: (newHabit) => {
      const queryCache = queryClient.getQueryCache()
      const queries = queryCache.findAll({ queryKey: ["habits"], exact: false })
      queries.forEach((q) => {
        if (q.queryKey.length === 3 && q.queryKey[1] !== "stats") {
          const oldData = q.state.data as HabitsResponse | undefined
          if (oldData) {
            queryClient.setQueryData(q.queryKey, {
              ...oldData,
              habits: [...oldData.habits.filter((h) => h.id !== newHabit.id), newHabit],
            })
          }
        }
      })
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
  return useMutation<
    { toggled: boolean; log?: HabitLog },
    Error,
    { habitId: string; date: string; status?: string },
    { previousQueriesData: { queryKey: readonly unknown[]; data: unknown }[] }
  >({
    mutationFn: toggleHabitLog,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] })
      const queryCache = queryClient.getQueryCache()
      const queries = queryCache.findAll({ queryKey: ["habits"], exact: false })

      const previousQueriesData = queries.map((q) => ({
        queryKey: q.queryKey,
        data: q.state.data,
      }))

      queries.forEach((q) => {
        if (q.queryKey.length === 3 && q.queryKey[1] !== "stats") {
          const oldData = q.state.data as HabitsResponse | undefined
          if (oldData) {
            const hasLog = oldData.logs.some(
              (l) => l.habitId === variables.habitId && l.date === variables.date
            )
            let newLogs: HabitLog[]
            if (hasLog) {
              newLogs = oldData.logs.filter(
                (l) => !(l.habitId === variables.habitId && l.date === variables.date)
              )
            } else {
              const tempLog: HabitLog = {
                id: `temp-${variables.habitId}-${variables.date}`,
                userId: "",
                habitId: variables.habitId,
                date: variables.date,
                status: variables.status || "Completed",
                notes: null,
                loggedAt: new Date().toISOString(),
              }
              newLogs = [...oldData.logs, tempLog]
            }
            queryClient.setQueryData(q.queryKey, {
              ...oldData,
              logs: newLogs,
            })
          }
        }
      })

      return { previousQueriesData }
    },
    onError: (err, variables, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((q) => {
          queryClient.setQueryData(q.queryKey, q.data)
        })
      }
    },
    onSettled: () => {
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
  return useMutation<
    { success: boolean },
    Error,
    string,
    { previousQueriesData: { queryKey: readonly unknown[]; data: unknown }[] }
  >({
    mutationFn: deleteHabit,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] })
      const queryCache = queryClient.getQueryCache()
      const queries = queryCache.findAll({ queryKey: ["habits"], exact: false })

      const previousQueriesData = queries.map((q) => ({
        queryKey: q.queryKey,
        data: q.state.data,
      }))

      queries.forEach((q) => {
        if (q.queryKey.length === 3 && q.queryKey[1] !== "stats") {
          const oldData = q.state.data as HabitsResponse | undefined
          if (oldData) {
            queryClient.setQueryData(q.queryKey, {
              ...oldData,
              habits: oldData.habits.filter((h) => h.id !== id),
              logs: oldData.logs.filter((l) => l.habitId !== id),
            })
          }
        }
      })

      return { previousQueriesData }
    },
    onError: (err, id, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((q) => {
          queryClient.setQueryData(q.queryKey, q.data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] })
    },
  })
}

// 6. Reorder habits mutation
async function reorderHabits(orderedIds: string[]): Promise<{ success: boolean }> {
  const res = await fetch("/api/habits", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderedIds }),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to reorder habits")
  }
  return res.json()
}

export function useReorderHabitsMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    { success: boolean },
    Error,
    string[],
    { previousQueriesData: { queryKey: readonly unknown[]; data: unknown }[] }
  >({
    mutationFn: reorderHabits,
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] })
      const queryCache = queryClient.getQueryCache()
      const queries = queryCache.findAll({ queryKey: ["habits"], exact: false })

      const previousQueriesData = queries.map((q) => ({
        queryKey: q.queryKey,
        data: q.state.data,
      }))

      queries.forEach((q) => {
        if (q.queryKey.length === 3 && q.queryKey[1] !== "stats") {
          const oldData = q.state.data as HabitsResponse | undefined
          if (oldData) {
            // Sort existing habits according to the new orderedIds
            const reorderedHabits = [...oldData.habits].sort((a, b) => {
              const idxA = orderedIds.indexOf(a.id)
              const idxB = orderedIds.indexOf(b.id)
              if (idxA === -1 && idxB === -1) return 0
              if (idxA === -1) return 1
              if (idxB === -1) return -1
              return idxA - idxB
            })
            queryClient.setQueryData(q.queryKey, {
              ...oldData,
              habits: reorderedHabits,
            })
          }
        }
      })

      return { previousQueriesData }
    },
    onError: (err, orderedIds, context) => {
      if (context?.previousQueriesData) {
        context.previousQueriesData.forEach((q) => {
          queryClient.setQueryData(q.queryKey, q.data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] })
    },
  })
}

// 7. Update habit mutation
async function updateHabit(body: { id: string; name: string; category?: string; subCategory?: string | null; frequency?: string }): Promise<Habit> {
  const res = await fetch("/api/habits", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to update habit")
  }
  return res.json()
}

export function useUpdateHabitMutation() {
  const queryClient = useQueryClient()
  return useMutation<Habit, Error, { id: string; name: string; category?: string; subCategory?: string | null; frequency?: string }>({
    mutationFn: updateHabit,
    onSuccess: (updatedHabit) => {
      const queryCache = queryClient.getQueryCache()
      const queries = queryCache.findAll({ queryKey: ["habits"], exact: false })
      queries.forEach((q) => {
        if (q.queryKey.length === 3 && q.queryKey[1] !== "stats") {
          const oldData = q.state.data as HabitsResponse | undefined
          if (oldData) {
            queryClient.setQueryData(q.queryKey, {
              ...oldData,
              habits: oldData.habits.map((h) => h.id === updatedHabit.id ? updatedHabit : h),
            })
          }
        }
      })
      queryClient.invalidateQueries({ queryKey: ["habits"] })
    },
  })
}
