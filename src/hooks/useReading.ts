import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

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
}

// 1. Fetch reading items list
async function fetchReadingItems(): Promise<ReadingItem[]> {
  const res = await fetch("/api/reading")
  if (!res.ok) {
    throw new Error("Failed to fetch reading items")
  }
  return res.json()
}

export function useReadingQuery() {
  return useQuery<ReadingItem[]>({
    queryKey: ["reading"],
    queryFn: fetchReadingItems,
  })
}

// 2. Create reading item
async function createReadingItem(body: {
  title: string
  author: string
  status: string
  rating?: number | null
  review?: string | null
  finishedAt?: string | null
  currentProgress?: string | null
}): Promise<ReadingItem> {
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

export function useCreateReadingMutation() {
  const queryClient = useQueryClient()
  return useMutation<ReadingItem, Error, {
    title: string
    author: string
    status: string
    rating?: number | null
    review?: string | null
    finishedAt?: string | null
    currentProgress?: string | null
  }>({
    mutationFn: createReadingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reading"] })
    },
  })
}

// 3. Update reading item
async function updateReadingItem(body: {
  id: string
  title?: string
  author?: string
  status?: string
  rating?: number | null
  review?: string | null
  finishedAt?: string | null
  currentProgress?: string | null
}): Promise<ReadingItem> {
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

export function useUpdateReadingMutation() {
  const queryClient = useQueryClient()
  return useMutation<ReadingItem, Error, {
    id: string
    title?: string
    author?: string
    status?: string
    rating?: number | null
    review?: string | null
    finishedAt?: string | null
    currentProgress?: string | null
  }>({
    mutationFn: updateReadingItem,
    onSuccess: () => {
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

export function useDeleteReadingMutation() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteReadingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reading"] })
    },
  })
}
