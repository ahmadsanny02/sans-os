"use client"

import React, { useState } from "react"
import {
  ReadingItem,
  useReadingProgressLogsQuery,
  useAddReadingProgressMutation,
  useDeleteReadingProgressMutation,
} from "@/hooks/useReading"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/Badge"
import { formatDate } from "@/hooks/useReadingPage"
import { confirmDestructive, showSuccessToast } from "@/lib/sweetalert"
import {
  BookOpen,
  Plus,
  Trash2,
  Loader2,
  TrendingUp,
  AlertCircle,
  Calendar,
  FileText,
  Clock,
} from "lucide-react"

interface ReadingProgressModalProps {
  book: ReadingItem | null
  onClose: () => void
}

export function ReadingProgressModal({ book, onClose }: ReadingProgressModalProps) {
  const bookId = book?.id || null
  const { data: logs = [], isLoading, isError } = useReadingProgressLogsQuery(bookId)
  const addProgressMutation = useAddReadingProgressMutation()
  const deleteProgressMutation = useDeleteReadingProgressMutation(bookId)

  const [progressInput, setProgressInput] = useState("")
  const [notesInput, setNotesInput] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!book) return null

  const handleAddProgress = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setErrorMsg(null)

    if (!progressInput.trim()) {
      setErrorMsg("Please enter progress value (e.g. Hal. 120 or Bab 4).")
      return
    }

    try {
      await addProgressMutation.mutateAsync({
        bookId: book.id,
        progress: progressInput.trim(),
        notes: notesInput.trim() || null,
      })
      setProgressInput("")
      setNotesInput("")
      showSuccessToast("Progress logged successfully")
    } catch {
      setErrorMsg("Failed to save progress entry.")
    }
  }

  const handleDeleteLog = async (logId: string): Promise<void> => {
    const confirmed = await confirmDestructive(
      "Delete Progress Entry?",
      "Are you sure you want to delete this progress log?"
    )
    if (!confirmed) return

    try {
      await deleteProgressMutation.mutateAsync(logId)
      showSuccessToast("Progress entry deleted")
    } catch {
      setErrorMsg("Failed to delete progress log.")
    }
  }

  return (
    <Modal
      isOpen={!!book}
      onClose={onClose}
      title="Reading Progress History"
      icon={<TrendingUp className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-5 pt-1">
        {/* Book Header Card */}
        <div className="rounded-xl border border-border/60 bg-secondary/25 p-4 space-y-2.5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-base font-extrabold text-foreground tracking-tight leading-snug">
                {book.title}
              </h4>
              <p className="text-xs text-muted-foreground italic mt-0.5">by {book.author}</p>
            </div>
            <Badge variant={book.status === "Completed" ? "success" : book.status === "Reading" ? "info" : "warning"}>
              {book.status}
            </Badge>
          </div>

          {book.currentProgress && (
            <div className="pt-2 border-t border-border/30 flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                  Latest Registered Position
                </span>
                <p className="text-xs font-bold text-foreground break-words leading-snug">
                  {book.currentProgress}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form to Log New Progress */}
        <form onSubmit={handleAddProgress} className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/30 pb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-primary" /> Log New Progress
            </h4>
            <span className="text-xs font-semibold text-muted-foreground">
              Updates active reading position
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="progressInput" className="text-xs font-bold text-muted-foreground">
                Progress / Pages Read *
              </label>
              <input
                id="progressInput"
                type="text"
                required
                value={progressInput}
                onChange={(e) => setProgressInput(e.target.value)}
                placeholder="e.g. Hal. 150 or Bab 4"
                className="w-full rounded-xl border border-border/80 bg-background/60 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="notesInput" className="text-xs font-bold text-muted-foreground">
                Session Note (Optional)
              </label>
              <input
                id="notesInput"
                type="text"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Key takeaways or reflections..."
                className="w-full rounded-xl border border-border/80 bg-background/60 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-destructive flex items-center gap-1 font-semibold">
              <AlertCircle className="h-3.5 w-3.5" />
              {errorMsg}
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={addProgressMutation.isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {addProgressMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" /> Save Progress Entry
                </>
              )}
            </button>
          </div>
        </form>

        {/* Progress History Timeline */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> Progress Timeline & History
            </h4>
            <span className="text-xs font-bold text-foreground bg-secondary/80 px-2.5 py-1 rounded-full border border-border/40">
              {logs.length} {logs.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center text-xs text-destructive font-semibold">
              Error loading progress logs.
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 py-8 px-4 text-center space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                No timeline logs recorded yet.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Log your reading updates using the form above to build your timeline!
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-primary/20 ml-3 pl-4 space-y-3 max-h-[260px] overflow-y-auto pr-1 py-1">
              {logs.map((log) => (
                <div key={log.id} className="relative group">
                  {/* Timeline bullet node */}
                  <span className="absolute -left-[23px] top-2.5 h-3 w-3 rounded-full bg-primary/20 border-2 border-primary group-hover:scale-125 transition-transform" />

                  <div className="rounded-xl border border-border/50 bg-card/40 hover:bg-card/75 p-3 shadow-sm hover:border-primary/30 transition-all flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-block rounded-md bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-extrabold text-primary">
                          {log.progress}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {formatDate(log.createdAt)}
                        </span>
                      </div>

                      {log.notes && (
                        <p className="text-xs text-foreground/90 leading-snug flex items-start gap-1.5 pt-0.5">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="break-words">{log.notes}</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      disabled={deleteProgressMutation.isPending}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all shrink-0 cursor-pointer"
                      title="Delete log entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
