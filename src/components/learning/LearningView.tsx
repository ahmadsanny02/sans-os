"use client"

import React, { useEffect } from "react"
import { LearningWorkspace } from "./ui/LearningWorkspace"
import { GraduationCap } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export function LearningView(): React.JSX.Element {
  useEffect(() => {
    document.title = "Learning Hub — SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl gap-6 flex flex-col py-4 animate-in fade-in duration-200">
      <HeaderPage
        title="Learning Hub"
        icon={<GraduationCap className="h-7 w-7 text-primary shrink-0" />}
        description="Manage learning materials, topics, references, and daily tasks visually"
      />

      <LearningWorkspace />
    </div>
  )
}

export default LearningView
