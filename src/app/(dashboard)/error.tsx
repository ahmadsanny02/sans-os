"use client"

import { useEffect } from "react"
import { logger } from "@/lib/logger"
import { ErrorState } from "@/components/ui/ErrorState"

export default function DashboardError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    logger.error(error)
  }, [error])

  return (
    <div className="space-y-4">
      <ErrorState message="Something went wrong while loading this page." />
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
