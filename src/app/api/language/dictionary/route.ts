import { NextResponse } from "next/server"
import { SPECIAL_WORDS } from "@/lib/languageUtils"

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const letter = searchParams.get("letter")
    const query = searchParams.get("q")
    const word = searchParams.get("word")

    // Case 1: Fetch word details (definition & translation)
    if (word) {
      const cleanWord = word.trim().toLowerCase()
      
      // 1. Fetch from Free Dictionary API
      let dictionaryData = null
      try {
        const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`)
        if (dictRes.ok) {
          dictionaryData = await dictRes.json()
        }
      } catch (err) {
        console.error("Free Dictionary API error:", err)
      }

      // 2. Fetch Translation from Google Translate (dt=t&dt=bd)
      const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&dt=bd&q=${encodeURIComponent(cleanWord)}`
      let translation = ""
      let alternativeTranslations: { partOfSpeech: string; translations: string[] }[] = []
      
      try {
        const transRes = await fetch(translateUrl)
        if (transRes.ok) {
          const transData = await transRes.json()
          if (transData && transData[0] && transData[0][0]) {
            translation = transData[0][0][0]
          }
          if (transData && transData[1]) {
            // Parse bilingual dictionary
            alternativeTranslations = transData[1].map((item: unknown) => {
              if (Array.isArray(item) && item.length >= 2) {
                return {
                  partOfSpeech: String(item[0]),
                  translations: Array.isArray(item[1]) ? item[1] : []
                }
              }
              return { partOfSpeech: "noun", translations: [] }
            })
          }
        }
      } catch (err) {
        console.error("Translation API error:", err)
      }

      // Extract parts of speech and definition
      const partsSet = new Set<string>()
      let definition = "No definition found."
      
      if (SPECIAL_WORDS[cleanWord]) {
        partsSet.add(SPECIAL_WORDS[cleanWord])
      }
      
      if (dictionaryData && Array.isArray(dictionaryData) && dictionaryData[0]) {
        const entry = dictionaryData[0]
        if (entry.meanings) {
          for (const m of entry.meanings) {
            if (m.partOfSpeech) {
              if (SPECIAL_WORDS[cleanWord]) continue
              partsSet.add(m.partOfSpeech.toLowerCase())
            }
          }
          // Get the first definition
          if (entry.meanings[0] && entry.meanings[0].definitions && entry.meanings[0].definitions[0]) {
            definition = entry.meanings[0].definitions[0].definition || definition
          }
        }
      }

      // Fallback part of speech from translations if dictionary API didn't return parts of speech
      if (partsSet.size === 0 && alternativeTranslations.length > 0) {
        alternativeTranslations.forEach((item) => {
          partsSet.add(item.partOfSpeech)
        })
      }

      const partOfSpeech = partsSet.size > 0 ? Array.from(partsSet).join(", ") : "noun"

      return NextResponse.json({
        word: cleanWord,
        partOfSpeech,
        definition,
        translation,
        alternativeTranslations,
        dictionaryData
      })
    }

    // Case 2: List words from Datamuse API
    let searchUrl = ""
    if (query) {
      searchUrl = `https://api.datamuse.com/words?sp=${encodeURIComponent(query.trim().toLowerCase())}*&max=50`
    } else if (letter) {
      searchUrl = `https://api.datamuse.com/words?sp=${encodeURIComponent(letter.trim().toLowerCase())}*&max=50`
    } else {
      // Default to "a" if nothing specified
      searchUrl = `https://api.datamuse.com/words?sp=a*&max=50`
    }

    const res = await fetch(searchUrl)
    if (!res.ok) {
      throw new Error("Datamuse API error")
    }
    const data = await res.json()
    // Datamuse returns array of { word: string, score: number, tags?: string[] }
    let wordsList = data
      .map((item: { word: string }) => ({ word: item.word }))
      .sort((a: { word: string }, b: { word: string }) => a.word.toLowerCase().localeCompare(b.word.toLowerCase()))
    
    if (query) {
      const cleanQuery = query.trim().toLowerCase()
      // Filter out any exact duplicate (case insensitive) from the list
      wordsList = wordsList.filter((item: { word: string }) => item.word.toLowerCase() !== cleanQuery)
      // Add the exact query at the very beginning of the list
      wordsList.unshift({ word: cleanQuery })
    }
    
    return NextResponse.json(wordsList)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
