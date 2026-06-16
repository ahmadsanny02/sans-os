"use client"

import React, { useEffect } from "react"
import { useBucketListPage } from "@/hooks/useBucketListPage"
import { BucketListBoardView } from "./ui/BucketListBoardView"
import { Compass } from "lucide-react"
import { HeaderPage } from "@/components/ui/HeaderPage"

export default function BucketListComponent() {
  const bucketListData = useBucketListPage()

  // Update document title for client-side SEO
  useEffect(() => {
    document.title = "Bucket List - SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-8 py-4 animate-in fade-in duration-200">
      <HeaderPage
        title="Bucket List"
        icon={<Compass className="h-7 w-7 text-violet-500 shrink-0" />}
        description="Visualize and track your life-long goals, milestones, and dreams"
      />

      {/* Main Board View */}
      <BucketListBoardView {...bucketListData} />
    </div>
  )
}
