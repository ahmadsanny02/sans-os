import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface Priority {
  id: string
  userId: string
  date: string
  text: string
  orderIndex: number
  completed: boolean
  rolloverCount: number
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
  createdAt: string
  date: string | null
}

// --- PRIORITIES ---

async function fetchPriorities(date: string): Promise<Priority[]> {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const today = `${year}-${month}-${day}`

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

async function createPriority(body: { date: string; text: string; orderIndex: number }): Promise<Priority> {
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
  return useMutation<Priority, Error, { date: string; text: string; orderIndex: number }>({
    mutationFn: createPriority,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["priorities", variables.date] })
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
  return useMutation<Priority, Error, { id: string; completed: boolean }>({
    mutationFn: togglePriority,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priorities", date] })
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

export function useDeletePriorityMutation(date: string) {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deletePriority,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priorities", date] })
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
    }
  >({
    mutationFn: createTimetableBlock,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] })
      if (variables.date) {
        queryClient.invalidateQueries({ queryKey: ["priorities", variables.date] })
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
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteTimetableBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] })
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
    },
  })
}
