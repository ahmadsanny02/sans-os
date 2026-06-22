import React from "react"

interface StatCardProps {
  title: string
  value?: React.ReactNode
  icon?: React.ReactNode
  iconBgClass?: string
  iconTextClass?: string
  isLoading?: boolean
  description?: string
  children?: React.ReactNode
}

export function StatCard({
  title,
  value,
  icon,
  iconBgClass = "bg-violet-500/10",
  iconTextClass = "text-violet-500",
  isLoading = false,
  description,
  children,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex flex-col justify-between md:flex-row md:items-center backdrop-blur-md">
      <div className="space-y-1 min-w-0 flex-1 pr-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
          {title}
        </span>
        {value !== undefined && (
          <h4 className="text-3xl font-black text-foreground truncate flex items-baseline gap-1">
            {isLoading ? (
              <span className="inline-block w-12 h-8 bg-muted/20 animate-pulse rounded-md mt-0.5" />
            ) : (
              value
            )}
          </h4>
        )}
        {description && (
          <p className="text-[10px] text-muted-foreground font-semibold truncate">
            {description}
          </p>
        )}
        {children}
      </div>
      {icon && (
        <div className={`rounded-xl p-3 shrink-0 self-start md:self-center mt-3 md:mt-0 ${iconBgClass} ${iconTextClass}`}>
          {icon}
        </div>
      )}
    </div>
  )
}
