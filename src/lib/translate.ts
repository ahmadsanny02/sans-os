export async function translateText(text: string, from = "en", to = "id"): Promise<string> {
  if (!text || !text.trim()) return ""
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text.trim())}`
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error("Translation API responded with error")
    }
    const data = await res.json()
    if (data && data[0]) {
      const translatedParts = (data[0] as unknown[][])
        .map((x) => x[0] as string)
        .join("")
      return translatedParts
    }
    return ""
  } catch (error) {
    console.error("Auto-translate error:", error)
    return ""
  }
}
