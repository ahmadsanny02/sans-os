"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface CategoryItem {
  id: string
  name: string
  module: string
  color: string
  description?: string
  isSystemDefault?: boolean
}

export interface SubCategoryItem {
  id: string
  userId: string
  categoryId: string
  name: string
  createdAt: string
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

// Subcategory API fetchers
async function fetchSubCategories(): Promise<SubCategoryItem[]> {
  const res = await fetch("/api/categories/sub")
  if (!res.ok) {
    throw new Error("Failed to fetch sub-categories")
  }
  return res.json()
}

async function createSubCategory(body: { name: string; categoryId: string }): Promise<SubCategoryItem> {
  const res = await fetch("/api/categories/sub", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create sub-category")
  }
  return res.json()
}

async function updateSubCategoryApi(params: { id: string; name: string }): Promise<SubCategoryItem> {
  const res = await fetch(`/api/categories/sub/${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: params.name }),
  })
  if (!res.ok) {
    throw new Error("Failed to update sub-category")
  }
  return res.json()
}

async function deleteSubCategoryApi(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/categories/sub/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete sub-category")
  }
  return res.json()
}

export interface UseCategoriesReturn {
  categories: CategoryItem[]
  subCategories: SubCategoryItem[]
  isLoaded: boolean
  addCategory: (newItem: Omit<CategoryItem, "id" | "isSystemDefault">) => void
  updateCategory: (id: string, patch: Partial<Omit<CategoryItem, "id" | "isSystemDefault">>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addSubCategory: (categoryId: string, name: string) => void
  updateSubCategory: (id: string, name: string) => void
  deleteSubCategory: (id: string) => void
  resetToDefault: () => void
}

export function useCategories(): UseCategoriesReturn {
  const queryClient = useQueryClient()

  // Categories Queries & Mutations
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<CategoryItem[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  })

  const { data: subCategories = [], isLoading: isLoadingSubs } = useQuery<SubCategoryItem[]>({
    queryKey: ["subCategories"],
    queryFn: fetchSubCategories,
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
      queryClient.invalidateQueries({ queryKey: ["priorities-range"] })
      queryClient.invalidateQueries({ queryKey: ["learningSubjects"] })
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
      queryClient.invalidateQueries({ queryKey: ["priorities-range"] })
      queryClient.invalidateQueries({ queryKey: ["learningSubjects"] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })

  // Sub-categories Mutations
  const createSubMutation = useMutation<SubCategoryItem, Error, { name: string; categoryId: string }>({
    mutationFn: createSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subCategories"] })
    },
  })

  const updateSubMutation = useMutation<SubCategoryItem, Error, { id: string; name: string }>({
    mutationFn: updateSubCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subCategories"] })
      queryClient.invalidateQueries({ queryKey: ["timetable"] })
      queryClient.invalidateQueries({ queryKey: ["habits"] })
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
      queryClient.invalidateQueries({ queryKey: ["priorities-range"] })
      queryClient.invalidateQueries({ queryKey: ["learningSubjects"] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })

  const deleteSubMutation = useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteSubCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subCategories"] })
      queryClient.invalidateQueries({ queryKey: ["timetable"] })
      queryClient.invalidateQueries({ queryKey: ["habits"] })
      queryClient.invalidateQueries({ queryKey: ["priorities"] })
      queryClient.invalidateQueries({ queryKey: ["priorities-range"] })
      queryClient.invalidateQueries({ queryKey: ["learningSubjects"] })
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

  const addSubCategory = (categoryId: string, name: string) => {
    createSubMutation.mutate({ categoryId, name })
  }

  const updateSubCategory = (id: string, name: string) => {
    updateSubMutation.mutate({ id, name })
  }

  const deleteSubCategory = (id: string) => {
    deleteSubMutation.mutate(id)
  }

  const resetToDefault = () => {
    // No-op
  }

  return {
    categories,
    subCategories,
    isLoaded: !isLoadingCategories && !isLoadingSubs,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    resetToDefault,
  }
}
