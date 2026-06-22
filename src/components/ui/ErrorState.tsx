import React from "react"
import { AlertCircle } from "lucide-react"

interface ErrorStateProps {
  message?: string
  icon?: React.ReactNode
  className?: string
}

export function ErrorState({
  message = "Error loading logs. Please check database connection.",
  icon = <AlertCircle className="h-6 w-6 shrink-0" />,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 text-sm font-semibold text-destructive p-6 select-none ${className}`}
    >
      {icon && <div className="shrink-0">{icon}</div>}
      <span className="text-center">{message}</span>
    </div>
  )
}
