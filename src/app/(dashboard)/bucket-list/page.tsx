"use client"

import React, { useEffect } from "react"
import { BucketListBoard } from "@/components/bucket-list/BucketListBoard"
import { Trophy } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function BucketListPage() {
  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Bucket List - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4">
      <HeaderPage
        title="Bucket List"
        icon={<Trophy className="h-7 w-7 text-violet-500 shrink-0" />}
        description="Plan your life dreams, visualize them with cover cards, and track achievements"
      />

      {/* Main Board Workspace */}
      <BucketListBoard />
    </div>
  )
}

