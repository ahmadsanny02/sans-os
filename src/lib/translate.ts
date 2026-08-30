import { logger } from "@/lib/logger"

export interface WordTranslationDetails {
  translation: string
  alternativeTranslations: { partOfSpeech: string; translations: string[] }[]
  partOfSpeech: string | null
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "*/*",
}

export async function translateWordDetails(
  word: string,
  from = "en",
  to = "id"
): Promise<WordTranslationDetails> {
  if (!word || !word.trim()) {
    return { translation: "", alternativeTranslations: [], partOfSpeech: null }
  }

  const clean = word.trim()

  const primaryEndpoints = [
    `https://clients5.google.com/translate_a/single?client=dict-chrome-ex&sl=${from}&tl=${to}&dt=t&dt=bd&q=${encodeURIComponent(clean)}`,
    `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=${from}&tl=${to}&dt=t&dt=bd&q=${encodeURIComponent(clean)}`,
  ]

  for (const url of primaryEndpoints) {
    try {
      const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(5000) })
      if (!res.ok) continue

      const data = await res.json()
      if (!data) continue

      let translation = ""
      const altList: { partOfSpeech: string; translations: string[] }[] = []
      let detectedPos: string | null = null

      if (Array.isArray(data)) {
        if (Array.isArray(data[0])) {
          if (Array.isArray(data[0][0]) && typeof data[0][0][0] === "string") {
            translation = data[0]
              .map((item) => (Array.isArray(item) ? item[0] : ""))
              .filter(Boolean)
              .join("")
          } else if (typeof data[0] === "string") {
            translation = data[0]
          }
        }

        if (Array.isArray(data[1])) {
          for (const entry of data[1]) {
            if (Array.isArray(entry) && typeof entry[0] === "string" && Array.isArray(entry[1])) {
              const pos = entry[0]
              const words = entry[1] as string[]
              if (!detectedPos) {
                detectedPos = pos
              }
              if (words.length > 0) {
                altList.push({
                  partOfSpeech: pos,
                  translations: words.slice(0, 10),
                })
              }
            }
          }
        }
      }

      if (translation) {
        return {
          translation: translation.trim(),
          alternativeTranslations: altList,
          partOfSpeech: detectedPos,
        }
      }
    } catch (err) {
      logger.warn(`Primary translation endpoint failed for "${word}":`, err)
    }
  }

  // Fallback 1: Simple dict-chrome-ex translate endpoint
  try {
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${from}&tl=${to}&q=${encodeURIComponent(clean)}`
    const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && typeof data[0] === "string") {
        return { translation: data[0].trim(), alternativeTranslations: [], partOfSpeech: null }
      }
    }
  } catch (err) {
    logger.warn(`Simple translation fallback failed for "${word}":`, err)
  }

  // Fallback 2: MyMemory Translation API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${from}|${to}`
    const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const data = await res.json()
      const text = data.responseData?.translatedText
      if (text && typeof text === "string" && text.toLowerCase() !== clean.toLowerCase()) {
        return { translation: text.trim(), alternativeTranslations: [], partOfSpeech: null }
      }
    }
  } catch (err) {
    logger.warn(`MyMemory translation fallback failed for "${word}":`, err)
  }

  return { translation: "", alternativeTranslations: [], partOfSpeech: null }
}

export async function translateText(
  text: string,
  from = "en",
  to = "id",
  useBilingual = true
): Promise<string> {
  if (!text || !text.trim()) return ""

  const clean = text.trim()
  const isSingleWord = !clean.includes(" ")

  const result = await translateWordDetails(clean, from, to)
  if (!result.translation) return ""

  if (useBilingual && isSingleWord && result.alternativeTranslations.length > 0) {
    const allAlts = result.alternativeTranslations.flatMap((a) => a.translations)
    const unique = Array.from(new Set(allAlts.map((s) => s.trim())))
    if (unique.length > 0) {
      return unique.join(", ")
    }
  }

  return result.translation
}

