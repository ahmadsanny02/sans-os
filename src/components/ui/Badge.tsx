import React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "outline"
}

const VARIANT_MAP = {
  default: "bg-secondary text-muted-foreground border-border/60",
  primary: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-secondary/40 text-muted-foreground border-border/40",
  success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  info: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  outline: "bg-transparent text-foreground border border-border",
}

export function Badge({ children, variant = "default", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border select-none transition-all leading-none ${VARIANT_MAP[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
