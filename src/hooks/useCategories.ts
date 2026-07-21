"use client"

import { useState, useEffect } from "react"

export interface CategoryItem {
  id: string
  name: string
  module: "habits" | "timetable" | "learning" | "projects" | "general"
  color: string
  description?: string
  isSystemDefault?: boolean
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "1", name: "Health & Fitness", module: "habits", color: "emerald", description: "Habits for physical & mental health", isSystemDefault: true },
  { id: "2", name: "Deep Work", module: "timetable", color: "blue", description: "High focus coding & engineering blocks", isSystemDefault: true },
  { id: "3", name: "Software Development", module: "projects", color: "violet", description: "Fullstack web app development", isSystemDefault: true },
  { id: "4", name: "Computer Science", module: "learning", color: "amber", description: "Algorithms, system design, and AI", isSystemDefault: true },
  { id: "5", name: "Mindset & Reading", module: "habits", color: "rose", description: "Daily reading and mindfulness", isSystemDefault: true },
  { id: "6", name: "Leisure & Rest", module: "timetable", color: "cyan", description: "Breaks, social, and hobbies", isSystemDefault: true },
]

const STORAGE_KEY = "sansos_custom_categories_v1"

export function useCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setCategories(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Failed to load categories from localStorage:", e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

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

  const updateCategory = (id: string, patch: Partial<Omit<CategoryItem, "id" | "isSystemDefault">>) => {
    const updated = categories.map((cat) => (cat.id === id ? { ...cat, ...patch } : cat))
    saveCategories(updated)
  }

  const deleteCategory = (id: string) => {
    const updated = categories.filter((cat) => cat.id !== id || cat.isSystemDefault)
    saveCategories(updated)
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
