"use client"

import React, { useRef, useState, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Camera,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Maximize2,
  X,
  Image as ImageIcon,
} from "lucide-react"
import { cn, parsePicUrls } from "@/lib/utils"

export interface DailyPicsProps {
  isLoading: boolean
  isUploading: boolean
  errorMsg: string | null
  picUrls?: string[]
  picUrl?: string | undefined
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  handleDelete: (index?: number) => Promise<void>
  isPendingSave: boolean
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.18, ease: "easeIn" as const },
  }),
}

export function DailyPics({
  isLoading,
  isUploading,
  errorMsg,
  picUrls,
  picUrl,
  handleFileChange,
  handleDelete,
  isPendingSave,
}: DailyPicsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [brokenUrls, setBrokenUrls] = useState<Record<string, boolean>>({})
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  const images = useMemo(() => {
    if (picUrls && picUrls.length > 0) return picUrls
    if (picUrl) return parsePicUrls(picUrl)
    return []
  }, [picUrls, picUrl])

  // Derive clamped active index without setState in effect
  const activeIndex = images.length === 0 ? 0 : Math.min(currentIndex, images.length - 1)

  const triggerFileInput = (): void => {
    fileInputRef.current?.click()
  }

  const handlePrev = (e?: React.MouseEvent): void => {
    e?.stopPropagation()
    if (images.length <= 1) return
    setDirection(-1)
    setCurrentIndex(activeIndex > 0 ? activeIndex - 1 : images.length - 1)
  }

  const handleNext = (e?: React.MouseEvent): void => {
    e?.stopPropagation()
    if (images.length <= 1) return
    setDirection(1)
    setCurrentIndex(activeIndex < images.length - 1 ? activeIndex + 1 : 0)
  }

  const handleSelectIndex = (index: number): void => {
    if (index === activeIndex) return
    setDirection(index > activeIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const handleDeleteCurrent = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    await handleDelete(activeIndex)
  }

  const currentImage = images[activeIndex]
  const isCurrentBroken = Boolean(currentImage && brokenUrls[currentImage])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Daily Pics
            {images.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {images.length} {images.length === 1 ? "photo" : "photos"}
              </span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Capture special memories, photos, or screenshots for today
          </p>
        </div>

        {images.length > 0 && (
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={isUploading || isPendingSave}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
            title="Add more photos"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            <span>Add Photo</span>
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="relative rounded-2xl border border-border/40 bg-card/40 p-2 shadow-sm hover:border-primary/20 transition-all group overflow-hidden h-72 sm:h-80 flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="w-full h-full bg-muted/20 animate-pulse rounded-xl" />
        ) : images.length > 0 && currentImage && !isCurrentBroken ? (
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-secondary/15 flex items-center justify-center select-none">
            {/* Slide Viewer */}
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentImage + activeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x
                  if (swipe < -80 || offset.x < -60) {
                    handleNext()
                  } else if (swipe > 80 || offset.x > 60) {
                    handlePrev()
                  }
                }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing flex items-center justify-center"
              >
                <Image
                  src={currentImage}
                  alt={`Daily Pic ${activeIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 550px"
                  className="object-cover transition-transform duration-300"
                  onError={() => {
                    if (currentImage) {
                      setBrokenUrls((prev) => ({ ...prev, [currentImage]: true }))
                    }
                  }}
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Counter Badge */}
            {images.length > 1 && (
              <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide border border-white/10 shadow-sm pointer-events-none">
                {activeIndex + 1} / {images.length}
              </div>
            )}

            {/* Navigation Buttons (Next / Prev) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-xl bg-card/85 dark:bg-card/75 text-foreground hover:bg-card hover:scale-110 active:scale-95 transition-all shadow-lg border border-border/60 backdrop-blur-md opacity-90 hover:opacity-100"
                  title="Previous Photo"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-2 rounded-xl bg-card/85 dark:bg-card/75 text-foreground hover:bg-card hover:scale-110 active:scale-95 transition-all shadow-lg border border-border/60 backdrop-blur-md opacity-90 hover:opacity-100"
                  title="Next Photo"
                  aria-label="Next Photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Top-Right Quick Actions */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFullscreenImage(currentImage)}
                className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md hover:scale-105 active:scale-95 transition-all shadow-md border border-white/15"
                title="Fullscreen Preview"
                aria-label="Fullscreen Preview"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleDeleteCurrent}
                disabled={isUploading || isPendingSave}
                className="p-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50"
                title="Remove This Photo"
                aria-label="Remove This Photo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Pagination Dots at Bottom Center */}
            {images.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center items-center gap-1.5 pointer-events-auto">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectIndex(idx)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        activeIndex === idx
                          ? "w-5 bg-primary"
                          : "w-2 bg-white/40 hover:bg-white/80"
                      )}
                      title={`Go to photo ${idx + 1}`}
                      aria-label={`Go to photo ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Uploading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-xs font-semibold text-foreground">Uploading Photos...</span>
              </div>
            )}
          </div>
        ) : (
          /* Empty / Upload State */
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
              {isUploading ? "Uploading Memories..." : "Upload Daily Pics"}
            </span>
            <span className="text-xs text-muted-foreground mt-1 max-w-[260px]">
              Drag and drop or click to upload JPEG, PNG, WEBP, or GIF. Multi-photo selection supported (Max 10MB each).
            </span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
        />
      </div>

      {/* Horizontal Scrollable Thumbnail Strip when multiple pictures exist */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={img + idx}
              type="button"
              onClick={() => handleSelectIndex(idx)}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all shadow-sm",
                activeIndex === idx
                  ? "border-primary ring-2 ring-primary/30 scale-105"
                  : "border-border/60 hover:border-primary/40 opacity-70 hover:opacity-100"
              )}
              title={`View Photo ${idx + 1}`}
              aria-label={`View Photo ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="56px"
                className="object-cover"
              />
            </button>
          ))}

          <button
            type="button"
            onClick={triggerFileInput}
            disabled={isUploading || isPendingSave}
            className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-secondary/20 hover:border-primary/50 hover:bg-secondary/40 text-muted-foreground hover:text-primary transition-all shadow-sm"
            title="Add More Photos"
            aria-label="Add More Photos"
          >
            <Plus className="h-4 w-4" />
            <span className="text-[10px] font-medium mt-0.5">Add</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-destructive flex items-center gap-1 font-semibold">
          <AlertCircle className="h-3.5 w-3.5" />
          {errorMsg}
        </p>
      )}

      {/* Fullscreen Lightbox Modal */}
      {fullscreenImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            type="button"
            onClick={() => setFullscreenImage(null)}
            className="absolute top-5 right-5 p-2.5 rounded-xl bg-card/80 text-foreground hover:bg-card border border-border shadow-lg transition-all z-50"
            title="Close"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const prevIdx = activeIndex > 0 ? activeIndex - 1 : images.length - 1
                  setCurrentIndex(prevIdx)
                  setFullscreenImage(images[prevIdx])
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-card/80 text-foreground hover:bg-card border border-border shadow-lg transition-all z-50"
                title="Previous"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const nextIdx = activeIndex < images.length - 1 ? activeIndex + 1 : 0
                  setCurrentIndex(nextIdx)
                  setFullscreenImage(images[nextIdx])
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-card/80 text-foreground hover:bg-card border border-border shadow-lg transition-all z-50"
                title="Next"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={fullscreenImage}
                alt="Fullscreen Preview"
                fill
                sizes="100vw"
                className="object-contain rounded-xl"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
