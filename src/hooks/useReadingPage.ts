"use client"

import React, { useState } from "react"
import {
  useReadingQuery,
  useCreateReadingMutation,
  useUpdateReadingMutation,
  useDeleteReadingMutation,
  ReadingItem,
} from "@/hooks/useReading"
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

export function useReadingPage() {
  const { data: booksList = [], isLoading, isError } = useReadingQuery()
  const createBookMutation = useCreateReadingMutation()
  const updateBookMutation = useUpdateReadingMutation()
  const deleteBookMutation = useDeleteReadingMutation()

  // State controls
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBook, setEditingBook] = useState<ReadingItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All")

  const todayStr = new Date().toISOString().split("T")[0]

  // Form states (Add)
  const [addTitle, setAddTitle] = useState("")
  const [addAuthor, setAddAuthor] = useState("")
  const [addStatus, setAddStatus] = useState("To Read")
  const [addRating, setAddRating] = useState(3)
  const [addReview, setAddReview] = useState("")
  const [addFinishedAt, setAddFinishedAt] = useState(todayStr)
  const [addProgress, setAddProgress] = useState("")
  const [addError, setAddError] = useState<string | null>(null)

  // Form states (Edit)
  const [editTitle, setEditTitle] = useState("")
  const [editAuthor, setEditAuthor] = useState("")
  const [editStatus, setEditStatus] = useState("To Read")
  const [editRating, setEditRating] = useState(3)
  const [editReview, setEditReview] = useState("")
  const [editFinishedAt, setEditFinishedAt] = useState(todayStr)
  const [editProgress, setEditProgress] = useState("")
  const [editError, setEditError] = useState<string | null>(null)

  const handleAddBook = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setAddError(null)

    if (!addTitle.trim() || !addAuthor.trim()) {
      setAddError("Please fill out Title and Author fields.")
      return
    }

    try {
      await createBookMutation.mutateAsync({
        title: addTitle.trim(),
        author: addAuthor.trim(),
        status: addStatus,
        rating: addStatus === "Completed" ? addRating : null,
        review: addStatus === "Completed" ? addReview.trim() : null,
        finishedAt: addStatus === "Completed" ? addFinishedAt : null,
        currentProgress: addStatus === "Reading" ? addProgress.trim() : null,
      })
      setAddTitle("")
      setAddAuthor("")
      setAddStatus("To Read")
      setAddRating(3)
      setAddReview("")
      setAddFinishedAt(todayStr)
      setAddProgress("")
      setShowAddForm(false)
      showSuccessToast("Book added to reading journal")
    } catch {
      setAddError("Failed to add book to journal.")
    }
  }

  const handleOpenEdit = (book: ReadingItem): void => {
    setEditingBook(book)
    setEditTitle(book.title)
    setEditAuthor(book.author)
    setEditStatus(book.status)
    setEditRating(book.rating || 3)
    setEditReview(book.review || "")
    setEditFinishedAt(book.finishedAt ? new Date(book.finishedAt).toISOString().split("T")[0] : todayStr)
    setEditProgress(book.currentProgress || "")
    setEditError(null)
  }

  const handleUpdateBook = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setEditError(null)

    if (!editingBook) return
    if (!editTitle.trim() || !editAuthor.trim()) {
      setEditError("Please fill out Title and Author fields.")
      return
    }

    if (editStatus === "Completed" && !editFinishedAt) {
      setEditError("Please select the completion date.")
      return
    }

    try {
      await updateBookMutation.mutateAsync({
        id: editingBook.id,
        title: editTitle.trim(),
        author: editAuthor.trim(),
        status: editStatus,
        rating: editStatus === "Completed" ? editRating : null,
        review: editStatus === "Completed" ? editReview.trim() : null,
        finishedAt: editStatus === "Completed" ? editFinishedAt : null,
        currentProgress: editStatus === "Reading" ? editProgress.trim() : null,
      })
      setEditingBook(null)
      showSuccessToast("Book log updated")
    } catch {
      setEditError("Failed to update book log.")
    }
  }

  const handleDeleteBook = async (id: string, titleStr: string): Promise<void> => {
    const confirmed = await confirmDestructive(
      "Delete Book?",
      `Are you sure you want to delete the book "${titleStr}"?`
    )
    if (!confirmed) return
    try {
      await deleteBookMutation.mutateAsync(id)
      showSuccessToast("Book deleted successfully")
    } catch {
      await showError("Deletion Failed", "Failed to delete book log.")
    }
  }

  const handleQuickStartReading = async (id: string): Promise<void> => {
    try {
      await updateBookMutation.mutateAsync({
        id,
        status: "Reading",
      })
      showSuccessToast("Status updated to Reading")
    } catch {
      await showError("Update Failed", "Failed to update status.")
    }
  }

  const handleQuickMarkCompleted = (book: ReadingItem): void => {
    setEditingBook(book)
    setEditTitle(book.title)
    setEditAuthor(book.author)
    setEditStatus("Completed")
    setEditRating(book.rating || 5)
    setEditReview(book.review || "")
    setEditFinishedAt(book.finishedAt ? new Date(book.finishedAt).toISOString().split("T")[0] : todayStr)
    setEditProgress("")
    setEditError(null)
  }

  // Calculate metrics
  const totalBooks = booksList.length
  const readingCount = booksList.filter((b) => b.status === "Reading").length
  const completedCount = booksList.filter((b) => b.status === "Completed").length

  const completedWithRating = booksList.filter((b) => b.status === "Completed" && b.rating !== null)
  const averageRating = completedWithRating.length > 0
    ? Number((completedWithRating.reduce((acc, curr) => acc + (curr.rating || 0), 0) / completedWithRating.length).toFixed(1))
    : 0

  // Filter book lists
  const filteredBooks = booksList.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatusFilter === "All" || book.status === selectedStatusFilter

    return matchesSearch && matchesStatus
  })

  return {
    booksList,
    isLoading,
    isError,
    showAddForm,
    setShowAddForm,
    editingBook,
    setEditingBook,
    searchQuery,
    setSearchQuery,
    selectedStatusFilter,
    setSelectedStatusFilter,
    addTitle,
    setAddTitle,
    addAuthor,
    setAddAuthor,
    addStatus,
    setAddStatus,
    addRating,
    setAddRating,
    addReview,
    setAddReview,
    addFinishedAt,
    setAddFinishedAt,
    addProgress,
    setAddProgress,
    addError,
    editTitle,
    setEditTitle,
    editAuthor,
    setEditAuthor,
    editStatus,
    setEditStatus,
    editRating,
    setEditRating,
    editReview,
    setEditReview,
    editFinishedAt,
    setEditFinishedAt,
    editProgress,
    setEditProgress,
    editError,
    handleAddBook,
    handleOpenEdit,
    handleUpdateBook,
    handleDeleteBook,
    handleQuickStartReading,
    handleQuickMarkCompleted,
    totalBooks,
    readingCount,
    completedCount,
    averageRating,
    filteredBooks,
    isPendingCreate: createBookMutation.isPending,
    isPendingUpdate: updateBookMutation.isPending,
    isPendingDelete: deleteBookMutation.isPending,
  }
}

export type UseReadingPageReturn = ReturnType<typeof useReadingPage>
