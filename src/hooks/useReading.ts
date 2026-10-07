import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query"

export interface ReadingItem {
  id: string
  userId: string
  title: string
  author: string
  status: string // "To Read", "Reading", "Completed"
  rating: number | null
  review: string | null
  currentProgress: string | null
  finishedAt: string | null
  createdAt: string
  category?: string | null
  notes?: string | null
}

export interface CreateReadingInput {
  title: string
  author: string
  status: string
  rating?: number | null
  review?: string | null
  finishedAt?: string | null
  currentProgress?: string | null
  category?: string | null
  notes?: string | null
}

export interface UpdateReadingInput {
  id: string
  title?: string
  author?: string
  status?: string
  rating?: number | null
  review?: string | null
  finishedAt?: string | null
  currentProgress?: string | null
  category?: string | null
  notes?: string | null
}

// 1. Fetch reading items list
async function fetchReadingItems(): Promise<ReadingItem[]> {
  const res = await fetch("/api/reading")
  if (!res.ok) {
    throw new Error("Failed to fetch reading items")
  }
  return res.json()
}

export function useReadingQuery(): UseQueryResult<ReadingItem[], Error> {
  return useQuery<ReadingItem[]>({
    queryKey: ["reading"],
    queryFn: fetchReadingItems,
  })
}

// 2. Create reading item
async function createReadingItem(body: CreateReadingInput): Promise<ReadingItem> {
  const res = await fetch("/api/reading", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create book log")
  }
  return res.json()
}

export function useCreateReadingMutation(): UseMutationResult<ReadingItem, Error, CreateReadingInput> {
  const queryClient = useQueryClient()
  return useMutation<ReadingItem, Error, CreateReadingInput>({
    mutationFn: createReadingItem,
    onSuccess: (newItem) => {
      queryClient.setQueryData<ReadingItem[]>(["reading"], (old) => {
        if (!old) return [newItem]
        return [...old.filter((b) => b.id !== newItem.id), newItem]
      })
      queryClient.invalidateQueries({ queryKey: ["reading"] })
    },
  })
}

// 3. Update reading item
async function updateReadingItem(body: UpdateReadingInput): Promise<ReadingItem> {
  const res = await fetch("/api/reading", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to update book log")
  }
  return res.json()
}

export function useUpdateReadingMutation(): UseMutationResult<
  ReadingItem,
  Error,
  UpdateReadingInput,
  { previous: ReadingItem[] | undefined }
> {
  const queryClient = useQueryClient()
  return useMutation<
    ReadingItem,
    Error,
    UpdateReadingInput,
    { previous: ReadingItem[] | undefined }
  >({
    mutationFn: updateReadingItem,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["reading"] })
      const previous = queryClient.getQueryData<ReadingItem[]>(["reading"])
      if (previous) {
        queryClient.setQueryData<ReadingItem[]>(
          ["reading"],
          previous.map((item) =>
            item.id === variables.id ? { ...item, ...variables } : item
          )
        )
      }
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["reading"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reading"] })
    },
  })
}

// 4. Delete reading item
async function deleteReadingItem(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/reading?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete book log")
  }
  return res.json()
}

export function useDeleteReadingMutation(): UseMutationResult<
  { success: boolean },
  Error,
  string,
  { previous: ReadingItem[] | undefined }
> {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string, { previous: ReadingItem[] | undefined }>({
    mutationFn: deleteReadingItem,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["reading"] })
      const previous = queryClient.getQueryData<ReadingItem[]>(["reading"])
      if (previous) {
        queryClient.setQueryData<ReadingItem[]>(
          ["reading"],
          previous.filter((item) => item.id !== id)
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["reading"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reading"] })
    },
  })
}

// 5. Progress History Types & Hooks
export interface ReadingProgressLog {
  id: string
  userId: string
  bookId: string
  progress: string
  notes: string | null
  createdAt: string
}

export interface AddReadingProgressInput {
  bookId: string
  progress: string
  notes?: string | null
}

async function fetchReadingProgressLogs(bookId: string): Promise<ReadingProgressLog[]> {
  const res = await fetch(`/api/reading/progress?bookId=${bookId}`)
  if (!res.ok) {
    throw new Error("Failed to fetch reading progress logs")
  }
  return res.json()
}

export function useReadingProgressLogsQuery(bookId: string | null): UseQueryResult<ReadingProgressLog[], Error> {
  return useQuery<ReadingProgressLog[]>({
    queryKey: ["readingProgress", bookId],
    queryFn: () => fetchReadingProgressLogs(bookId!),
    enabled: !!bookId,
  })
}

async function addReadingProgressLog(body: AddReadingProgressInput): Promise<ReadingProgressLog> {
  const res = await fetch("/api/reading/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to log progress")
  }
  return res.json()
}

export function useAddReadingProgressMutation(): UseMutationResult<
  ReadingProgressLog,
  Error,
  AddReadingProgressInput
> {
  const queryClient = useQueryClient()
  return useMutation<ReadingProgressLog, Error, AddReadingProgressInput>({
    mutationFn: addReadingProgressLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["readingProgress", data.bookId] })
      queryClient.invalidateQueries({ queryKey: ["reading"] })
    },
  })
}

async function deleteReadingProgressLog(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/reading/progress?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete progress log")
  }
  return res.json()
}

export function useDeleteReadingProgressMutation(bookId: string | null): UseMutationResult<
  { success: boolean },
  Error,
  string
> {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteReadingProgressLog,
    onSuccess: () => {
      if (bookId) {
        queryClient.invalidateQueries({ queryKey: ["readingProgress", bookId] })
      }
      queryClient.invalidateQueries({ queryKey: ["reading"] })
    },
  })
}
