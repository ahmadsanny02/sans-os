"use client"

import React, { useEffect } from "react"
import { ProjectBoard } from "@/components/projects/ProjectBoard"
import { Briefcase } from "lucide-react"

export default function ProjectsPage() {
  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Projects & Tasks - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4">
      {/* Date Navigation Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-violet-500 shrink-0" />
            Projects & Tasks
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your high-level goals and track deliverables
          </p>
        </div>
      </div>

      {/* Main Grid Content */}
      <ProjectBoard />
    </div>
  )
}
