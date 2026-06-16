"use client"

import React, { useEffect } from "react"
import { ReadingBoard } from "@/components/reading/ReadingBoard"
import { BookOpen } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function ReadingJournalPage() {
  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Reading Journal - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4">
      <HeaderPage
        title="Reading Journal"
        icon={<BookOpen className="h-7 w-7 text-violet-500 shrink-0" />}
        description="Log your reading lists, track book reviews, and manage key takeaways"
      />

      {/* Main Board Workspace */}
      <ReadingBoard />
    </div>
  )
}

