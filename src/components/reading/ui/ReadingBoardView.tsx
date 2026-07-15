"use client"

import React from "react"
import { ReadingItem } from "@/hooks/useReading"
import { formatDate } from "@/hooks/useReadingPage"
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
} from "lucide-react"
import { GridCardSkeleton } from "@/components/ui/Skeletons"
import { StatCard } from "@/components/ui/StatCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorState } from "@/components/ui/ErrorState"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/Badge"

const STATUS_OPTIONS = ["All", "To Read", "Reading", "Completed"]

interface ReadingBoardViewProps {
  isLoading: boolean
  isError: boolean
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  editingBook: ReadingItem | null
  setEditingBook: (book: ReadingItem | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedStatusFilter: string
  setSelectedStatusFilter: (status: string) => void
  addTitle: string
  setAddTitle: (val: string) => void
  addAuthor: string
  setAddAuthor: (val: string) => void
  addStatus: string
  setAddStatus: (val: string) => void
  addRating: number
  setAddRating: (val: number) => void
  addReview: string
  setAddReview: (val: string) => void
  addFinishedAt: string
  setAddFinishedAt: (val: string) => void
  addProgress: string
  setAddProgress: (val: string) => void
  addError: string | null
  editTitle: string
  setEditTitle: (val: string) => void
  editAuthor: string
  setEditAuthor: (val: string) => void
  editStatus: string
  setEditStatus: (val: string) => void
  editRating: number
  setEditRating: (val: number) => void
  editReview: string
  setEditReview: (val: string) => void
  editFinishedAt: string
  setEditFinishedAt: (val: string) => void
  editProgress: string
  setEditProgress: (val: string) => void
  editError: string | null
  handleAddBook: (e: React.FormEvent) => Promise<void>
  handleOpenEdit: (book: ReadingItem) => void
  handleUpdateBook: (e: React.FormEvent) => Promise<void>
  handleDeleteBook: (id: string, titleStr: string) => Promise<void>
  handleQuickStartReading: (id: string) => Promise<void>
  handleQuickMarkCompleted: (book: ReadingItem) => void
  totalBooks: number
  readingCount: number
  completedCount: number
  averageRating: number
  filteredBooks: ReadingItem[]
  isPendingCreate: boolean
  isPendingUpdate: boolean
  isPendingDelete: boolean
}

export function ReadingBoardView({
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
  isPendingCreate,
  isPendingUpdate,
  isPendingDelete,
}: ReadingBoardViewProps) {
  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-200">
        <StatCard
          title="Total Books"
          value={totalBooks}
          icon={<BookOpen className="h-6 w-6" />}
          iconBgClass="bg-violet-500/10"
          iconTextClass="text-violet-500"
          isLoading={isLoading}
          description="Books registered"
        />

        <StatCard
          title="Currently Reading"
          value={readingCount}
          icon={<Clock className="h-6 w-6" />}
          iconBgClass="bg-blue-500/10"
          iconTextClass="text-blue-500"
          isLoading={isLoading}
          description="Books in progress"
        />

        <StatCard
          title="Completed Books"
          value={completedCount}
          icon={<BookMarked className="h-6 w-6" />}
          iconBgClass="bg-emerald-500/10"
          iconTextClass="text-emerald-500"
          isLoading={isLoading}
          description="Finished reading"
        />

        <StatCard
          title="Average Rating"
          value={
            <>
              {averageRating}
              <span className="text-sm font-bold text-muted-foreground">/ 5.0</span>
            </>
          }
          icon={<Star className="h-6 w-6 fill-amber-500 text-amber-500" />}
          iconBgClass="bg-amber-500/10"
          iconTextClass="text-amber-500"
          isLoading={isLoading}
          description="Rating overall"
        />
      </div>

      {/* 2. Controls Section (Search, Add button) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-5">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search book title or author..."
            className="w-full rounded-xl border border-border/60 bg-card/40 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95 self-start md:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? "Cancel Add" : "Add Book Log"}
        </button>
      </div>

      {/* 3. Add Book Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddBook}
          className="bento-card p-5 space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
            <BookOpen className="h-4.5 w-4.5 text-primary" /> Record New Book
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
                className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
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
                className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
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
                className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
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
                          className={`h-6 w-6 ${active
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
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
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
                  className="w-full rounded-xl border border-border bg-background/50 p-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none shadow-sm"
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
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
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
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-secondary/30 px-4 py-2.5 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:bg-secondary/60 hover:text-foreground hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPendingCreate}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isPendingCreate ? (
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
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all border ${isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-glass shadow-glow"
                  : "bg-secondary/20 hover:bg-secondary/50 border-border/60 text-muted-foreground"
                }`}
              >
                {status}
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. Books Cards Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <GridCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="Error loading reading journal logs. Please check database." />
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          title="No books found matching criteria."
          description="Click &quot;Add Book Log&quot; to register a book."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => {
            return (
              <div
                key={book.id}
                className="group relative rounded-2xl border border-border/60 bg-card/40 hover:bg-card/75 p-5 shadow-sm hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Status Badge & Actions */}
                  <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-3">
                    <Badge variant={book.status === "Completed" ? "success" : book.status === "Reading" ? "info" : "warning"}>
                      {book.status}
                    </Badge>

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
                        disabled={isPendingDelete}
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

                  {/* Progress Tracker Display for Reading Books */}
                  {book.status === "Reading" && book.currentProgress && (
                    <div className="mt-4 pt-3 border-t border-border/30">
                      <div className="text-xs text-muted-foreground flex flex-col gap-1.5 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <p>Progress:</p>
                        </div>
                        <p className="text-foreground">{book.currentProgress}</p>
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
                                className={`h-4 w-4 ${isGold ? "text-amber-500 fill-amber-500" : "text-muted/20"
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
                        disabled={isPendingUpdate}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/30 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/15 py-1.5 text-xs font-bold text-blue-500 transition-all active:scale-[0.98]"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Start Reading
                      </button>
                    ) : (
                      <button
                        onClick={() => handleQuickMarkCompleted(book)}
                        disabled={isPendingUpdate}
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
      <Modal
        isOpen={!!editingBook}
        onClose={() => setEditingBook(null)}
        title="Edit Book Details"
        icon={<BookOpen className="h-5 w-5 text-violet-500" />}
      >
        {editingBook && (
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
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
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
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label htmlFor="editBookStatus" className="text-xs font-bold text-muted-foreground">Reading Status *</label>
                <select
                  id="editBookStatus"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
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
                            className={`h-6 w-6 ${active
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
                    className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
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
                    className="w-full rounded-xl border border-border bg-background/50 p-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none shadow-sm"
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
                    className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
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
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-secondary/30 px-4 py-2.5 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:bg-secondary/60 hover:text-foreground hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPendingUpdate}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isPendingUpdate ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
