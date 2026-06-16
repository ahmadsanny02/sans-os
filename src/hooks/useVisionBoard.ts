import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface VisionBoardItem {
  id: string
  userId: string
  type: string
  content: string
  xOffset: number
  yOffset: number
  width: number
  height: number
  createdAt: string
}

// 1. Fetch vision board items
async function fetchVisionBoardItems(): Promise<VisionBoardItem[]> {
  const res = await fetch("/api/vision-board")
  if (!res.ok) {
    throw new Error("Failed to fetch vision board items")
  }
  return res.json()
}

export function useVisionBoardQuery() {
  return useQuery<VisionBoardItem[]>({
    queryKey: ["vision-board"],
    queryFn: fetchVisionBoardItems,
  })
}

// 2. Create vision board item
async function createVisionBoardItem(body: {
  type: string
  content: string
  xOffset?: number
  yOffset?: number
  width?: number
  height?: number
}): Promise<VisionBoardItem> {
  const res = await fetch("/api/vision-board", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create vision board item")
  }
  return res.json()
}

export function useCreateVisionBoardItemMutation() {
  const queryClient = useQueryClient()
  return useMutation<VisionBoardItem, Error, {
    type: string
    content: string
    xOffset?: number
    yOffset?: number
    width?: number
    height?: number
  }>({
    mutationFn: createVisionBoardItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision-board"] })
    },
  })
}

// 3. Update coordinates and sizes of a vision board item
async function updateVisionBoardItem(body: {
  id: string
  xOffset?: number
  yOffset?: number
  width?: number
  height?: number
}): Promise<VisionBoardItem> {
  const res = await fetch("/api/vision-board", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to update vision board item")
  }
  return res.json()
}

export function useUpdateVisionBoardItemMutation() {
  const queryClient = useQueryClient()
  return useMutation<VisionBoardItem, Error, {
    id: string
    xOffset?: number
    yOffset?: number
    width?: number
    height?: number
  }>({
    mutationFn: updateVisionBoardItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision-board"] })
    },
  })
}

// 4. Delete vision board item
async function deleteVisionBoardItem(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/vision-board?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete vision board item")
  }
  return res.json()
}

export function useDeleteVisionBoardItemMutation() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteVisionBoardItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vision-board"] })
    },
  })
}
