"use client"

import React, { useRef } from "react"
import { Image as ImageIcon, Camera, Trash2, Loader2, UploadCloud, AlertCircle } from "lucide-react"

interface DailyPicsProps {
  isLoading: boolean
  isUploading: boolean
  errorMsg: string | null
  picUrl: string | undefined
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  handleDelete: () => Promise<void>
  isPendingSave: boolean
}

export function DailyPics({
  isLoading,
  isUploading,
  errorMsg,
  picUrl,
  handleFileChange,
  handleDelete,
  isPendingSave,
}: DailyPicsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerFileInput = (): void => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Pic of the Day
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Capture a special memory, photo, or screenshot for today
        </p>
      </div>

      <div className="relative rounded-2xl border border-border/40 bg-card/40 p-2 shadow-sm hover:border-primary/20 transition-all group overflow-hidden h-72 flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="w-full h-full bg-muted/20 animate-pulse rounded-xl" />
        ) : picUrl ? (
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-secondary/10 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={picUrl}
              alt="Pic of the Day"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Overlay Gradient on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={triggerFileInput}
                disabled={isUploading || isPendingSave}
                className="p-2.5 rounded-full bg-card/90 text-foreground hover:bg-card hover:scale-105 transition-all shadow-md"
                title="Change Photo"
              >
                <UploadCloud className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isUploading || isPendingSave}
                className="p-2.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 transition-all shadow-md"
                title="Remove Photo"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={triggerFileInput}
            className="w-full h-full rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 cursor-pointer flex flex-col items-center justify-center p-6 text-center transition-all bg-secondary/10 hover:bg-secondary/25"
          >
            {isUploading || isPendingSave ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            ) : (
              <ImageIcon className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
            )}
            <span className="text-sm font-semibold text-foreground">
              {isUploading ? "Uploading Memory..." : "Upload Pic of the Day"}
            </span>
            <span className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Drag and drop or click to upload JPEG, PNG, WEBP (Max 10MB)
            </span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {errorMsg && (
        <p className="text-xs text-destructive flex items-center gap-1 font-semibold">
          <AlertCircle className="h-3.5 w-3.5" />
          {errorMsg}
        </p>
      )}
    </div>
  )
}
