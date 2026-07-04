"use client"

import React, { useEffect } from "react"
import { useProjectsPage } from "@/hooks/useProjectsPage"
import { ProjectBoardView } from "./ui/ProjectBoardView"
import { Briefcase } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function ProjectsComponent() {
  const projectsData = useProjectsPage()

  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Projects & Tasks - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl gap-6 flex flex-col py-4 animate-in fade-in duration-200">
      <HeaderPage
        title="Projects & Tasks"
        icon={<Briefcase className="h-7 w-7 text-primary shrink-0" />}
        description="Manage your high-level goals and track deliverables"
      />

      {/* Main Grid Content */}
      <ProjectBoardView {...projectsData} />
    </div>
  )
}
