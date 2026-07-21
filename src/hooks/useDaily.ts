import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useWorkspaceStore } from "@/store/workspaceStore"

export interface Priority {
  id: string
  userId: string
  date: string
  text: string
  category: string
  orderIndex: number
  completed: boolean
  rolloverCount: number
  link: string | null
  createdAt: string
}

export interface TimetableBlock {
  id: string
  userId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  title: string
  category: string
  color: string
  link: string | null
  createdAt: string
  date: string | null
  isTodo: boolean
}

// --- PRIORITIES ---

async function fetchPriorities(date: string): Promise<Priority[]> {
  const today = useWorkspaceStore.getState().realTodayDate

  const res = await fetch(`/api/priorities?date=${date}&today=${today}`)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to fetch priorities")
  }
  return res.json()
}


export function usePrioritiesQuery(date: string) {
  return useQuery<Priority[]>({
    queryKey: ["priorities", date],
    queryFn: () => fetchPriorities(date),
    enabled: !!date,
  })
}

async function fetchPrioritiesRange(startDate: string, endDate: string): Promise<Priority[]> {
  const res = await fetch(`/api/priorities?startDate=${startDate}&endDate=${endDate}`)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to fetch priorities range")
  }
  return res.json()
}

export function usePrioritiesRangeQuery(startDate: string, endDate: string) {
  return useQuery<Priority[]>({
    queryKey: ["priorities-range", startDate, endDate],
    queryFn: () => fetchPrioritiesRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })
}

async function createPriority(body: { date: string; text: string; orderIndex?: number; link?: string; category?: string }): Promise<Priority> {
  const res = await fetch("/api/priorities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to create priority")
  }
  return res.json()
}

export function useCreatePriorityMutation() {
  const queryClient = useQueryClient()
  return useMutation<Priority, Error, { date: string; text: string; orderIndex?: number; link?: string; category?: string }>({
    mutationFn: createPriority,
    onSuccess: (newPriority, variables) => {
      queryClient.setQueryData<Priority[]>(["priorities", variables.date], (old) => {
        if (!old) return [newPriority]
        return [...old.filter((p) => p.id !== newPriority.id), newPriority].sort((a, b) => a.orderIndex - b.orderIndex)
      })
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
      queryClient.invalidateQueries({ queryKey: ["priorities-range"] })
    },
  })
}

async function togglePriority(body: { id: string; completed: boolean }): Promise<Priority> {
  const res = await fetch("/api/priorities/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to toggle priority")
  }
  return res.json()
}

export function useTogglePriorityMutation(date: string) {
  const queryClient = useQueryClient()
  return useMutation<
    Priority,
    Error,
    { id: string; completed: boolean },
    { previousPriorities: Priority[] | undefined }
  >({
    mutationFn: togglePriority,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["priorities", date] })
      const previousPriorities = queryClient.getQueryData<Priority[]>(["priorities", date])
      if (previousPriorities) {
        queryClient.setQueryData<Priority[]>(
          ["priorities", date],
          previousPriorities.map((p) =>
            p.id === variables.id ? { ...p, completed: variables.completed } : p
          )
        )
      }
      return { previousPriorities }
    },
    onError: (err, variables, context) => {
      if (context?.previousPriorities) {
        queryClient.setQueryData(["priorities", date], context.previousPriorities)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
      queryClient.invalidateQueries({ queryKey: ["priorities-range"] })
    },
  })
}

async function deletePriority(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/priorities/delete?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete priority")
  }
  return res.json()
}

export function useDeletePriorityMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    { success: boolean },
    Error,
    string,
    { previousQueriesData: { queryKey: readonly unknown[]; data: unknown }[] }
  >({
    mutationFn: deletePriority,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["priorities"] })
      const queryCache = queryClient.getQueryCache()
      const queries = queryCache.findAll({ queryKey: ["priorities"], exact: false })

      const previousQueriesData = queries.map((q) => ({
        queryKey: q.queryKey,
        data: q.state.data,
      }))

      queries.forEach((q) => {
        const oldData = q.state.data as Priority[] | undefined
        if (Array.isArray(oldData)) {
          queryClient.setQueryData(q.queryKey, oldData.filter((p) => p.id !== id))
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
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
      queryClient.invalidateQueries({ queryKey: ["priorities-range"] })
      queryClient.invalidateQueries({ queryKey: ["timetable"] })
    },
  })
}

// --- TIMETABLE ---

async function fetchTimetable(): Promise<TimetableBlock[]> {
  const res = await fetch("/api/timetable")
  if (!res.ok) {
    throw new Error("Failed to fetch timetable")
  }
  return res.json()
}

export function useTimetableQuery() {
  return useQuery<TimetableBlock[]>({
    queryKey: ["timetable"],
    queryFn: fetchTimetable,
  })
}

async function createTimetableBlock(body: {
  dayOfWeek: number
  startTime: string
  endTime: string
  title: string
  category?: string
  color?: string
  date?: string
  isTodo?: boolean
  link?: string
}): Promise<TimetableBlock> {
  const res = await fetch("/api/timetable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create timetable block")
  }
  return res.json()
}

export function useCreateTimetableBlockMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    TimetableBlock,
    Error,
    {
      dayOfWeek: number
      startTime: string
      endTime: string
      title: string
      category?: string
      color?: string
      date?: string
      isTodo?: boolean
      link?: string
    }
  >({
    mutationFn: createTimetableBlock,
    onSuccess: (newBlock) => {
      queryClient.setQueryData<TimetableBlock[]>(["timetable"], (old) => {
        if (!old) return [newBlock]
        return [...old.filter((b) => b.id !== newBlock.id), newBlock]
      })
      queryClient.invalidateQueries({ queryKey: ["timetable"] })
      if (newBlock.date) {
        queryClient.invalidateQueries({ queryKey: ["priorities"] })
        queryClient.invalidateQueries({ queryKey: ["priorities-range"] })
      }
    },
  })
}

async function deleteTimetableBlock(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/timetable?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete timetable block")
  }
  return res.json()
}

export function useDeleteTimetableBlockMutation() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string, { previous: TimetableBlock[] | undefined }>({
    mutationFn: deleteTimetableBlock,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["timetable"] })
      const previous = queryClient.getQueryData<TimetableBlock[]>(["timetable"])
      if (previous) {
        queryClient.setQueryData<TimetableBlock[]>(
          ["timetable"],
          previous.filter((b) => b.id !== id)
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["timetable"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] })
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
      queryClient.invalidateQueries({ queryKey: ["priorities-range"] })
    },
  })
}

async function updatePriority(body: { id: string; text?: string; link?: string; category?: string }): Promise<Priority> {
  const res = await fetch("/api/priorities", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to update priority")
  }
  return res.json()
}

export function useUpdatePriorityMutation(date: string) {
  const queryClient = useQueryClient()
  return useMutation<Priority, Error, { id: string; text?: string; link?: string; category?: string }>({
    mutationFn: updatePriority,
    onSuccess: (updatedPriority) => {
      queryClient.setQueryData<Priority[]>(["priorities", date], (old) => {
        if (!old) return [updatedPriority]
        return old.map((p) => (p.id === updatedPriority.id ? updatedPriority : p))
      })
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
      queryClient.invalidateQueries({ queryKey: ["priorities-range"] })
    },
  })
}

async function updateTimetableBlock(body: {
  id: string
  dayOfWeek?: number
  startTime?: string
  endTime?: string
  title?: string
  category?: string
  color?: string
  date?: string | null
  isTodo?: boolean
  link?: string
}): Promise<TimetableBlock> {
  const res = await fetch("/api/timetable", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to update timetable block")
  }
  return res.json()
}

export function useUpdateTimetableBlockMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    TimetableBlock,
    Error,
    {
      id: string
      dayOfWeek?: number
      startTime?: string
      endTime?: string
      title?: string
      category?: string
      color?: string
      date?: string | null
      isTodo?: boolean
      link?: string
    }
  >({
    mutationFn: updateTimetableBlock,
    onSuccess: (updatedBlock) => {
      queryClient.setQueryData<TimetableBlock[]>(["timetable"], (old) => {
        if (!old) return [updatedBlock]
        return old.map((b) => (b.id === updatedBlock.id ? updatedBlock : b))
      })
      queryClient.invalidateQueries({ queryKey: ["timetable"] })
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
      queryClient.invalidateQueries({ queryKey: ["priorities-range"] })
    },
  })
}
