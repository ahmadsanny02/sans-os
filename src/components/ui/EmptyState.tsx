import React from "react"
import { AlertCircle } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = "No items found",
  description,
  icon = <AlertCircle className="h-6 w-6 text-muted-foreground/60" />,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground bg-card/10 select-none animate-in fade-in duration-200 flex flex-col items-center justify-center gap-1.5 p-6 ${className}`}
    >
      {icon && <div className="mb-1 shrink-0">{icon}</div>}
      <h4 className="text-sm font-bold text-foreground leading-none">{title}</h4>
      {description && (
        <p className="text-xs text-muted-foreground max-w-sm px-4 mt-0.5 leading-normal">
          {description}
        </p>
      )}
    </div>
  )
}
