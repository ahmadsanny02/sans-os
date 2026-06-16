"use client"

import React, { useEffect } from "react"
import { LanguageBoard } from "@/components/language/LanguageBoard"
import { Languages } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function LanguageLogsPage() {
  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Language Logs - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4">
      <HeaderPage
        title="Language Logs"
        icon={<Languages className="h-7 w-7 text-violet-500 shrink-0" />}
        description="Track vocabulary words, definitions, translations, and mastery levels"
      />

      {/* Main Board Workspace */}
      <LanguageBoard />
    </div>
  )
}

