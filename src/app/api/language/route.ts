import { NextResponse } from "next/server"
import { apiError } from "@/lib/apiError"
import { db } from "@/lib/db"
import { vocabularyLogs } from "@/types/schema"
import { eq, and, asc, sql } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { conjugateVerb } from "@/lib/verbs"

function isValidMastery(value: unknown): boolean {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 && n <= 5
}

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
    return apiError(error)
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

    if (typeof word !== "string" || typeof translation !== "string" || !word.trim() || !translation.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (masteryLevel !== undefined && !isValidMastery(masteryLevel)) {
      return NextResponse.json({ error: "Invalid mastery level" }, { status: 400 })
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

    // Verb conjugation
    let v1Val: string | null = null
    let v2Val: string | null = null
    let v3Val: string | null = null
    let vIngVal: string | null = null

    if (pos.toLowerCase() === "verb") {
      const conjugated = conjugateVerb(word)
      v1Val = word.trim()
      v2Val = conjugated.v2
      v3Val = conjugated.v3
      vIngVal = conjugated.vIng
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
        v1: v1Val,
        v2: v2Val,
        v3: v3Val,
        vIng: vIngVal,
        langDirection: direction,
      })
      .returning()

    return NextResponse.json(newLog)
  } catch (error) {
    return apiError(error)
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
      memorizedAt?: Date | null
      translation?: string
    } = {}

    if (masteryLevel !== undefined) {
      if (!isValidMastery(masteryLevel)) {
        return NextResponse.json({ error: "Invalid mastery level" }, { status: 400 })
      }
      updateData.masteryLevel = Number(masteryLevel)
    }
    if (translation !== undefined) {
      updateData.translation = String(translation)
    }

    if (memorized !== undefined) {
      const isMemorized = Boolean(memorized)
      updateData.memorized = isMemorized
      updateData.memorizedAt = isMemorized ? new Date() : null
    }

    const [updatedLog] = await db
      .update(vocabularyLogs)
      .set(updateData)
      .where(and(eq(vocabularyLogs.id, id), eq(vocabularyLogs.userId, user.id)))
      .returning()

    return NextResponse.json(updatedLog)
  } catch (error) {
    return apiError(error)
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
    return apiError(error)
  }
}
