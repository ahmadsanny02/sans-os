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
  Check,
  X,
} from "lucide-react"
import { useCategories, CategoryItem } from "@/hooks/useCategories"
import { confirmDestructive, showSuccessToast } from "@/lib/sweetalert"
import { CustomSelect } from "@/components/ui/CustomSelect"
import { CATEGORY_COLOR_MAP, isCategoryInModule } from "@/lib/categoryUtils"
import Swal from "sweetalert2"

const MODULE_OPTIONS = [
  { value: "all", label: "All Modules", icon: Layers },
  { value: "habits", label: "Habits", icon: CheckSquare },
  { value: "timetable", label: "Daily Flow", icon: Clock },
  { value: "learning", label: "Learning", icon: GraduationCap },
  { value: "projects", label: "Projects", icon: Briefcase },
]

const COLOR_OPTIONS = [
  { value: "primary", label: "Primary Indigo", badgeBg: "bg-primary/10 text-primary border-primary/20", dotClass: "bg-primary" },
  { value: "emerald", label: "Emerald Green", badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", dotClass: "bg-emerald-500" },
  { value: "blue", label: "Sky Blue", badgeBg: "bg-blue-500/10 text-blue-500 border-blue-500/20", dotClass: "bg-blue-500" },
  { value: "violet", label: "Violet Purple", badgeBg: "bg-violet-500/10 text-violet-500 border-violet-500/20", dotClass: "bg-violet-500" },
  { value: "rose", label: "Rose Pink", badgeBg: "bg-rose-500/10 text-rose-500 border-rose-500/20", dotClass: "bg-rose-500" },
  { value: "amber", label: "Amber Orange", badgeBg: "bg-amber-500/10 text-amber-500 border-amber-500/20", dotClass: "bg-amber-500" },
  { value: "cyan", label: "Cyan Teal", badgeBg: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20", dotClass: "bg-cyan-500" },
  { value: "orange", label: "Orange", badgeBg: "bg-orange-500/10 text-orange-500 border-orange-500/20", dotClass: "bg-orange-500" },
  { value: "pink", label: "Pink", badgeBg: "bg-pink-500/10 text-pink-500 border-pink-500/20", dotClass: "bg-pink-500" },
  { value: "teal", label: "Teal", badgeBg: "bg-teal-500/10 text-teal-500 border-teal-500/20", dotClass: "bg-teal-500" },
  { value: "fuchsia", label: "Fuchsia", badgeBg: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20", dotClass: "bg-fuchsia-500" },
  { value: "slate", label: "Slate", badgeBg: "bg-slate-500/10 text-slate-500 border-slate-500/20", dotClass: "bg-slate-500" },
]

function getBadgeStyle(color: string) {
  const match = CATEGORY_COLOR_MAP[color]
  return match ? match.badgeBg : CATEGORY_COLOR_MAP.primary.badgeBg
}

export function CategoryManagementView() {
  const {
    categories,
    subCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    resetToDefault,
  } = useCategories()
  const [selectedModule, setSelectedModule] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [selectedTargetModules, setSelectedTargetModules] = useState<string[]>(["habits"])
  const [color, setColor] = useState("primary")
  const [description, setDescription] = useState("")

  // Sub-category inline state
  const [addingSubCategoryId, setAddingSubCategoryId] = useState<string | null>(null)
  const [newSubName, setNewSubName] = useState("")
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [editSubName, setEditSubName] = useState("")

  const filteredCategories = categories.filter((cat) => {
    if (cat.isSystemDefault) return false
    return isCategoryInModule(cat.module, selectedModule)
  })

  const handleOpenAddModal = () => {
    setEditingId(null)
    setName("")
    setSelectedTargetModules(["habits"])
    setColor("primary")
    setDescription("")
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingId(cat.id)
    setName(cat.name)
    setSelectedTargetModules(cat.module ? cat.module.split(",").map((m) => m.trim()) : ["general"])
    setColor(cat.color)
    setDescription(cat.description || "")
    setIsModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const moduleValue = selectedTargetModules.length > 0 ? selectedTargetModules.join(",") : "general"

    if (editingId) {
      updateCategory(editingId, { name, module: moduleValue, color, description })
      showSuccessToast("Category updated")
    } else {
      addCategory({ name, module: moduleValue, color, description })
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

  const handleCreateSub = async (categoryId: string) => {
    const { value: name } = await Swal.fire({
      title: "Add Sub-category",
      input: "text",
      inputPlaceholder: "Enter sub-category name...",
      showCancelButton: true,
      confirmButtonText: "Create",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "Name is required!"
        }
      }
    })
    if (name) {
      addSubCategory(categoryId, name)
      showSuccessToast("Sub-category created")
    }
  }

  const handleEditSub = async (id: string, currentName: string) => {
    const { value: name } = await Swal.fire({
      title: "Edit Sub-category",
      input: "text",
      inputValue: currentName,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "Name is required!"
        }
      }
    })
    if (name && name !== currentName) {
      updateSubCategory(id, name)
      showSuccessToast("Sub-category updated")
    }
  }

  const handleDeleteSub = async (id: string, name: string) => {
    const confirmed = await confirmDestructive("Delete Sub-category", `Are you sure you want to delete "${name}"?`)
    if (confirmed) {
      deleteSubCategory(id)
      showSuccessToast("Sub-category deleted")
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bento-card p-5 space-y-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Categories</span>
          <div className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            {categories.filter((c) => !c.isSystemDefault).length}
          </div>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Modules</span>
          <div className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Folder className="h-5 w-5 text-emerald-500" />
            {new Set(categories.filter((c) => !c.isSystemDefault).map((c) => c.module)).size}
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
            <div key={cat.id} className="bento-card p-5 space-y-3 flex flex-col justify-between hover:border-primary/20 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                    <Tag className="h-3 w-3" />
                    {cat.name}
                  </span>
                </div>
                {cat.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              {/* Sub-categories List */}
              <div className="space-y-2 border-t border-border/40 pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sub-categories</span>
                  <button
                    onClick={() => {
                      setAddingSubCategoryId(addingSubCategoryId === cat.id ? null : cat.id)
                      setNewSubName("")
                    }}
                    className="p-1 rounded-md hover:bg-secondary text-primary hover:text-primary/80 transition-all cursor-pointer"
                    title="Add sub-category"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {addingSubCategoryId === cat.id && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!newSubName.trim()) return
                      addSubCategory(cat.id, newSubName.trim())
                      showSuccessToast("Sub-category created")
                      setAddingSubCategoryId(null)
                      setNewSubName("")
                    }}
                    className="flex items-center gap-1.5 animate-in fade-in duration-150 py-1"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      placeholder="Sub-category name..."
                      className="flex-1 rounded-xl border border-border/80 bg-background px-3 py-1 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground"
                    />
                    <button
                      type="submit"
                      disabled={!newSubName.trim()}
                      className="p-1.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 transition-colors cursor-pointer"
                      title="Save"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingSubCategoryId(null)
                        setNewSubName("")
                      }}
                      className="p-1.5 rounded-xl text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}

                {subCategories.filter((sc) => sc.categoryId === cat.id).length === 0 && addingSubCategoryId !== cat.id ? (
                  <p className="text-[10px] text-muted-foreground italic pl-0.5">No sub-categories</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {subCategories
                      .filter((sc) => sc.categoryId === cat.id)
                      .map((sc) => {
                        if (editingSubId === sc.id) {
                          return (
                            <form
                              key={sc.id}
                              onSubmit={(e) => {
                                e.preventDefault()
                                if (!editSubName.trim() || editSubName.trim() === sc.name) {
                                  setEditingSubId(null)
                                  return
                                }
                                updateSubCategory(sc.id, editSubName.trim())
                                showSuccessToast("Sub-category updated")
                                setEditingSubId(null)
                              }}
                              className="flex items-center gap-1 animate-in fade-in duration-150"
                            >
                              <input
                                type="text"
                                autoFocus
                                value={editSubName}
                                onChange={(e) => setEditSubName(e.target.value)}
                                className="w-28 rounded-lg border border-border/80 bg-background px-2 py-0.5 text-xs outline-none focus:border-primary text-foreground"
                              />
                              <button
                                type="submit"
                                className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded cursor-pointer"
                              >
                                <Check className="h-3 w-3 stroke-[3]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSubId(null)}
                                className="p-1 text-muted-foreground hover:bg-secondary rounded cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </form>
                          )
                        }

                        return (
                          <div
                            key={sc.id}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${badgeClass} group/sub`}
                          >
                            <span>{sc.name}</span>
                            <button
                              onClick={() => {
                                setEditingSubId(sc.id)
                                setEditSubName(sc.name)
                              }}
                              className="opacity-0 group-hover/sub:opacity-100 transition-opacity hover:text-foreground cursor-pointer"
                            >
                              <Edit2 className="h-2.5 w-2.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSub(sc.id, sc.name)}
                              className="opacity-0 group-hover/sub:opacity-100 transition-opacity hover:text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex flex-wrap gap-1">
                  {(cat.module || "general").split(",").map((m) => {
                    const modName = m.trim()
                    const labelMap: Record<string, string> = {
                      timetable: "Daily Flow",
                      habits: "Habits",
                      learning: "Learning",
                      projects: "Projects",
                      general: "General",
                    }
                    return (
                      <span key={modName} className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider bg-secondary/60 dark:bg-card/60 px-2 py-0.5 rounded-md border border-border/40">
                        {labelMap[modName] || modName}
                      </span>
                    )
                  })}
                </div>

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
              No categories exist under the selected module filter. Click &quot;New Category&quot; to create one.
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

              {/* Target Modules Checklist */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground">Target Modules (Check all that apply)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-secondary/20 dark:bg-card/30 border border-border/60 p-3 rounded-2xl">
                  {[
                    { id: "timetable", label: "Daily Flow / Timetable", icon: Clock },
                    { id: "habits", label: "Habits", icon: CheckSquare },
                    { id: "learning", label: "Learning Hub", icon: GraduationCap },
                    { id: "projects", label: "Projects", icon: Briefcase },
                  ].map((item) => {
                    const isChecked = selectedTargetModules.includes(item.id)
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          let updated = isChecked
                            ? selectedTargetModules.filter((m) => m !== item.id)
                            : [...selectedTargetModules.filter((m) => m !== "general"), item.id]
                          if (updated.length === 0) updated = ["general"]
                          setSelectedTargetModules(updated)
                        }}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          isChecked
                            ? "bg-primary/15 border-primary/40 text-primary shadow-xs"
                            : "bg-background/50 dark:bg-background/30 border-border/60 text-muted-foreground hover:bg-card hover:text-foreground"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                          isChecked ? "bg-primary border-primary text-primary-foreground" : "border-border/80 bg-background/80"
                        }`}>
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}

                  {/* General / Universal spanning col-span-2 */}
                  {(() => {
                    const isGeneralChecked = selectedTargetModules.includes("general")
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          if (isGeneralChecked) {
                            setSelectedTargetModules(["habits"])
                          } else {
                            setSelectedTargetModules(["general"])
                          }
                        }}
                        className={`sm:col-span-2 flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          isGeneralChecked
                            ? "bg-primary/15 border-primary/40 text-primary shadow-xs"
                            : "bg-background/50 dark:bg-background/30 border-border/60 text-muted-foreground hover:bg-card hover:text-foreground"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                          isGeneralChecked ? "bg-primary border-primary text-primary-foreground" : "border-border/80 bg-background/80"
                        }`}>
                          {isGeneralChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <Layers className="h-4 w-4 shrink-0" />
                        <span>General / Universal (Applies to all modules)</span>
                      </button>
                    )
                  })()}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground">Color Badge Style</label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map((c) => {
                    const isSelected = color === c.value
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${c.dotClass} ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/40 scale-110 shadow-sm"
                            : "border-border/60 hover:border-muted-foreground/45 hover:scale-105"
                        }`}
                        title={c.label}
                      >
                        {isSelected && (
                          <Check className="h-4 w-4 text-white drop-shadow-sm animate-in zoom-in duration-200" />
                        )}
                      </button>
                    )
                  })}
                </div>
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
