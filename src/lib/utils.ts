import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUUIDArray(ids: unknown): ids is string[] {
  return Array.isArray(ids) && ids.every((id) => typeof id === "string" && UUID_REGEX.test(id))
}

export function parsePicUrls(raw: string | null | undefined): string[] {
  if (!raw) return []
  const trimmed = raw.trim()
  if (!trimmed) return []
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.filter((u): u is string => typeof u === "string" && Boolean(u.trim()))
      }
    } catch {
      // Fallback if parsing fails
    }
  }
  return [trimmed]
}

export function serializePicUrls(urls: string[]): string {
  const clean = urls.filter((u) => typeof u === "string" && Boolean(u.trim()))
  if (clean.length === 0) return ""
  return JSON.stringify(clean)
}

