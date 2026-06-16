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
import {
  Plus,
  Trash2,
  Loader2,
  Search,
  Trophy,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Circle,
  Edit2,
  Compass,
  Heart,
} from "lucide-react"

// PRESET BEAUTIFUL IMAGES FOR CONVENIENCE
const BUCKET_PRESETS = [
  { name: "Mount Fuji", url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80" },
  { name: "Aurora Borealis", url: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=600&auto=format&fit=crop&q=80" },
  { name: "Paris Adventure", url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80" },
  { name: "Tropical Beach", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80" },
  { name: "Deep Ocean Dive", url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80" },
]

export function BucketListBoard() {
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
    } catch {
      setEditError("Failed to update bucket list item.")
    }
  }

  const handleDeleteItem = async (id: string, titleStr: string): Promise<void> => {
    if (!confirm(`Are you sure you want to delete "${titleStr}"?`)) return
    try {
      await deleteItemMutation.mutateAsync(id)
    } catch {
      alert("Failed to delete item.")
    }
  }

  const handleToggleCompleted = async (item: BucketItem): Promise<void> => {
    // Optimistic cache update for instant UI feedback
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
    } catch {
      // Revert if mutation fails
      queryClient.invalidateQueries({ queryKey: ["bucket-list"] })
      alert("Failed to toggle completion status.")
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
        <span>Error loading bucket list items. Please check database.</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Statistics / Progress Card */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Metric 1: Total */}
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Dreams</span>
            <h4 className="text-3xl font-black text-foreground">{totalCount}</h4>
          </div>
          <div className="rounded-xl bg-violet-500/10 p-3 text-violet-500">
            <Compass className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2: Completed */}
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Achieved Goals</span>
            <h4 className="text-3xl font-black text-foreground flex items-baseline gap-2">
              {completedCount}
              <span className="text-xs text-muted-foreground font-semibold">/ {totalCount} achieved</span>
            </h4>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
            <Trophy className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 3: Completion Rate */}
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex flex-col justify-center gap-2.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Completion Progress</span>
            <span className="text-sm font-extrabold text-foreground">{completionRate}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              style={{ width: `${completionRate}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Controls Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-5">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bucket goals..."
            className="w-full rounded-xl border border-border bg-card/60 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
          />
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-sidebar-primary px-3.5 py-2 text-xs font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/90 hover:scale-[1.02] self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? "Cancel Add" : "Add Bucket Goal"}
        </button>
      </div>

      {/* 3. Add Goal Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddItem}
          className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm backdrop-blur-md space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
            <Sparkles className="h-4.5 w-4.5 text-violet-500" /> Log a New Life Goal
          </h4>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="addGoalTitle" className="text-xs font-bold text-muted-foreground">
                What is your dream? *
              </label>
              <input
                id="addGoalTitle"
                type="text"
                required
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                placeholder="e.g. Scuba Dive in Great Barrier Reef"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-sidebar-primary"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <label htmlFor="addGoalImg" className="text-xs font-bold text-muted-foreground">
                Inspirational Photo Image URL
              </label>
              <input
                id="addGoalImg"
                type="text"
                value={addImageUrl}
                onChange={(e) => setAddImageUrl(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/photo-..."
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-sidebar-primary"
              />
            </div>
          </div>

          {/* Presets template */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-violet-500" /> Or pick a preset dream location
            </span>
            <div className="flex flex-wrap gap-2">
              {BUCKET_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setAddImageUrl(preset.url)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all ${
                    addImageUrl === preset.url
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                      : "border-border text-muted-foreground hover:bg-secondary/40"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

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
              disabled={createItemMutation.isPending}
              className="rounded-lg bg-sidebar-primary px-3.5 py-1.5 text-xs font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary/95 flex items-center gap-1"
            >
              {createItemMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Save Dream"
              )}
            </button>
          </div>
        </form>
      )}

      {/* 4. Filter Tabs */}
      <div className="overflow-x-auto pb-2 border-b border-border/30">
        <div className="flex gap-2 min-w-max">
          {["All", "Active", "Achieved"].map((filter) => {
            const isActive = selectedFilter === filter
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary shadow-sm"
                    : "bg-secondary/20 hover:bg-secondary/50 border-border text-muted-foreground"
                }`}
              >
                {filter} {filter === "Active" ? `(${activeCount})` : filter === "Achieved" ? `(${completedCount})` : `(${totalCount})`}
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. Cover Visual Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground bg-card/10 select-none">
          No dreams found matching filters. Let&apos;s start adding some goals!
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            return (
              <div
                key={item.id}
                className="group relative h-64 rounded-2xl border border-border/60 overflow-hidden shadow-md flex flex-col justify-end p-5 select-none bg-black"
              >
                {/* Visual Cover Photo */}
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                      item.completed ? "opacity-35 grayscale" : "opacity-60"
                    }`}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 to-slate-900 w-full h-full transition-opacity duration-500 group-hover:opacity-85" />
                )}

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 pointer-events-none" />

                {/* Card Header overlay elements */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-black/60 border border-white/20 text-white hover:bg-black/80 transition-all active:scale-95"
                    title="Edit Item"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.title)}
                    className="p-1.5 rounded-lg bg-black/60 border border-white/20 text-rose-400 hover:bg-rose-500/30 transition-all active:scale-95"
                    title="Delete Item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Content section */}
                <div className="relative z-20 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleCompleted(item)}
                      className="text-white hover:scale-105 transition-transform shrink-0"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-400 fill-emerald-950/80" />
                      ) : (
                        <Circle className="h-6 w-6 text-white/70 hover:text-white" />
                      )}
                    </button>

                    <h4
                      className={`text-lg font-black tracking-tight text-white leading-tight ${
                        item.completed ? "line-through text-white/50" : ""
                      }`}
                    >
                      {item.title}
                    </h4>
                  </div>

                  {/* Completion Date Stamp */}
                  {item.completed && item.completedAt && (
                    <div className="flex items-center gap-1 pl-8 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                      <Trophy className="h-3 w-3 shrink-0" />
                      Achieved: {formatDate(item.completedAt)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 6. Edit Dream Modal Dialog */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl backdrop-blur-md space-y-4 animate-in zoom-in-95 duration-200">
          
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/40 py-2">
              <Compass className="h-5 w-5 text-violet-500" />
              Edit Bucket List Goal
            </h3>

            <form onSubmit={handleUpdateItem} className="space-y-4 pt-1">
              <div className="space-y-3">
                {/* Title */}
                <div className="space-y-1.5">
                  <label htmlFor="editGoalTitle" className="text-xs font-bold text-muted-foreground">What is your dream? *</label>
                  <input
                    id="editGoalTitle"
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-sidebar-primary"
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-1.5">
                  <label htmlFor="editGoalImg" className="text-xs font-bold text-muted-foreground">Image URL</label>
                  <input
                    id="editGoalImg"
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-sidebar-primary"
                  />
                </div>

                {/* Completion */}
                <div className="flex items-center gap-2 pt-2 select-none">
                  <input
                    id="editGoalCompleted"
                    type="checkbox"
                    checked={editCompleted}
                    onChange={(e) => setEditCompleted(e.target.checked)}
                    className="rounded border-border text-sidebar-primary outline-none focus:ring-sidebar-primary h-4 w-4 shrink-0"
                  />
                  <label htmlFor="editGoalCompleted" className="text-sm font-bold text-muted-foreground">Mark as Achieved</label>
                </div>
              </div>

              {editError && (
                <p className="text-xs text-destructive flex items-center gap-1 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {editError}
                </p>
              )}

              <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateItemMutation.isPending}
                  className="rounded-lg bg-sidebar-primary px-4 py-1.5 text-xs font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary/95 flex items-center gap-1"
                >
                  {updateItemMutation.isPending ? (
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
