"use client"

import React, { useEffect } from "react"
import { VisionBoardCanvas } from "@/components/vision-board/VisionBoardCanvas"
import { Image as ImageIcon } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function VisionBoardPage() {
  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Vision Board - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4">
      <HeaderPage
        title="Vision Board"
        icon={<ImageIcon className="h-7 w-7 text-violet-500 shrink-0" />}
        description="A flexible drag-and-drop board for visual inspiration, quotes, and sticky notes"
      />

      {/* Main Canvas Workspace */}
      <VisionBoardCanvas />
    </div>
  )
}

