import { logger } from "@/lib/logger";
export async function translateText(text: string, from = "en", to = "id", useBilingual = true): Promise<string> {
  if (!text || !text.trim()) return ""
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&dt=bd&q=${encodeURIComponent(text.trim())}`
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error("Translation API responded with error")
    }
    const data = await res.json()
    
    // Check if it's a single word and has a bilingual dictionary (data[1])
    const isSingleWord = !text.trim().includes(" ")
    if (useBilingual && isSingleWord && data && data[1]) {
      const altTranslations: string[] = []
      for (const entry of data[1]) {
        if (entry && Array.isArray(entry[1])) {
          altTranslations.push(...entry[1])
        }
      }
      if (altTranslations.length > 0) {
        // Return unique alternative translations joined by comma
        const uniqueAlts = Array.from(new Set(altTranslations.map((s: string) => s.trim())))
        return uniqueAlts.join(", ")
      }
    }

    if (data && data[0]) {
      const translatedParts = (data[0] as unknown[][])
        .map((x) => x[0] as string)
        .join("")
      return translatedParts
    }
    return ""
  } catch (error) {
    logger.error("Auto-translate error:", error)
    return ""
  }
}

