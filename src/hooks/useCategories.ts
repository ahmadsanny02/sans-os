"use client"

import { useState } from "react"

export interface CategoryItem {
  id: string
  name: string
  module: "habits" | "timetable" | "learning" | "projects" | "general"
  color: string
  description?: string
  isSystemDefault?: boolean
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  // General / Universal (The only preset allowed)
  { id: "default_general", name: "General", module: "general", color: "primary", description: "General or unclassified tasks", isSystemDefault: true },
]

const STORAGE_KEY = "sansos_custom_categories_v1"

export function useCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    if (typeof window === "undefined") return DEFAULT_CATEGORIES
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as CategoryItem[]
        // Filter out all system default presets except "General"
        const filtered = parsed.filter(
          (c) => !c.isSystemDefault || c.name.toLowerCase() === "general"
        )
        const hasGeneral = filtered.some((c) => c.name.toLowerCase() === "general")
        if (!hasGeneral) {
          const generalItem: CategoryItem = {
            id: "default_general",
            name: "General",
            module: "general",
            color: "primary",
            description: "General or unclassified tasks",
            isSystemDefault: true
          }
          filtered.unshift(generalItem)
        }
        if (parsed.length !== filtered.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
        }
        return filtered
      }
      return DEFAULT_CATEGORIES
    } catch (e) {
      console.error("Failed to load categories from localStorage:", e)
      return DEFAULT_CATEGORIES
    }
  })
  const [isLoaded] = useState(true)

  const saveCategories = (items: CategoryItem[]) => {
    setCategories(items)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.error("Failed to save categories to localStorage:", e)
    }
  }

  const addCategory = (newItem: Omit<CategoryItem, "id" | "isSystemDefault">) => {
    const created: CategoryItem = {
      ...newItem,
      id: "cat_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      isSystemDefault: false,
    }
    const updated = [...categories, created]
    saveCategories(updated)
    return created
  }

  const updateCategory = async (id: string, patch: Partial<Omit<CategoryItem, "id" | "isSystemDefault">>) => {
    const oldCategory = categories.find((cat) => cat.id === id)
    const updated = categories.map((cat) => (cat.id === id ? { ...cat, ...patch } : cat))
    saveCategories(updated)

    if (oldCategory && patch.name && patch.name !== oldCategory.name) {
      try {
        await fetch("/api/categories/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "rename",
            oldName: oldCategory.name,
            newName: patch.name,
          }),
        })
      } catch (err) {
        console.error("Failed to sync category rename to DB:", err)
      }
    }
  }

  const deleteCategory = async (id: string) => {
    const targetCategory = categories.find((cat) => cat.id === id)
    const updated = categories.filter((cat) => cat.id !== id || cat.isSystemDefault)
    saveCategories(updated)

    if (targetCategory) {
      try {
        await fetch("/api/categories/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "delete",
            oldName: targetCategory.name,
          }),
        })
      } catch (err) {
        console.error("Failed to sync category delete to DB:", err)
      }
    }
  }

  const resetToDefault = () => {
    saveCategories(DEFAULT_CATEGORIES)
  }

  return {
    categories,
    isLoaded,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefault,
  }
}
