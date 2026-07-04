"use client"

import React, { useEffect } from "react"
import { useVisionBoardPage } from "@/hooks/useVisionBoardPage"
import { VisionBoardCanvasView } from "./ui/VisionBoardCanvasView"
import { Sparkles } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function VisionBoardComponent() {
  const visionBoardData = useVisionBoardPage()

  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Vision Board - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl gap-6 flex flex-col py-4 animate-in fade-in duration-200">
      <HeaderPage
        title="Vision Board"
        icon={<Sparkles className="h-7 w-7 text-primary shrink-0" />}
        description="Visualize your target future, goals, and visual design layouts"
      />

      {/* Main Canvas Area */}
      <VisionBoardCanvasView {...visionBoardData} />
    </div>
  )
}
