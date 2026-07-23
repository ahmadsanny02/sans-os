"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface CategoryItem {
  id: string
  name: string
  module: "habits" | "timetable" | "learning" | "projects" | "general"
  color: string
  description?: string
  isSystemDefault?: boolean
}

async function fetchCategories(): Promise<CategoryItem[]> {
  const res = await fetch("/api/categories")
  if (!res.ok) {
    throw new Error("Failed to fetch categories")
  }
  return res.json()
}

async function createCategory(body: Omit<CategoryItem, "id" | "isSystemDefault">): Promise<CategoryItem> {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create category")
  }
  return res.json()
}

async function updateCategoryApi(params: { id: string; patch: Partial<Omit<CategoryItem, "id" | "isSystemDefault">> }): Promise<CategoryItem> {
  const res = await fetch(`/api/categories/${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.patch),
  })
  if (!res.ok) {
    throw new Error("Failed to update category")
  }
  return res.json()
}

async function deleteCategoryApi(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete category")
  }
  return res.json()
}

export function useCategories() {
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery<CategoryItem[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  })

  const createMutation = useMutation<CategoryItem, Error, Omit<CategoryItem, "id" | "isSystemDefault">>({
    mutationFn: createCategory,
    onSuccess: (newItem) => {
      queryClient.setQueryData<CategoryItem[]>(["categories"], (old) => {
        if (!old) return [newItem]
        return [...old.filter((item) => item.id !== newItem.id), newItem]
      })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })

  const updateMutation = useMutation<
    CategoryItem,
    Error,
    { id: string; patch: Partial<Omit<CategoryItem, "id" | "isSystemDefault">> },
    { previous: CategoryItem[] | undefined }
  >({
    mutationFn: updateCategoryApi,
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] })
      const previous = queryClient.getQueryData<CategoryItem[]>(["categories"])
      if (previous) {
        queryClient.setQueryData<CategoryItem[]>(
          ["categories"],
          previous.map((item) =>
            item.id === id ? { ...item, ...patch } : item
          )
        )
      }
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["categories"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["timetable"] })
      queryClient.invalidateQueries({ queryKey: ["habits"] })
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
      queryClient.invalidateQueries({ queryKey: ["learning-subjects"] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })

  const deleteMutation = useMutation<
    { success: boolean },
    Error,
    string,
    { previous: CategoryItem[] | undefined }
  >({
    mutationFn: deleteCategoryApi,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] })
      const previous = queryClient.getQueryData<CategoryItem[]>(["categories"])
      if (previous) {
        queryClient.setQueryData<CategoryItem[]>(
          ["categories"],
          previous.filter((item) => item.id !== id)
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["categories"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["timetable"] })
      queryClient.invalidateQueries({ queryKey: ["habits"] })
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
      queryClient.invalidateQueries({ queryKey: ["learning-subjects"] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })

  const addCategory = (newItem: Omit<CategoryItem, "id" | "isSystemDefault">) => {
    createMutation.mutate(newItem)
  }

  const updateCategory = async (id: string, patch: Partial<Omit<CategoryItem, "id" | "isSystemDefault">>) => {
    updateMutation.mutate({ id, patch })
  }

  const deleteCategory = async (id: string) => {
    deleteMutation.mutate(id)
  }

  const resetToDefault = () => {
    // No-op since we deleted the UI button and defaults are handled
  }

  return {
    categories,
    isLoaded: !isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefault,
  }
}
