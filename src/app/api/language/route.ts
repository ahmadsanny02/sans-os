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

    return NextResponse.json(logs)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
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
    const { word, translation, langDirection, masteryLevel, partOfSpeech, definition } = body

    if (!word || !translation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const direction = langDirection || "en-id"
    const pos = partOfSpeech || "noun"
    const def = definition || "n/a"

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

    const capitalizedWord = word.trim().charAt(0).toUpperCase() + word.trim().slice(1)
    const capitalizedTranslation = translation.trim().charAt(0).toUpperCase() + translation.trim().slice(1)

    // Calculate auto-translation
    let autoTranslationVal: string | null = null
    const fromLang = direction.split("-")[0] || "en"
    const toLang = direction.split("-")[1] || "id"
    try {
      autoTranslationVal = await translateText(word, fromLang, toLang, false)
    } catch (err) {
      console.error("Auto translation error:", err)
    }

    // Verb conjugation
    let v1Val: string | null = null
    let v2Val: string | null = null
    let v3Val: string | null = null
    let vIngVal: string | null = null
    let v1Trans: string | null = null
    let v2Trans: string | null = null
    let v3Trans: string | null = null
    let vIngTrans: string | null = null

    if (pos.toLowerCase() === "verb") {
      const conjugated = conjugateVerb(word)
      const v1 = word.trim()
      const v2 = conjugated.v2
      const v3 = conjugated.v3
      const vIng = conjugated.vIng

      v1Val = v1
      v2Val = v2
      v3Val = v3
      vIngVal = vIng

      if (fromLang === "en") {
        try {
          const [t1, t2, t3, tIng] = await Promise.all([
            translateText(v1, "en", "id", false),
            translateText(v2, "en", "id", false),
            translateText(v3, "en", "id", false),
            translateText(vIng, "en", "id", false),
          ])
          v1Trans = t1 || null
          v2Trans = t2 || null
          v3Trans = t3 || null
          vIngTrans = tIng || null
        } catch (err) {
          console.error("Conjugation translation error:", err)
        }
      }
    }

    const [newLog] = await db
      .insert(vocabularyLogs)
      .values({
        userId: user.id,
        word: capitalizedWord,
        partOfSpeech: pos,
        definition: def,
        translation: capitalizedTranslation,
        exampleSentence: null,
        masteryLevel: masteryLevel !== undefined ? Number(masteryLevel) : 3,
        memorized: false,
        autoTranslation: autoTranslationVal,
        v1: v1Val,
        v2: v2Val,
        v3: v3Val,
        vIng: vIngVal,
        v1Translation: v1Trans,
        v2Translation: v2Trans,
        v3Translation: v3Trans,
        vIngTranslation: vIngTrans,
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
    const { id, masteryLevel, memorized, translation } = body

    if (!id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch existing log
    const existingLogs = await db
      .select()
      .from(vocabularyLogs)
      .where(and(eq(vocabularyLogs.id, id), eq(vocabularyLogs.userId, user.id)))
      .limit(1)

    const existingLog = existingLogs[0]
    if (!existingLog) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 })
    }

    const updateData: {
      masteryLevel?: number
      memorized?: boolean
      translation?: string
      autoTranslation?: string | null
    } = {}

    if (masteryLevel !== undefined) updateData.masteryLevel = Number(masteryLevel)
    if (memorized !== undefined) {
      const isMemorized = Boolean(memorized)
      updateData.memorized = isMemorized

      if (isMemorized) {
        let autoTrans = existingLog.autoTranslation
        if (!autoTrans) {
          const direction = existingLog.langDirection || "en-id"
          const fromLang = direction.split("-")[0] || "en"
          const toLang = direction.split("-")[1] || "id"
          try {
            autoTrans = await translateText(existingLog.word, fromLang, toLang, false)
            if (autoTrans) {
              updateData.autoTranslation = autoTrans
            }
          } catch (err) {
            console.error("Auto translation error during patch:", err)
          }
        }

        if (autoTrans && existingLog.translation.trim().toLowerCase() !== autoTrans.trim().toLowerCase()) {
          updateData.translation = autoTrans
        }
      }
    }

    if (translation !== undefined && !updateData.translation) {
      updateData.translation = String(translation)
    }

    const [updatedLog] = await db
      .update(vocabularyLogs)
      .set(updateData)
      .where(and(eq(vocabularyLogs.id, id), eq(vocabularyLogs.userId, user.id)))
      .returning()

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
