import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface HeaderPageProps {
  title: string
  description?: React.ReactNode
  icon?: React.ReactNode
  showNavigation?: boolean
  onPrevious?: () => void
  onNext?: () => void
  onToday?: () => void
  prevLabel?: string
  nextLabel?: string
  middleContent?: React.ReactNode
  extraActions?: React.ReactNode
}

export function HeaderPage({
  title,
  description,
  icon,
  showNavigation = false,
  onPrevious,
  onNext,
  onToday,
  prevLabel = "Previous",
  nextLabel = "Next",
  middleContent,
  extraActions,
}: HeaderPageProps) {
  return (
    <div className="relative overflow-hidden w-full rounded-2xl border border-border/80 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/5 p-5 sm:p-8 shadow-sm flex flex-col lg:flex-row items-start lg:items-center lg:justify-between gap-4">
      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 flex items-center gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          {title}
        </h1>
        {description && (
          <div className="text-sm text-muted-foreground">
            {description}
          </div>
        )}
      </div>

      {(showNavigation || extraActions) && (
        <div className="flex items-center gap-2 self-start sm:self-center">
          {showNavigation && (
            <div className="flex items-center gap-1 bg-secondary/30 border border-border/60 p-1.5 rounded-xl shadow-inner backdrop-blur-md">
              {onPrevious && (
                <button
                  type="button"
                  onClick={onPrevious}
                  className="inline-flex h-8 w-8 sm:w-auto sm:px-3 items-center justify-center rounded-lg hover:bg-background/80 hover:text-foreground text-muted-foreground transition-all duration-200 active:scale-95 text-xs font-medium"
                  aria-label={prevLabel}
                >
                  <ChevronLeft className="h-4 w-4 sm:mr-1 shrink-0" />
                  <span className="hidden sm:inline">{prevLabel}</span>
                </button>
              )}

              {middleContent}

              {onToday && !extraActions && (
                <button
                  type="button"
                  onClick={onToday}
                  className="inline-flex h-8 px-3 items-center justify-center rounded-lg bg-background text-foreground shadow-sm border border-border/40 hover:bg-background/80 transition-all duration-200 active:scale-95 text-xs font-semibold"
                  aria-label="Go to today"
                >
                  Today
                </button>
              )}

              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="inline-flex h-8 w-8 sm:w-auto sm:px-3 items-center justify-center rounded-lg hover:bg-background/80 hover:text-foreground text-muted-foreground transition-all duration-200 active:scale-95 text-xs font-medium"
                  aria-label={nextLabel}
                >
                  <span className="hidden sm:inline">{nextLabel}</span>
                  <ChevronRight className="h-4 w-4 sm:ml-1 shrink-0" />
                </button>
              )}
            </div>
          )}

          {onToday && extraActions && (
            <div className="bg-secondary/30 border border-border/60 p-1.5 rounded-xl backdrop-blur-md">
              <button
                type="button"
                onClick={onToday}
                className="inline-flex h-8 px-3.5 items-center justify-center rounded-lg bg-background text-foreground shadow-sm border border-border/40 hover:bg-background/80 transition-all duration-200 active:scale-95 text-xs font-semibold"
                aria-label="Go to today"
              >
                Today
              </button>
            </div>
          )}

          {extraActions}
        </div>
      )}
    </div>
  )
}
