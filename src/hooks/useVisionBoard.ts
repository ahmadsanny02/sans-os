import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query"

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

export interface CreateVisionBoardItemInput {
  type: string
  content: string
  xOffset?: number
  yOffset?: number
  width?: number
  height?: number
}

export interface UpdateVisionBoardItemInput {
  id: string
  xOffset?: number
  yOffset?: number
  width?: number
  height?: number
}

// 1. Fetch vision board items
async function fetchVisionBoardItems(): Promise<VisionBoardItem[]> {
  const res = await fetch("/api/vision-board")
  if (!res.ok) {
    throw new Error("Failed to fetch vision board items")
  }
  return res.json()
}

export function useVisionBoardQuery(): UseQueryResult<VisionBoardItem[], Error> {
  return useQuery<VisionBoardItem[]>({
    queryKey: ["vision-board"],
    queryFn: fetchVisionBoardItems,
  })
}

// 2. Create vision board item
async function createVisionBoardItem(body: CreateVisionBoardItemInput): Promise<VisionBoardItem> {
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

export function useCreateVisionBoardItemMutation(): UseMutationResult<
  VisionBoardItem,
  Error,
  CreateVisionBoardItemInput
> {
  const queryClient = useQueryClient()
  return useMutation<VisionBoardItem, Error, CreateVisionBoardItemInput>({
    mutationFn: createVisionBoardItem,
    onSuccess: (newItem) => {
      queryClient.setQueryData<VisionBoardItem[]>(["vision-board"], (old) => {
        if (!old) return [newItem]
        return [...old.filter((item) => item.id !== newItem.id), newItem]
      })
      queryClient.invalidateQueries({ queryKey: ["vision-board"] })
    },
  })
}

// 3. Update coordinates and sizes of a vision board item
async function updateVisionBoardItem(body: UpdateVisionBoardItemInput): Promise<VisionBoardItem> {
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

export function useUpdateVisionBoardItemMutation(): UseMutationResult<
  VisionBoardItem,
  Error,
  UpdateVisionBoardItemInput,
  { previous: VisionBoardItem[] | undefined }
> {
  const queryClient = useQueryClient()
  return useMutation<
    VisionBoardItem,
    Error,
    UpdateVisionBoardItemInput,
    { previous: VisionBoardItem[] | undefined }
  >({
    mutationFn: updateVisionBoardItem,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["vision-board"] })
      const previous = queryClient.getQueryData<VisionBoardItem[]>(["vision-board"])
      if (previous) {
        queryClient.setQueryData<VisionBoardItem[]>(
          ["vision-board"],
          previous.map((item) =>
            item.id === variables.id ? { ...item, ...variables } : item
          )
        )
      }
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["vision-board"], context.previous)
      }
    },
    onSettled: () => {
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

export function useDeleteVisionBoardItemMutation(): UseMutationResult<
  { success: boolean },
  Error,
  string,
  { previous: VisionBoardItem[] | undefined }
> {
  const queryClient = useQueryClient()
  return useMutation<
    { success: boolean },
    Error,
    string,
    { previous: VisionBoardItem[] | undefined }
  >({
    mutationFn: deleteVisionBoardItem,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["vision-board"] })
      const previous = queryClient.getQueryData<VisionBoardItem[]>(["vision-board"])
      if (previous) {
        queryClient.setQueryData<VisionBoardItem[]>(
          ["vision-board"],
          previous.filter((item) => item.id !== id)
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["vision-board"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["vision-board"] })
    },
  })
}
