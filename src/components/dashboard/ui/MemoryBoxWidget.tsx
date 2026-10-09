"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { parsePicUrls } from "@/lib/utils"

interface MemoryBoxWidgetProps {
  picUrl: string | null | undefined
  isLoading: boolean
}

export function MemoryBoxWidget({
  picUrl,
  isLoading,
}: MemoryBoxWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [brokenUrls, setBrokenUrls] = useState<Record<string, boolean>>({})

  const images = useMemo(() => parsePicUrls(picUrl), [picUrl])
  const activeIndex = images.length === 0 ? 0 : Math.min(currentIndex, images.length - 1)

  const handlePrev = (e: React.MouseEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    if (images.length <= 1) return
    setCurrentIndex(activeIndex > 0 ? activeIndex - 1 : images.length - 1)
  }

  const handleNext = (e: React.MouseEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    if (images.length <= 1) return
    setCurrentIndex(activeIndex < images.length - 1 ? activeIndex + 1 : 0)
  }

  const currentImage = images[activeIndex]
  const isCurrentBroken = Boolean(currentImage && brokenUrls[currentImage])

  return (
    <div className="bento-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Pic of the Day</h3>
        </div>
        {images.length > 1 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      <div className="relative rounded-xl border border-border/40 bg-secondary/25 overflow-hidden h-48 flex items-center justify-center shadow-inner p-1 group">
        {isLoading ? (
          <div className="w-full h-full bg-muted/20 animate-pulse rounded-lg" />
        ) : images.length > 0 && currentImage && !isCurrentBroken ? (
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            <Image
              key={currentImage}
              src={currentImage}
              alt="Memory of the Day"
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover rounded-lg animate-in fade-in duration-200"
              onError={() => {
                if (currentImage) {
                  setBrokenUrls((prev) => ({ ...prev, [currentImage]: true }))
                }
              }}
            />

            {/* Navigation buttons for multiple photos */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-card/80 text-foreground hover:bg-card border border-border/60 shadow-md backdrop-blur-md transition-all opacity-80 group-hover:opacity-100"
                  title="Previous Photo"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-card/80 text-foreground hover:bg-card border border-border/60 shadow-md backdrop-blur-md transition-all opacity-80 group-hover:opacity-100"
                  title="Next Photo"
                  aria-label="Next Photo"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setCurrentIndex(idx)
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        activeIndex === idx ? "w-4 bg-primary" : "w-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-xs text-muted-foreground">No memory captured today.</p>
            <Link href="/daily" className="inline-block text-xs font-bold text-primary hover:underline mt-2">
              Upload picture in Daily Flow
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
