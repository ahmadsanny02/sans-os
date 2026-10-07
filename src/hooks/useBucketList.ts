import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query"

export interface BucketItem {
  id: string
  userId: string
  title: string
  imageUrl: string | null
  completed: boolean
  completedAt: string | null
  createdAt: string
}

export interface CreateBucketItemInput {
  title: string
  imageUrl?: string | null
}

export interface UpdateBucketItemInput {
  id: string
  title?: string
  imageUrl?: string | null
  completed?: boolean
}

// 1. Fetch all bucket items
async function fetchBucketList(): Promise<BucketItem[]> {
  const res = await fetch("/api/bucket-list")
  if (!res.ok) {
    throw new Error("Failed to fetch bucket list items")
  }
  return res.json()
}

export function useBucketListQuery(): UseQueryResult<BucketItem[], Error> {
  return useQuery<BucketItem[]>({
    queryKey: ["bucket-list"],
    queryFn: fetchBucketList,
  })
}

// 2. Create bucket item
async function createBucketItem(body: CreateBucketItemInput): Promise<BucketItem> {
  const res = await fetch("/api/bucket-list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create bucket list item")
  }
  return res.json()
}

export function useCreateBucketItemMutation(): UseMutationResult<
  BucketItem,
  Error,
  CreateBucketItemInput
> {
  const queryClient = useQueryClient()
  return useMutation<BucketItem, Error, CreateBucketItemInput>({
    mutationFn: createBucketItem,
    onSuccess: (newItem) => {
      queryClient.setQueryData<BucketItem[]>(["bucket-list"], (old) => {
        if (!old) return [newItem]
        return [...old.filter((item) => item.id !== newItem.id), newItem]
      })
      queryClient.invalidateQueries({ queryKey: ["bucket-list"] })
    },
  })
}

// 3. Update bucket item (title, completed, imageUrl)
async function updateBucketItem(body: UpdateBucketItemInput): Promise<BucketItem> {
  const res = await fetch("/api/bucket-list", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to update bucket list item")
  }
  return res.json()
}

export function useUpdateBucketItemMutation(): UseMutationResult<
  BucketItem,
  Error,
  UpdateBucketItemInput,
  { previous: BucketItem[] | undefined }
> {
  const queryClient = useQueryClient()
  return useMutation<
    BucketItem,
    Error,
    UpdateBucketItemInput,
    { previous: BucketItem[] | undefined }
  >({
    mutationFn: updateBucketItem,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["bucket-list"] })
      const previous = queryClient.getQueryData<BucketItem[]>(["bucket-list"])
      if (previous) {
        queryClient.setQueryData<BucketItem[]>(
          ["bucket-list"],
          previous.map((item) =>
            item.id === variables.id ? { ...item, ...variables } : item
          )
        )
      }
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bucket-list"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bucket-list"] })
    },
  })
}

// 4. Delete bucket item
async function deleteBucketItem(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/bucket-list?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete bucket list item")
  }
  return res.json()
}

export function useDeleteBucketItemMutation(): UseMutationResult<
  { success: boolean },
  Error,
  string,
  { previous: BucketItem[] | undefined }
> {
  const queryClient = useQueryClient()
  return useMutation<
    { success: boolean },
    Error,
    string,
    { previous: BucketItem[] | undefined }
  >({
    mutationFn: deleteBucketItem,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["bucket-list"] })
      const previous = queryClient.getQueryData<BucketItem[]>(["bucket-list"])
      if (previous) {
        queryClient.setQueryData<BucketItem[]>(
          ["bucket-list"],
          previous.filter((item) => item.id !== id)
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bucket-list"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bucket-list"] })
    },
  })
}
