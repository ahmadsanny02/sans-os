import React from "react"

export interface SkeletonProps {
  className?: string
}

export function TextRowSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`h-4 w-full animate-pulse rounded-md bg-muted/60 ${className}`} />
  )
}

export function GridCardSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded-2xl border border-border/60 bg-card/45 dark:bg-card/25 p-5 shadow-sm space-y-4 animate-pulse ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="h-6 w-1/3 bg-muted/70 rounded-md" />
        <div className="h-8 w-8 bg-muted/70 rounded-lg" />
      </div>
      <div className="space-y-2.5">
        <div className="h-4 w-full bg-muted/60 rounded-md" />
        <div className="h-4 w-5/6 bg-muted/60 rounded-md" />
        <div className="h-4 w-4/6 bg-muted/60 rounded-md" />
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 3, className = "" }: { count?: number } & SkeletonProps) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 rounded-xl border border-border/60 p-3 bg-card/40"
        >
          <div className="h-5 w-5 bg-muted/70 rounded-md shrink-0" />
          <div className="h-4 w-2/3 bg-muted/60 rounded-md" />
          <div className="h-4 w-12 bg-muted/60 rounded-md ml-auto shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function ImageCardSkeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`relative h-64 rounded-2xl border border-border/60 bg-muted/10 animate-pulse overflow-hidden p-5 flex flex-col justify-end gap-3 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <div className="flex items-center gap-3 relative z-10">
        <div className="h-6 w-6 bg-muted/80 rounded-full shrink-0" />
        <div className="h-5 w-2/3 bg-muted/70 rounded-md" />
      </div>
      <div className="h-3 w-1/3 bg-muted/60 rounded-md pl-8 relative z-10" />
    </div>
  )
}
