"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Settings, Tag, Timer } from "lucide-react"
import { CategoryManagementView } from "./ui/CategoryManagementView"
import { PomodoroConfigView } from "@/components/pomodoro/ui/PomodoroConfigView"
import { usePomodoroPage } from "@/hooks/usePomodoroPage"

export function SettingsComponent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab")

  const [activeTab, setActiveTab] = useState<"category" | "pomodoro">(
    tabParam === "pomodoro" ? "pomodoro" : "category"
  )

  const pomodoroPageData = usePomodoroPage()

  useEffect(() => {
    document.title = "Settings — SansOS Workspace"
  }, [])

  useEffect(() => {
    if (tabParam === "pomodoro" || tabParam === "category") {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (tab: "category" | "pomodoro") => {
    setActiveTab(tab)
    router.push(`/settings?tab=${tab}`)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 p-8 shadow-sm">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Settings className="h-3.5 w-3.5" /> Workspace Settings
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">System & Preferences</h1>
          <p className="text-sm text-muted-foreground">
            Manage your custom module categories, Pomodoro timer durations, and notification sounds.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bento-card p-2 flex items-center gap-2 max-w-fit">
        <button
          onClick={() => handleTabChange("category")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "category"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Tag className="h-4 w-4" />
          Category Management
        </button>

        <button
          onClick={() => handleTabChange("pomodoro")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "pomodoro"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Timer className="h-4 w-4" />
          Pomodoro Configuration
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "category" ? (
          <CategoryManagementView />
        ) : (
          <PomodoroConfigView {...pomodoroPageData} />
        )}
      </div>
    </div>
  )
}
