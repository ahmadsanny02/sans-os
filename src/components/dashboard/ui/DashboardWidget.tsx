"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface DashboardWidgetProps {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export function DashboardWidget({
  title,
  description,
  href,
  icon: Icon,
}: DashboardWidgetProps) {
  return (
    <div className="bento-card bento-card-interactive group p-4 relative">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-secondary p-2.5 text-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary truncate">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {description}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary shrink-0 ml-1" />
      </div>
      <Link href={href} className="absolute inset-0" aria-label={`Go to ${title}`} />
    </div>
  )
}
