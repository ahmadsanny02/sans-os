import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const letter = searchParams.get("letter")
    const query = searchParams.get("q")
    const word = searchParams.get("word")

    // Case 1: Fetch word details (translation and definition)
    if (word) {
      const cleanWord = word.trim().toLowerCase()

      // Fetch Translation from Google Translate
      const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(cleanWord)}`
      let translation = ""
      
      try {
        const transRes = await fetch(translateUrl)
        if (transRes.ok) {
          const transData = await transRes.json()
          if (transData && transData[0] && transData[0][0]) {
            translation = transData[0][0][0]
          }
        }
      } catch (err) {
        logger.error("Translation API error:", err)
      }

      // Fetch Definition & Part of Speech from Free Dictionary API
      let partOfSpeech = "noun"
      let definition = "No definition found."

      try {
        const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`)
        if (dictRes.ok) {
          const dictData = await dictRes.json()
          if (dictData && dictData[0]) {
            const entry = dictData[0]
            if (entry.meanings && entry.meanings[0]) {
              const meaning = entry.meanings[0]
              partOfSpeech = meaning.partOfSpeech || "noun"
              if (meaning.definitions && meaning.definitions[0]) {
                definition = meaning.definitions[0].definition || "No definition found."
              }
            }
          }
        }
      } catch (err) {
        logger.error("Dictionary API error:", err)
      }

      return NextResponse.json({
        word: cleanWord,
        partOfSpeech,
        definition,
        translation: translation || "No translation found.",
        alternativeTranslations: [],
        dictionaryData: null
      })
    }

    // Case 2: List words from Datamuse API
    let searchUrl = ""
    if (query) {
      searchUrl = `https://api.datamuse.com/words?sp=${encodeURIComponent(query.trim().toLowerCase())}*&max=50`
    } else if (letter) {
      searchUrl = `https://api.datamuse.com/words?sp=${encodeURIComponent(letter.trim().toLowerCase())}*&max=50`
    } else {
      searchUrl = `https://api.datamuse.com/words?sp=a*&max=50`
    }

    try {
      const res = await fetch(searchUrl)
      if (!res.ok) {
        logger.warn(`Datamuse API returned status ${res.status}`)
        return NextResponse.json(query ? [{ word: query.trim().toLowerCase() }] : [])
      }
      const data = await res.json()
      let wordsList = Array.isArray(data)
        ? data.map((item: { word: string }) => ({ word: item.word }))
        : []
      wordsList.sort((a: { word: string }, b: { word: string }) => a.word.toLowerCase().localeCompare(b.word.toLowerCase()))
      
      if (query) {
        const cleanQuery = query.trim().toLowerCase()
        wordsList = wordsList.filter((item: { word: string }) => item.word.toLowerCase() !== cleanQuery)
        wordsList.unshift({ word: cleanQuery })
      }
      
      return NextResponse.json(wordsList)
    } catch (fetchErr) {
      logger.error("Datamuse API fetch error:", fetchErr)
      return NextResponse.json(query ? [{ word: query.trim().toLowerCase() }] : [])
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
