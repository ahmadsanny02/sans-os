import React, { Suspense } from "react"
import { LanguageView } from "@/components/language/LanguageView"

export default function LanguagePage(): React.JSX.Element {
  return (
    <Suspense fallback={<div className="h-full w-full flex items-center justify-center p-8 text-muted-foreground text-sm font-semibold animate-pulse">Loading Language Logs...</div>}>
      <LanguageView />
    </Suspense>
  )
}
