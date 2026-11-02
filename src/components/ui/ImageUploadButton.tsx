"use client"

import React from "react"
import { Loader2, Upload } from "lucide-react"
import { useImageUploadMutation } from "@/hooks/useImageUpload"

export function ImageUploadButton({ onUploaded }: { onUploaded: (url: string) => void }): React.JSX.Element {
  const { mutate, isPending } = useImageUploadMutation()

  return (
    <label
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/30 px-3.5 py-2 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:bg-secondary/60 hover:text-foreground focus-within:ring-2 focus-within:ring-primary/20 ${
        isPending ? "opacity-50 pointer-events-none" : "cursor-pointer"
      }`}
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
      Upload
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={isPending}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = "" // allows picking the same file again after a failure
          if (file) mutate(file, { onSuccess: onUploaded })
        }}
      />
    </label>
  )
}
