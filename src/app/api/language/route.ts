import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { vocabularyLogs } from "@/types/schema"
import { eq, and, asc, sql } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { translateText } from "@/lib/translate"
import { conjugateVerb } from "@/lib/verbs"

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const logs = await db
      .select()
      .from(vocabularyLogs)
      .where(eq(vocabularyLogs.userId, user.id))
      .orderBy(asc(vocabularyLogs.word))

    // On-the-fly backfill for older logs
    const updatedLogs = await Promise.all(
      logs.map(async (log) => {
        let needsUpdate = false
        const updateFields: Record<string, string | null> = {}

        if (!log.autoTranslation) {
          const auto = await translateText(log.word)
          if (auto) {
            updateFields.autoTranslation = auto
            needsUpdate = true
            log.autoTranslation = auto
          }
        }

        if (log.partOfSpeech.trim().toLowerCase() === "verb" && !log.v1) {
          const conj = conjugateVerb(log.word)
          
          updateFields.v1 = conj.v1
          updateFields.v2 = conj.v2
          updateFields.v3 = conj.v3
          updateFields.vIng = conj.vIng
          
          updateFields.v1Translation = log.translation.trim()
          updateFields.v2Translation = await translateText(conj.v2)
          updateFields.v3Translation = await translateText(conj.v3)
          updateFields.vIngTranslation = await translateText(conj.vIng)
          
          needsUpdate = true

          log.v1 = conj.v1
          log.v2 = conj.v2
          log.v3 = conj.v3
          log.vIng = conj.vIng
          log.v1Translation = updateFields.v1Translation
          log.v2Translation = updateFields.v2Translation
          log.v3Translation = updateFields.v3Translation
          log.vIngTranslation = updateFields.vIngTranslation
        }

        if (needsUpdate) {
          await db
            .update(vocabularyLogs)
            .set(updateFields)
            .where(and(eq(vocabularyLogs.id, log.id), eq(vocabularyLogs.userId, user.id)))
        }
        return log
      })
    )

    return NextResponse.json(updatedLogs)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

function isIndonesianVerb(indoWord: string): boolean {
  const w = indoWord.trim().toLowerCase()
  const commonIndoVerbs = [
    "makan", "minum", "tidur", "pergi", "datang", "duduk", "pulang",
    "main", "bantu", "beli", "jual", "tahu", "lihat", "dengar"
  ]
  if (commonIndoVerbs.includes(w)) return true

  // Match prefixes: me-, ber-, ter-, di-, bel-
  if (/^(me[nmy]?|ber|ter|di|bel|be)[a-z]+/i.test(w)) {
    const falsePositives = [
      "merah", "meja", "mentega", "mentimun", "terang", "terbang",
      "terigu", "dinding", "dinas", "besok", "bebek", "belakang"
    ]
    if (falsePositives.includes(w)) return false
    return true
  }
  return false
}

async function detectPartOfSpeech(englishWord: string, indonesianWord: string): Promise<string> {
  const cleanWord = englishWord.split(/[,;]/)[0].trim().toLowerCase()
  if (!cleanWord) return "noun"
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data[0] && data[0].meanings) {
        const primaryEntry = data[0]
        const primaryParts = primaryEntry.meanings.map((m: { partOfSpeech: string }) => m.partOfSpeech.toLowerCase())
        const primaryPOS = primaryEntry.meanings[0].partOfSpeech.toLowerCase()

        if (primaryParts.includes("verb")) {
          // If it can be a verb, check if it is the primary POS or if the Indonesian word is a verb
          if (primaryPOS === "verb" || isIndonesianVerb(indonesianWord)) {
            return "verb"
          }
          return primaryPOS
        }

        // Fallback to other parts of speech in the primary entry
        if (primaryParts.includes("adjective")) return "adjective"
        if (primaryParts.includes("adverb")) return "adverb"
        if (primaryParts.includes("noun")) return "noun"
        if (primaryParts.length > 0) return primaryParts[0]
      }
    }
  } catch (error) {
    console.error("Error auto-detecting part of speech:", error)
  }
  return "noun" // default fallback
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { word, definition, translation, exampleSentence, masteryLevel, langDirection } = body

    if (!word || !translation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const direction = langDirection || "en-id"

    // Check if the word already exists for the user (case-insensitive & trimmed)
    const existingWords = await db
      .select()
      .from(vocabularyLogs)
      .where(
        and(
          eq(vocabularyLogs.userId, user.id),
          sql`lower(trim(${vocabularyLogs.word})) = ${word.trim().toLowerCase()}`
        )
      )
      .limit(1)

    if (existingWords.length > 0) {
      return NextResponse.json({ error: "This vocabulary word is already registered" }, { status: 400 })
    }

    // Auto-translation: if id-en, translate Indonesian to English. Else English to Indonesian.
    const autoTranslation = direction === "id-en" 
      ? await translateText(word, "id", "en")
      : await translateText(word, "en", "id")

    // Automatically detect part of speech based on the English word
    const englishWordRaw = direction === "id-en" ? translation.trim() : word.trim()
    const indonesianWordRaw = direction === "id-en" ? word.trim() : translation.trim()
    const detectedPartOfSpeech = await detectPartOfSpeech(englishWordRaw, indonesianWordRaw)

    let v1 = null
    let v2 = null
    let v3 = null
    let vIng = null
    let v1Translation = null
    let v2Translation = null
    let v3Translation = null
    let vIngTranslation = null

    if (detectedPartOfSpeech === "verb") {
      // For verbs:
      // If direction is id-en, the English word to conjugate is the translation (e.g. "study").
      // If en-id, the English word to conjugate is the main word (e.g. "study").
      const englishVerb = direction === "id-en" ? translation.trim() : word.trim()
      const cleanVerb = englishVerb.split(/[,;]/)[0].trim()
      const conj = conjugateVerb(cleanVerb)
      
      v1 = conj.v1
      v2 = conj.v2
      v3 = conj.v3
      vIng = conj.vIng
      
      // V1 translation is the Indonesian equivalent (either word or translation)
      v1Translation = direction === "id-en" ? word.trim() : translation.trim()
      
      // The translations for conjugated forms are always translated to Indonesian (from English)
      v2Translation = await translateText(conj.v2, "en", "id")
      v3Translation = await translateText(conj.v3, "en", "id")
      vIngTranslation = await translateText(conj.vIng, "en", "id")
    }

    const [newLog] = await db
      .insert(vocabularyLogs)
      .values({
        userId: user.id,
        word: word.trim(),
        partOfSpeech: detectedPartOfSpeech,
        definition: definition || "n/a",
        translation: translation.trim(),
        exampleSentence: exampleSentence ? exampleSentence.trim() : null,
        masteryLevel: masteryLevel !== undefined ? Number(masteryLevel) : 3,
        memorized: false,
        autoTranslation,
        v1,
        v2,
        v3,
        vIng,
        v1Translation,
        v2Translation,
        v3Translation,
        vIngTranslation,
        langDirection: direction,
      })
      .returning()

    return NextResponse.json(newLog)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, masteryLevel, memorized } = body

    if (!id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Retrieve existing log to check its translation and autoTranslation
    const existingLogs = await db
      .select()
      .from(vocabularyLogs)
      .where(and(eq(vocabularyLogs.id, id), eq(vocabularyLogs.userId, user.id)))
      .limit(1)

    if (existingLogs.length === 0) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 })
    }

    const currentLog = existingLogs[0]

    const updateData: {
      masteryLevel?: number
      memorized?: boolean
      translation?: string
      autoTranslation?: string | null
    } = {}
    if (masteryLevel !== undefined) updateData.masteryLevel = Number(masteryLevel)
    if (memorized !== undefined) updateData.memorized = Boolean(memorized)

    // If marked as memorized (checklist) and translation does not match autoTranslation, update it
    if (Boolean(memorized) === true) {
      const currentTranslation = currentLog.translation.trim()
      if (currentLog.autoTranslation) {
        if (currentTranslation !== currentLog.autoTranslation.trim()) {
          updateData.translation = currentLog.autoTranslation
        }
      } else {
        const auto = await translateText(currentLog.word)
        if (auto) {
          updateData.autoTranslation = auto
          if (currentTranslation !== auto.trim()) {
            updateData.translation = auto
          }
        }
      }
    }

    const [updatedLog] = await db
      .update(vocabularyLogs)
      .set(updateData)
      .where(and(eq(vocabularyLogs.id, id), eq(vocabularyLogs.userId, user.id)))
      .returning()

    if (!updatedLog) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 })
    }

    return NextResponse.json(updatedLog)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing log ID" }, { status: 400 })
    }

    const [deletedLog] = await db
      .delete(vocabularyLogs)
      .where(and(eq(vocabularyLogs.id, id), eq(vocabularyLogs.userId, user.id)))
      .returning()

    if (!deletedLog) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
