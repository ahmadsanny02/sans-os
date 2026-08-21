import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useWorkspaceStore } from "@/store/workspaceStore"

export interface DailyTodo {
  id: string
  userId: string
  date: string
  text: string
  completed: boolean
  category: string
  subCategory: string | null
  link: string | null
  rolloverCount: number
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
  const today = useWorkspaceStore.getState().realTodayDate
  const res = await fetch(`/api/daily-todos?date=${date}&today=${today}`)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to fetch daily todos")
  }
  return res.json()
}

export function useDailyTodosQuery(date: string) {
  const realTodayDate = useWorkspaceStore((state) => state.realTodayDate)
  return useQuery<DailyTodo[]>({
    queryKey: ["daily-todos", date, realTodayDate],
    queryFn: () => fetchDailyTodos(date),
    enabled: !!date,
  })
}

// Create Daily Todo
async function createDailyTodo(body: { date: string; text: string; link?: string; category?: string; subCategory?: string | null }): Promise<DailyTodo> {
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
  return useMutation<DailyTodo, Error, { date: string; text: string; link?: string; category?: string; subCategory?: string | null }>({
    mutationFn: createDailyTodo,
    onSuccess: (newTodo, variables) => {
      const queryCache = queryClient.getQueryCache()
      const queries = queryCache.findAll({ queryKey: ["daily-todos", variables.date], exact: false })
      queries.forEach((q) => {
        const old = q.state.data as DailyTodo[] | undefined
        if (Array.isArray(old)) {
          queryClient.setQueryData(
            q.queryKey,
            [...old.filter((t) => t.id !== newTodo.id), newTodo]
          )
        }
      })
      queryClient.invalidateQueries({ queryKey: ["daily-todos"] })
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
  return useMutation<
    DailyTodo,
    Error,
    { id: string; completed: boolean },
    { previousQueriesData: { queryKey: readonly unknown[]; data: unknown }[] }
  >({
    mutationFn: toggleDailyTodo,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["daily-todos", date] })
      const queryCache = queryClient.getQueryCache()
      const queries = queryCache.findAll({ queryKey: ["daily-todos", date], exact: false })

      const previousQueriesData = queries.map((q) => ({
        queryKey: q.queryKey,
        data: q.state.data,
      }))

      queries.forEach((q) => {
        const oldData = q.state.data as DailyTodo[] | undefined
        if (Array.isArray(oldData)) {
          queryClient.setQueryData(
            q.queryKey,
            oldData.map((t) =>
              t.id === variables.id ? { ...t, completed: variables.completed } : t
            )
          )
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
      queryClient.invalidateQueries({ queryKey: ["daily-todos"] })
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
  return useMutation<
    { success: boolean },
    Error,
    string,
    { previousQueriesData: { queryKey: readonly unknown[]; data: unknown }[] }
  >({
    mutationFn: deleteDailyTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["daily-todos", date] })
      const queryCache = queryClient.getQueryCache()
      const queries = queryCache.findAll({ queryKey: ["daily-todos", date], exact: false })

      const previousQueriesData = queries.map((q) => ({
        queryKey: q.queryKey,
        data: q.state.data,
      }))

      queries.forEach((q) => {
        const oldData = q.state.data as DailyTodo[] | undefined
        if (Array.isArray(oldData)) {
          queryClient.setQueryData(
            q.queryKey,
            oldData.filter((t) => t.id !== id)
          )
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
      queryClient.invalidateQueries({ queryKey: ["daily-todos"] })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-log"] })
    },
  })
}

async function updateDailyTodo(body: {
  id: string
  text?: string
  link?: string
  completed?: boolean
  category?: string
  subCategory?: string | null
}): Promise<DailyTodo> {
  const res = await fetch("/api/daily-todos", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || "Failed to update daily todo")
  }
  return res.json()
}

export function useUpdateDailyTodoMutation(date: string) {
  const queryClient = useQueryClient()
  return useMutation<
    DailyTodo,
    Error,
    {
      id: string
      text?: string
      link?: string
      completed?: boolean
      category?: string
      subCategory?: string | null
    }
  >({
    mutationFn: updateDailyTodo,
    onSuccess: (updatedTodo) => {
      const queryCache = queryClient.getQueryCache()
      const queries = queryCache.findAll({ queryKey: ["daily-todos", date], exact: false })
      queries.forEach((q) => {
        const old = q.state.data as DailyTodo[] | undefined
        if (Array.isArray(old)) {
          queryClient.setQueryData(
            q.queryKey,
            old.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
          )
        }
      })
      queryClient.invalidateQueries({ queryKey: ["daily-todos"] })
    },
  })
}
