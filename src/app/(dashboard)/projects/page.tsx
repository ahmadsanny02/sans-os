"use client"

import React, { useEffect } from "react"
import { ProjectBoard } from "@/components/projects/ProjectBoard"
import { Briefcase } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function ProjectsPage() {
  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Projects & Tasks - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4">
      <HeaderPage
        title="Projects & Tasks"
        icon={<Briefcase className="h-7 w-7 text-violet-500 shrink-0" />}
        description="Manage your high-level goals and track deliverables"
      />

      {/* Main Grid Content */}
      <ProjectBoard />
    </div>
  )
}

