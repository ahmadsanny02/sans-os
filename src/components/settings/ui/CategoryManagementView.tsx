"use client"

import React, { useState } from "react"
import {
  Tag,
  Plus,
  Folder,
  CheckSquare,
  Clock,
  GraduationCap,
  Briefcase,
  Trash2,
  Edit2,
  RotateCcw,
  Sparkles,
  Layers,
} from "lucide-react"
import { useCategories, CategoryItem } from "@/hooks/useCategories"
import { confirmDestructive, showSuccessToast } from "@/lib/sweetalert"

const MODULE_OPTIONS = [
  { value: "all", label: "All Modules", icon: Layers },
  { value: "habits", label: "Habits", icon: CheckSquare },
  { value: "timetable", label: "Daily Flow", icon: Clock },
  { value: "learning", label: "Learning", icon: GraduationCap },
  { value: "projects", label: "Projects", icon: Briefcase },
]

const COLOR_OPTIONS = [
  { value: "primary", label: "Primary Indigo", badgeBg: "bg-primary/10 text-primary border-primary/20" },
  { value: "emerald", label: "Emerald Green", badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { value: "blue", label: "Sky Blue", badgeBg: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "violet", label: "Violet Purple", badgeBg: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  { value: "rose", label: "Rose Pink", badgeBg: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  { value: "amber", label: "Amber Orange", badgeBg: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { value: "cyan", label: "Cyan Teal", badgeBg: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
]

function getBadgeStyle(color: string) {
  const match = COLOR_OPTIONS.find((c) => c.value === color)
  return match ? match.badgeBg : "bg-primary/10 text-primary border-primary/20"
}

export function CategoryManagementView() {
  const { categories, addCategory, updateCategory, deleteCategory, resetToDefault } = useCategories()
  const [selectedModule, setSelectedModule] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [module, setModule] = useState<CategoryItem["module"]>("habits")
  const [color, setColor] = useState("primary")
  const [description, setDescription] = useState("")

  const filteredCategories = categories.filter((cat) => {
    if (selectedModule === "all") return true
    return cat.module === selectedModule
  })

  const handleOpenAddModal = () => {
    setEditingId(null)
    setName("")
    setModule("habits")
    setColor("primary")
    setDescription("")
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingId(cat.id)
    setName(cat.name)
    setModule(cat.module)
    setColor(cat.color)
    setDescription(cat.description || "")
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (editingId) {
      updateCategory(editingId, { name, module, color, description })
      showSuccessToast("Category updated")
    } else {
      addCategory({ name, module, color, description })
      showSuccessToast("Category created")
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id: string, catName: string) => {
    const confirmed = await confirmDestructive("Delete Category", `Are you sure you want to delete "${catName}"?`)
    if (confirmed) {
      deleteCategory(id)
      showSuccessToast("Category deleted")
    }
  }

  const handleReset = async () => {
    const confirmed = await confirmDestructive("Reset Categories", "Reset all categories back to system defaults?")
    if (confirmed) {
      resetToDefault()
      showSuccessToast("Categories reset to default")
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bento-card p-5 space-y-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Categories</span>
          <div className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            {categories.length}
          </div>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Custom Created</span>
          <div className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            {categories.filter((c) => !c.isSystemDefault).length}
          </div>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">System Presets</span>
          <div className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Folder className="h-5 w-5 text-cyan-500" />
            {categories.filter((c) => c.isSystemDefault).length}
          </div>
        </div>
      </div>

      {/* Action Bar & Module Filter */}
      <div className="bento-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Module Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {MODULE_OPTIONS.map((mod) => {
            const Icon = mod.icon
            const isActive = selectedModule === mod.value
            return (
              <button
                key={mod.value}
                onClick={() => setSelectedModule(mod.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {mod.label}
              </button>
            )
          })}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-secondary/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all cursor-pointer"
            title="Reset to defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/95 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            New Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((cat) => {
          const badgeClass = getBadgeStyle(cat.color)
          return (
            <div key={cat.id} className="bento-card p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                    <Tag className="h-3 w-3" />
                    {cat.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-secondary/80 px-2 py-0.5 rounded-md">
                    {cat.module}
                  </span>
                </div>
                {cat.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {cat.isSystemDefault ? "System Default" : "Custom User Category"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                    title="Edit category"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {!cat.isSystemDefault && (
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filteredCategories.length === 0 && (
          <div className="col-span-full bento-card p-12 text-center space-y-3">
            <Tag className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
            <p className="text-sm font-bold text-foreground">No Categories Found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No categories exist under the selected module filter. Click "New Category" to create one.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bento-card w-full max-w-md p-6 space-y-5 shadow-2xl border-border/80 bg-card">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                {editingId ? "Edit Category" : "New Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Health, Deep Work, AI Learning"
                  className="w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-xs text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">Target Module</label>
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value as CategoryItem["module"])}
                  className="w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-xs text-foreground focus:border-primary outline-none transition-colors cursor-pointer"
                >
                  <option value="habits">Habits</option>
                  <option value="timetable">Daily Flow / Timetable</option>
                  <option value="learning">Learning Hub</option>
                  <option value="projects">Projects</option>
                  <option value="general">General / Universal</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">Color Badge Style</label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-xs text-foreground focus:border-primary outline-none transition-colors cursor-pointer"
                >
                  {COLOR_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief explanation of what belongs in this category..."
                  className="w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-xs text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border/60 bg-secondary/30 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
