"use client"

import React, { useState, useRef } from "react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useDailyLogQuery, useSaveDailyLogMutation } from "@/hooks/useDailyLogs"
import { Image as ImageIcon, Camera, Trash2, Loader2, UploadCloud, AlertCircle } from "lucide-react"

export function DailyPics() {
  const activeDate = useWorkspaceStore((state) => state.activeDate)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: log, isLoading } = useDailyLogQuery(activeDate)
  const saveLogMutation = useSaveDailyLogMutation()

  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const picUrl = log?.picUrl

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setErrorMsg(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("date", activeDate)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to upload image")
      }

      const data = await res.json()

      // Save the uploaded pic URL in the daily log
      await saveLogMutation.mutateAsync({
        date: activeDate,
        picUrl: data.url,
      })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
      // Reset input value so user can upload the same file again if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async (): Promise<void> => {
    if (!confirm("Are you sure you want to remove today's photo?")) return
    setErrorMsg(null)
    try {
      await saveLogMutation.mutateAsync({
        date: activeDate,
        picUrl: "", // setting to empty string to clear the value
      })
    } catch (err) {
      console.error(err)
      setErrorMsg("Failed to remove photo")
    }
  }

  const triggerFileInput = (): void => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Camera className="h-5 w-5 text-sidebar-primary" />
          Pic of the Day
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Capture a special memory, photo, or screenshot for today
        </p>
      </div>

      <div className="relative rounded-2xl border border-border bg-card p-2 shadow-sm hover:border-sidebar-primary/20 transition-all group overflow-hidden h-72 flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-sidebar-primary" />
            <span className="text-xs text-muted-foreground">Loading image...</span>
          </div>
        ) : picUrl ? (
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-secondary/10 flex items-center justify-center">
            {/* The Pic of the Day Image */}
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
                disabled={isUploading || saveLogMutation.isPending}
                className="p-2.5 rounded-full bg-card/90 text-foreground hover:bg-card hover:scale-105 transition-all shadow-md"
                title="Change Photo"
              >
                <UploadCloud className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isUploading || saveLogMutation.isPending}
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
            className="w-full h-full rounded-xl border-2 border-dashed border-border hover:border-sidebar-primary/40 cursor-pointer flex flex-col items-center justify-center p-6 text-center transition-all bg-secondary/10 hover:bg-secondary/25"
          >
            {isUploading || saveLogMutation.isPending ? (
              <Loader2 className="h-10 w-10 animate-spin text-sidebar-primary mb-3" />
            ) : (
              <ImageIcon className="h-10 w-10 text-muted-foreground group-hover:text-sidebar-primary transition-colors mb-3" />
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
