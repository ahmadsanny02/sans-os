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
import {
  Plus,
  Trash2,
  Star,
  Loader2,
  Search,
  BookOpen,
  Sparkles,
  AlertCircle,
  Clock,
  BookMarked,
  CheckCircle2,
  Edit2,
  MessageSquare,
  X,
} from "lucide-react"

// Status badge styling themes
const STATUS_THEMES: Record<string, { bg: string; text: string; border: string }> = {
  "To Read": {
    bg: "bg-amber-500/10",
    text: "text-amber-500 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  Reading: {
    bg: "bg-blue-500/10",
    text: "text-blue-500 dark:text-blue-400",
    border: "border-blue-500/20",
  },
  Completed: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
}

export function ReadingBoard() {
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

  // Inline progress state mapping book ID -> input value
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>({})

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
    } catch {
      setEditError("Failed to update book log.")
    }
  }

  const handleDeleteBook = async (id: string, titleStr: string): Promise<void> => {
    if (!confirm(`Are you sure you want to delete the book "${titleStr}"?`)) return
    try {
      await deleteBookMutation.mutateAsync(id)
    } catch {
      alert("Failed to delete book log.")
    }
  }

  const handleQuickStartReading = async (id: string): Promise<void> => {
    try {
      await updateBookMutation.mutateAsync({
        id,
        status: "Reading",
      })
    } catch {
      alert("Failed to update status.")
    }
  }

  const handleQuickMarkCompleted = (book: ReadingItem): void => {
    // Open edit modal directly with status preset to Completed to fill out rating/review and finished date
    setEditingBook(book)
    setEditTitle(book.title)
    setEditAuthor(book.author)
    setEditStatus("Completed")
    setEditRating(book.rating || 5) // Suggest 5 stars on completion!
    setEditReview(book.review || "")
    setEditFinishedAt(book.finishedAt ? new Date(book.finishedAt).toISOString().split("T")[0] : todayStr)
    setEditProgress("")
    setEditError(null)
  }

  const handleProgressChange = (id: string, value: string): void => {
    setProgressInputs((prev) => ({ ...prev, [id]: value }))
  }

  const handleSaveProgress = async (id: string): Promise<void> => {
    const progressVal = progressInputs[id] !== undefined ? progressInputs[id] : ""
    try {
      await updateBookMutation.mutateAsync({
        id,
        currentProgress: progressVal.trim(),
      })
    } catch {
      alert("Failed to save progress.")
    }
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

  const STATUS_OPTIONS = ["All", "To Read", "Reading", "Completed"]

  function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return ""
    try {
      const d = new Date(dateStr)
      return format(d, "MMM d, yyyy")
    } catch {
      return ""
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-border bg-card/40 backdrop-blur-md">
        <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 text-sm font-semibold text-destructive">
        <AlertCircle className="h-8 w-8" />
        <span>Error loading reading journal logs. Please check database.</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Books</span>
            <h4 className="text-3xl font-black text-foreground">{totalBooks}</h4>
          </div>
          <div className="rounded-xl bg-violet-500/10 p-3 text-violet-500">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Currently Reading</span>
            <h4 className="text-3xl font-black text-foreground">{readingCount}</h4>
          </div>
          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Completed Books</span>
            <h4 className="text-3xl font-black text-foreground">{completedCount}</h4>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
            <BookMarked className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Average Rating</span>
            <h4 className="text-3xl font-black text-foreground flex items-baseline gap-1">
              {averageRating}
              <span className="text-sm font-bold text-muted-foreground">/ 5.0</span>
            </h4>
          </div>
          <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500 flex items-center justify-center">
            <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
          </div>
        </div>
      </div>

      {/* 2. Controls Section (Search, Add button) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-5">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search book title or author..."
            className="w-full rounded-xl border border-border bg-card/60 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
          />
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-sidebar-primary px-3.5 py-2 text-xs font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/90 hover:scale-[1.02] self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? "Cancel Add" : "Add Book Log"}
        </button>
      </div>

      {/* 3. Add Book Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddBook}
          className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm backdrop-blur-md space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
            <BookOpen className="h-4.5 w-4.5 text-violet-500" /> Record New Book
          </h4>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="addBookTitle" className="text-xs font-bold text-muted-foreground">
                Book Title *
              </label>
              <input
                id="addBookTitle"
                type="text"
                required
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                placeholder="e.g. Atomic Habits"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
              />
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label htmlFor="addBookAuthor" className="text-xs font-bold text-muted-foreground">
                Author *
              </label>
              <input
                id="addBookAuthor"
                type="text"
                required
                value={addAuthor}
                onChange={(e) => setAddAuthor(e.target.value)}
                placeholder="e.g. James Clear"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label htmlFor="addBookStatus" className="text-xs font-bold text-muted-foreground">
                Reading Status *
              </label>
              <select
                id="addBookStatus"
                value={addStatus}
                onChange={(e) => setAddStatus(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
              >
                <option value="To Read">To Read</option>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Conditional Star Rating & Review for Completed status */}
          {addStatus === "Completed" && (
            <div className="border-t border-border/40 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-muted-foreground">Rating *</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= addRating
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setAddRating(star)}
                        className="p-1 rounded transition-transform active:scale-90"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            active
                              ? "text-amber-500 fill-amber-500 hover:scale-110"
                              : "text-muted-foreground/40 hover:text-amber-500/50"
                          } transition-all`}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Date Finished */}
              <div className="space-y-1.5">
                <label htmlFor="addBookFinishedAt" className="text-xs font-bold text-muted-foreground">
                  Date Finished *
                </label>
                <input
                  id="addBookFinishedAt"
                  type="date"
                  required
                  value={addFinishedAt}
                  onChange={(e) => setAddFinishedAt(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="addBookReview" className="text-xs font-bold text-muted-foreground">
                  Book Review / Key Takeaways
                </label>
                <textarea
                  id="addBookReview"
                  rows={3}
                  value={addReview}
                  onChange={(e) => setAddReview(e.target.value)}
                  placeholder="Share what you learned or your thoughts on the book..."
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm outline-none transition-all focus:border-sidebar-primary"
                />
              </div>
            </div>
          )}

          {/* Conditional Progress Input for Reading status */}
          {addStatus === "Reading" && (
            <div className="border-t border-border/40 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
              <div className="space-y-1.5">
                <label htmlFor="addBookProgress" className="text-xs font-bold text-muted-foreground">
                  Current Progress (e.g. Page 120, Chapter 5)
                </label>
                <input
                  id="addBookProgress"
                  type="text"
                  value={addProgress}
                  onChange={(e) => setAddProgress(e.target.value)}
                  placeholder="Where are you in the book?"
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
                />
              </div>
            </div>
          )}

          {addError && (
            <p className="text-xs text-destructive flex items-center gap-1 font-semibold">
              <AlertCircle className="h-3.5 w-3.5" />
              {addError}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBookMutation.isPending}
              className="rounded-lg bg-sidebar-primary px-3.5 py-1.5 text-xs font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary/95 flex items-center gap-1"
            >
              {createBookMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Save Book"
              )}
            </button>
          </div>
        </form>
      )}

      {/* 4. Status Filter Tabs */}
      <div className="overflow-x-auto pb-2 border-b border-border/30">
        <div className="flex gap-2 min-w-max">
          {STATUS_OPTIONS.map((status) => {
            const isActive = selectedStatusFilter === status
            return (
              <button
                key={status}
                onClick={() => setSelectedStatusFilter(status)}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary shadow-sm"
                    : "bg-secondary/20 hover:bg-secondary/50 border-border text-muted-foreground"
                }`}
              >
                {status}
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. Books Cards Grid */}
      {filteredBooks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground bg-card/10 select-none">
          No books found matching criteria. Click &quot;Add Book Log&quot; to register a book.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => {
            const badge = STATUS_THEMES[book.status] || STATUS_THEMES["To Read"]
            return (
              <div
                key={book.id}
                className="group relative rounded-2xl border border-border bg-card/40 dark:bg-card/10 p-5 shadow-sm hover:border-sidebar-primary/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Status Badge & Actions */}
                  <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {book.status}
                    </span>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(book)}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                        title="Edit Book Details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id, book.title)}
                        className="p-1 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all"
                        title="Delete Book"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Core Book Info */}
                  <div className="mt-4 space-y-1">
                    <h4 className="text-lg font-bold tracking-tight text-foreground leading-tight">
                      {book.title}
                    </h4>
                    <p className="text-xs text-muted-foreground italic">
                      by {book.author}
                    </p>
                  </div>

                  {/* Inline Progress Tracker for Reading Books */}
                  {book.status === "Reading" && (
                    <div className="mt-4 pt-3 border-t border-border/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Current Progress
                        </span>
                        {book.currentProgress && (
                          <span className="text-[10px] font-medium text-sidebar-primary/80">
                            Last: {book.currentProgress}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={progressInputs[book.id] ?? book.currentProgress ?? ""}
                          placeholder="e.g. Page 120, Chapter 5"
                          onChange={(e) => handleProgressChange(book.id, e.target.value)}
                          className="flex-1 rounded-lg border border-border bg-background/50 px-2.5 py-1 text-xs outline-none focus:border-sidebar-primary transition-all"
                        />
                        <button
                          onClick={() => handleSaveProgress(book.id)}
                          disabled={updateBookMutation.isPending}
                          className="rounded-lg bg-sidebar-primary px-3 py-1 text-[10px] font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary/95 transition-all shrink-0 active:scale-[0.95] flex items-center justify-center min-w-[40px]"
                        >
                          {updateBookMutation.isPending && progressInputs[book.id] !== undefined ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Conditional Elements: Rating & Review for Completed Books */}
                  {book.status === "Completed" && (
                    <div className="mt-4 space-y-3 pt-3 border-t border-border/30">
                      {/* Rating */}
                      {book.rating !== null && (
                        <div className="flex items-center gap-0.5 select-none">
                          {[1, 2, 3, 4, 5].map((lvl) => {
                            const isGold = lvl <= (book.rating || 0)
                            return (
                              <Star
                                key={lvl}
                                className={`h-4 w-4 ${
                                  isGold ? "text-amber-500 fill-amber-500" : "text-muted/20"
                                }`}
                              />
                            )
                          })}
                        </div>
                      )}

                      {/* Review text box */}
                      {book.review && (
                        <div className="rounded-lg bg-secondary/20 border border-border/40 p-3 relative mt-2 group-hover:bg-secondary/40 transition-colors">
                          <MessageSquare className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/20" />
                          <p className="text-[11px] text-muted-foreground leading-relaxed pr-6 select-text whitespace-pre-wrap">
                            {book.review}
                          </p>
                        </div>
                      )}

                      {/* Finish date */}
                      {book.finishedAt && (
                        <p className="text-[9px] text-muted-foreground/80 flex items-center gap-1 mt-1 font-semibold uppercase tracking-wider">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          Completed: {formatDate(book.finishedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Action Footer Buttons */}
                {book.status !== "Completed" && (
                  <div className="border-t border-border/35 pt-4 mt-5">
                    {book.status === "To Read" ? (
                      <button
                        onClick={() => handleQuickStartReading(book.id)}
                        disabled={updateBookMutation.isPending}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/30 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/15 py-1.5 text-xs font-bold text-blue-500 transition-all active:scale-[0.98]"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Start Reading
                      </button>
                    ) : (
                      <button
                        onClick={() => handleQuickMarkCompleted(book)}
                        disabled={updateBookMutation.isPending}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/15 py-1.5 text-xs font-bold text-emerald-500 transition-all active:scale-[0.98]"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Complete Book
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 6. Edit Book Modal Dialog Overlay */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl backdrop-blur-md space-y-4 animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setEditingBook(null)}
              className="absolute right-4.5 top-4.5 p-1 rounded-lg hover:bg-secondary text-muted-foreground transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <BookOpen className="h-5 w-5 text-violet-500" />
              Edit Book Details
            </h3>

            <form onSubmit={handleUpdateBook} className="space-y-4 pt-1">
              <div className="space-y-3">
                {/* Title */}
                <div className="space-y-1.5">
                  <label htmlFor="editBookTitle" className="text-xs font-bold text-muted-foreground">Book Title *</label>
                  <input
                    id="editBookTitle"
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-sidebar-primary"
                  />
                </div>

                {/* Author */}
                <div className="space-y-1.5">
                  <label htmlFor="editBookAuthor" className="text-xs font-bold text-muted-foreground">Author *</label>
                  <input
                    id="editBookAuthor"
                    type="text"
                    required
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-sidebar-primary"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label htmlFor="editBookStatus" className="text-xs font-bold text-muted-foreground">Reading Status *</label>
                  <select
                    id="editBookStatus"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-sidebar-primary"
                  >
                    <option value="To Read">To Read</option>
                    <option value="Reading">Reading</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Conditional Star Rating & Review for Completed status */}
              {editStatus === "Completed" && (
                <div className="border-t border-border/40 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground">Rating *</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = star <= editRating
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className="p-1 rounded transition-transform active:scale-90"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                active
                                  ? "text-amber-500 fill-amber-500 hover:scale-110"
                                  : "text-muted-foreground/40 hover:text-amber-500/50"
                              } transition-all`}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Date Finished */}
                  <div className="space-y-1.5">
                    <label htmlFor="editBookFinishedAt" className="text-xs font-bold text-muted-foreground">Date Finished *</label>
                    <input
                      id="editBookFinishedAt"
                      type="date"
                      required
                      value={editFinishedAt}
                      onChange={(e) => setEditFinishedAt(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-sidebar-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="editBookReview" className="text-xs font-bold text-muted-foreground">Book Review / Key Takeaways</label>
                    <textarea
                      id="editBookReview"
                      rows={3}
                      value={editReview}
                      onChange={(e) => setEditReview(e.target.value)}
                      placeholder="Share what you learned..."
                      className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-sidebar-primary"
                    />
                  </div>
                </div>
              )}

              {/* Conditional Progress Input for Reading status */}
              {editStatus === "Reading" && (
                <div className="border-t border-border/40 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
                  <div className="space-y-1.5">
                    <label htmlFor="editBookProgress" className="text-xs font-bold text-muted-foreground">Current Progress</label>
                    <input
                      id="editBookProgress"
                      type="text"
                      value={editProgress}
                      onChange={(e) => setEditProgress(e.target.value)}
                      placeholder="e.g. Page 120, Chapter 5"
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-sidebar-primary"
                    />
                  </div>
                </div>
              )}

              {editError && (
                <p className="text-xs text-destructive flex items-center gap-1 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {editError}
                </p>
              )}

              <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateBookMutation.isPending}
                  className="rounded-lg bg-sidebar-primary px-4 py-1.5 text-xs font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary/95 flex items-center gap-1"
                >
                  {updateBookMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
