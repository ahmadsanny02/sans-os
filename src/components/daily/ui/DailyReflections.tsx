"use client"

import React from "react"
import { BookOpen, Heart, FileText, Save, Loader2 } from "lucide-react"

type TabType = "journal" | "gratitude" | "notes"

interface DailyReflectionsProps {
  isLoading: boolean
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  journal: string
  setJournal: (s: string) => void
  notes: string
  setNotes: (s: string) => void
  gratitude: string
  setGratitude: (s: string) => void
  handleSave: () => Promise<void>
  isPendingSave: boolean
}

export function DailyReflections({
  isLoading,
  activeTab,
  setActiveTab,
  journal,
  setJournal,
  notes,
  setNotes,
  gratitude,
  setGratitude,
  handleSave,
  isPendingSave,
}: DailyReflectionsProps) {
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
          disabled={isLoading || isPendingSave}
          className="inline-flex items-center gap-2 rounded-xl bg-sidebar-primary px-4 py-2 text-sm font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/95 disabled:opacity-50 active:scale-95 animate-in"
        >
          {isPendingSave ? (
            <Loader2 className="h-4 w-4 animate-spin" />
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
          <div className="flex-1 space-y-2.5 pt-1 animate-pulse">
            <div className="h-4 w-full bg-muted/20 rounded-md" />
            <div className="h-4 w-5/6 bg-muted/20 rounded-md" />
            <div className="h-4 w-3/4 bg-muted/20 rounded-md" />
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
