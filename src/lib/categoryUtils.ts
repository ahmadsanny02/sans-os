import { CategoryItem } from "@/hooks/useCategories"

export const CATEGORY_COLOR_MAP: Record<
  string,
  { badgeBg: string; text: string; dotClass: string }
> = {
  primary: {
    badgeBg: "bg-primary/10 text-primary border-primary/20",
    text: "text-primary",
    dotClass: "bg-primary",
  },
  indigo: {
    badgeBg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    text: "text-indigo-500 dark:text-indigo-400",
    dotClass: "bg-indigo-500",
  },
  emerald: {
    badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    text: "text-emerald-500 dark:text-emerald-400",
    dotClass: "bg-emerald-500",
  },
  green: {
    badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    text: "text-emerald-500 dark:text-emerald-400",
    dotClass: "bg-emerald-500",
  },
  blue: {
    badgeBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    text: "text-blue-500 dark:text-blue-400",
    dotClass: "bg-blue-500",
  },
  violet: {
    badgeBg: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    text: "text-violet-500 dark:text-violet-400",
    dotClass: "bg-violet-500",
  },
  purple: {
    badgeBg: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    text: "text-violet-500 dark:text-violet-400",
    dotClass: "bg-violet-500",
  },
  rose: {
    badgeBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    text: "text-rose-500 dark:text-rose-400",
    dotClass: "bg-rose-500",
  },
  red: {
    badgeBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    text: "text-rose-500 dark:text-rose-400",
    dotClass: "bg-rose-500",
  },
  amber: {
    badgeBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    text: "text-amber-500 dark:text-amber-400",
    dotClass: "bg-amber-500",
  },
  cyan: {
    badgeBg: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    text: "text-cyan-500 dark:text-cyan-400",
    dotClass: "bg-cyan-500",
  },
  orange: {
    badgeBg: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    text: "text-orange-500 dark:text-orange-400",
    dotClass: "bg-orange-500",
  },
  pink: {
    badgeBg: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    text: "text-pink-500 dark:text-pink-400",
    dotClass: "bg-pink-500",
  },
  teal: {
    badgeBg: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    text: "text-teal-500 dark:text-teal-400",
    dotClass: "bg-teal-500",
  },
  fuchsia: {
    badgeBg: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20",
    text: "text-fuchsia-500 dark:text-fuchsia-400",
    dotClass: "bg-fuchsia-500",
  },
  slate: {
    badgeBg: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    text: "text-slate-500 dark:text-slate-400",
    dotClass: "bg-slate-500",
  },
}

export function getCategoryStyle(
  categoryName: string | undefined | null,
  categories: CategoryItem[]
) {
  if (!categoryName) return CATEGORY_COLOR_MAP.primary
  const found = categories.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  )
  const colorKey = found ? found.color : "primary"
  return CATEGORY_COLOR_MAP[colorKey] || CATEGORY_COLOR_MAP.primary
}
