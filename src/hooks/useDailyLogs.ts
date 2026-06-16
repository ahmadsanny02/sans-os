import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface DailyTodo {
  id: string
  userId: string
  date: string
  text: string
  completed: boolean
  createdAt: string
}

export interface DailyLog {
  id: string
  userId: string
  date: string
  journal: string | null
  notes: string | null
  gratitude: string | null
  picUrl: string | null
  createdAt: string
}

// Fetch Daily Todos
async function fetchDailyTodos(date: string): Promise<DailyTodo[]> {
  const res = await fetch(`/api/daily-todos?date=${date}`)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to fetch daily todos")
  }
  return res.json()
}

export function useDailyTodosQuery(date: string) {
  return useQuery<DailyTodo[]>({
    queryKey: ["daily-todos", date],
    queryFn: () => fetchDailyTodos(date),
    enabled: !!date,
  })
}

// Create Daily Todo
async function createDailyTodo(body: { date: string; text: string }): Promise<DailyTodo> {
  const res = await fetch("/api/daily-todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to create daily todo")
  }
  return res.json()
}

export function useCreateDailyTodoMutation() {
  const queryClient = useQueryClient()
  return useMutation<DailyTodo, Error, { date: string; text: string }>({
    mutationFn: createDailyTodo,
    onSuccess: (newTodo) => {
      queryClient.invalidateQueries({ queryKey: ["daily-todos", newTodo.date] })
    },
  })
}

// Toggle Daily Todo
async function toggleDailyTodo(body: { id: string; completed: boolean }): Promise<DailyTodo> {
  const res = await fetch("/api/daily-todos", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to toggle todo")
  }
  return res.json()
}

export function useToggleDailyTodoMutation(date: string) {
  const queryClient = useQueryClient()
  return useMutation<DailyTodo, Error, { id: string; completed: boolean }>({
    mutationFn: toggleDailyTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-todos", date] })
    },
  })
}

// Delete Daily Todo
async function deleteDailyTodo(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/daily-todos?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to delete todo")
  }
  return res.json()
}

export function useDeleteDailyTodoMutation(date: string) {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteDailyTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-todos", date] })
    },
  })
}

// Fetch Daily Log
async function fetchDailyLog(date: string): Promise<DailyLog | null> {
  const res = await fetch(`/api/daily-logs?date=${date}`)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to fetch daily log")
  }
  return res.json()
}

export function useDailyLogQuery(date: string) {
  return useQuery<DailyLog | null>({
    queryKey: ["daily-log", date],
    queryFn: () => fetchDailyLog(date),
    enabled: !!date,
  })
}

// Save Daily Log
async function saveDailyLog(body: {
  date: string
  journal?: string | null
  notes?: string | null
  gratitude?: string | null
  picUrl?: string | null
}): Promise<DailyLog> {
  const res = await fetch("/api/daily-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to save daily log")
  }
  return res.json()
}

export function useSaveDailyLogMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    DailyLog,
    Error,
    {
      date: string
      journal?: string | null
      notes?: string | null
      gratitude?: string | null
      picUrl?: string | null
    }
  >({
    mutationFn: saveDailyLog,
    onSuccess: (savedLog) => {
      queryClient.invalidateQueries({ queryKey: ["daily-log", savedLog.date] })
    },
  })
}
