"use client"

import React, { useState } from "react"
import {
  useBucketListQuery,
  useCreateBucketItemMutation,
  useUpdateBucketItemMutation,
  useDeleteBucketItemMutation,
  BucketItem,
} from "@/hooks/useBucketList"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { confirmDestructive, showError, showSuccessToast } from "@/lib/sweetalert"

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    return format(d, "MMM d, yyyy")
  } catch {
    return ""
  }
}

export function useBucketListPage() {
  const queryClient = useQueryClient()
  const { data: bucketItems = [], isLoading, isError } = useBucketListQuery()
  const createItemMutation = useCreateBucketItemMutation()
  const updateItemMutation = useUpdateBucketItemMutation()
  const deleteItemMutation = useDeleteBucketItemMutation()

  // Controls state
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BucketItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("All") // All, Active, Achieved

  // Form states (Add)
  const [addTitle, setAddTitle] = useState("")
  const [addImageUrl, setAddImageUrl] = useState("")
  const [addError, setAddError] = useState<string | null>(null)

  // Form states (Edit)
  const [editTitle, setEditTitle] = useState("")
  const [editImageUrl, setEditImageUrl] = useState("")
  const [editCompleted, setEditCompleted] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const handleAddItem = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setAddError(null)

    if (!addTitle.trim()) {
      setAddError("Please fill out the Title field.")
      return
    }

    try {
      await createItemMutation.mutateAsync({
        title: addTitle.trim(),
        imageUrl: addImageUrl.trim() || null,
      })
      setAddTitle("")
      setAddImageUrl("")
      setShowAddForm(false)
      showSuccessToast("Dream added to bucket list!")
    } catch {
      setAddError("Failed to add item to bucket list.")
    }
  }

  const handleOpenEdit = (item: BucketItem): void => {
    setEditingItem(item)
    setEditTitle(item.title)
    setEditImageUrl(item.imageUrl || "")
    setEditCompleted(item.completed)
    setEditError(null)
  }

  const handleUpdateItem = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setEditError(null)

    if (!editingItem) return
    if (!editTitle.trim()) {
      setEditError("Please fill out the Title field.")
      return
    }

    try {
      await updateItemMutation.mutateAsync({
        id: editingItem.id,
        title: editTitle.trim(),
        imageUrl: editImageUrl.trim() || null,
        completed: editCompleted,
      })
      setEditingItem(null)
      showSuccessToast("Dream updated successfully")
    } catch {
      setEditError("Failed to update bucket list item.")
    }
  }

  const handleDeleteItem = async (id: string, titleStr: string): Promise<void> => {
    const isConfirmed = await confirmDestructive(
      "Delete Bucket Goal",
      `Are you sure you want to delete "${titleStr}"?`
    )
    if (!isConfirmed) return
    try {
      await deleteItemMutation.mutateAsync(id)
      showSuccessToast("Dream deleted successfully")
    } catch {
      showError("Delete Error", "Failed to delete item.")
    }
  }

  const handleToggleCompleted = async (item: BucketItem): Promise<void> => {
    const nextCompleted = !item.completed
    const nextCompletedAt = nextCompleted ? new Date().toISOString() : null

    queryClient.setQueryData<BucketItem[]>(["bucket-list"], (old) => {
      if (!old) return []
      return old.map((i) =>
        i.id === item.id ? { ...i, completed: nextCompleted, completedAt: nextCompletedAt } : i
      )
    })

    try {
      await updateItemMutation.mutateAsync({
        id: item.id,
        completed: nextCompleted,
      })
      showSuccessToast(nextCompleted ? "Goal achieved! Congratulations!" : "Goal set back to active")
    } catch {
      queryClient.invalidateQueries({ queryKey: ["bucket-list"] })
      showError("Error", "Failed to toggle completion status.")
    }
  }

  // Calculate metrics
  const totalCount = bucketItems.length
  const completedCount = bucketItems.filter((i) => i.completed).length
  const activeCount = totalCount - completedCount
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Filter list
  const filteredItems = bucketItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      selectedFilter === "All" ||
      (selectedFilter === "Active" && !item.completed) ||
      (selectedFilter === "Achieved" && item.completed)
    return matchesSearch && matchesStatus
  })

  return {
    bucketItems,
    isLoading,
    isError,
    showAddForm,
    setShowAddForm,
    editingItem,
    setEditingItem,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    addTitle,
    setAddTitle,
    addImageUrl,
    setAddImageUrl,
    addError,
    editTitle,
    setEditTitle,
    editImageUrl,
    setEditImageUrl,
    editCompleted,
    setEditCompleted,
    editError,
    handleAddItem,
    handleOpenEdit,
    handleUpdateItem,
    handleDeleteItem,
    handleToggleCompleted,
    totalCount,
    completedCount,
    activeCount,
    completionRate,
    filteredItems,
    isPendingCreate: createItemMutation.isPending,
    isPendingUpdate: updateItemMutation.isPending,
    isPendingDelete: deleteItemMutation.isPending,
  }
}

export type UseBucketListPageReturn = ReturnType<typeof useBucketListPage>
