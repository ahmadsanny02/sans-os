"use client"

import React from "react"
import Link from "next/link"
import { Image as ImageIcon } from "lucide-react"

interface MemoryBoxWidgetProps {
  picUrl: string | null | undefined
  isLoading: boolean
}

export function MemoryBoxWidget({
  picUrl,
  isLoading,
}: MemoryBoxWidgetProps) {
  return (
    <div className="bento-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Pic of the Day</h3>
        </div>
      </div>

      <div className="relative rounded-xl border border-border/40 bg-secondary/25 overflow-hidden h-48 flex items-center justify-center shadow-inner p-1">
        {isLoading ? (
          <div className="w-full h-full bg-muted/20 animate-pulse rounded-lg" />
        ) : picUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={picUrl}
            alt="Memory of the Day"
            className="w-full h-full object-cover rounded-lg animate-in fade-in duration-200"
          />
        ) : (
          <div className="text-center p-4">
            <p className="text-xs text-muted-foreground">No memory captured today.</p>
            <Link href="/daily" className="inline-block text-[11px] font-bold text-primary hover:underline mt-2">
              Upload picture in Daily Flow
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
