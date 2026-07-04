"use client"

import React, { useEffect } from "react"
import { useReadingPage } from "@/hooks/useReadingPage"
import { ReadingBoardView } from "./ui/ReadingBoardView"
import { BookOpen } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function ReadingComponent() {
  const readingData = useReadingPage()

  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Reading Journal - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl gap-6 flex flex-col py-4 animate-in fade-in duration-200">
      <HeaderPage
        title="Reading Journal"
        icon={<BookOpen className="h-7 w-7 text-primary shrink-0" />}
        description="Track books you read, rate, and summarize key concepts"
      />

      {/* Reading Board View */}
      <ReadingBoardView {...readingData} />
    </div>
  )
}
