"use client"

import { useEffect } from "react"
import { logger } from "@/lib/logger"
import "./globals.css"

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    logger.error(error)
  }, [error])

  return (
    // Replaces the root layout, so no font variables or theme class exist here
    <html lang="en" className="dark" style={{ fontFamily: "system-ui, sans-serif" }}>
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground p-6 text-center">
        <title>Something went wrong - SansOS</title>
        <h1 className="text-lg font-bold">Something went wrong</h1>
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground cursor-pointer"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
