"use client"

import React, { useState, useEffect } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useDailyLogQuery, useSaveDailyLogMutation } from "@/hooks/useDailyLogs"
import { BookOpen, Heart, FileText, Save, Loader2, Check } from "lucide-react"

type TabType = "journal" | "gratitude" | "notes"

export function DailyReflections() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)

  const { data: log, isLoading } = useDailyLogQuery(activeDate)
  const saveLogMutation = useSaveDailyLogMutation()

  const [activeTab, setActiveTab] = useState<TabType>("journal")
  const [journal, setJournal] = useState("")
  const [notes, setNotes] = useState("")
  const [gratitude, setGratitude] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Sync with fetched daily logs
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJournal(log?.journal || "")
    setNotes(log?.notes || "")
    setGratitude(log?.gratitude || "")
  }, [log])

  const handleSave = async (): Promise<void> => {
    try {
      await saveLogMutation.mutateAsync({
        date: activeDate,
        journal,
        notes,
        gratitude,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error("Failed to save reflections", err)
    }
  }

  const tabs = [
    { id: "journal" as TabType, label: "My Journal", icon: BookOpen, color: "text-blue-500" },
    { id: "gratitude" as TabType, label: "Daily Gratitude", icon: Heart, color: "text-rose-500" },
    { id: "notes" as TabType, label: "Daily Notes", icon: FileText, color: "text-amber-500" },
  ]

  return (
    <div className="space-y-4">
      {/* Header & Saving State */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Daily Reflections
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Capture thoughts, gratitude, and notes for today
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading || saveLogMutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-sidebar-primary px-4 py-2 text-sm font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/95 disabled:opacity-50 active:scale-95"
        >
          {saveLogMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4 stroke-[3]" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Reflections
            </>
          )}
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex rounded-xl bg-secondary/30 p-1 border border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? "bg-card text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? tab.color : "text-muted-foreground"}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content area */}
      <div className="rounded-2xl border border-border bg-card p-4 min-h-[180px] flex flex-col justify-stretch relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card/40 rounded-2xl">
            <Loader2 className="h-6 w-6 animate-spin text-sidebar-primary" />
          </div>
        ) : (
          <>
            {activeTab === "journal" && (
              <div className="flex-1 flex flex-col">
                <label htmlFor="journal-input" className="sr-only">My Journal</label>
                <textarea
                  id="journal-input"
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  placeholder="Write about your day: what went well, what challenges you faced, and any reflections..."
                  className="flex-1 w-full bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60 leading-relaxed min-h-[150px]"
                />
              </div>
            )}

            {activeTab === "gratitude" && (
              <div className="flex-1 flex flex-col">
                <label htmlFor="gratitude-input" className="sr-only">Daily Gratitude</label>
                <textarea
                  id="gratitude-input"
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="What are 3 things you are grateful for today? Cultivate a positive mindset..."
                  className="flex-1 w-full bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60 leading-relaxed min-h-[150px]"
                />
              </div>
            )}

            {activeTab === "notes" && (
              <div className="flex-1 flex flex-col">
                <label htmlFor="notes-input" className="sr-only">Daily Notes</label>
                <textarea
                  id="notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Capture quick scratchpad notes, tasks, ideas, links, or lists..."
                  className="flex-1 w-full bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60 leading-relaxed min-h-[150px]"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
