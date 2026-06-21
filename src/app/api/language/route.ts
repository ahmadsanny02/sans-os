import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { vocabularyLogs } from "@/types/schema"
import { eq, and, asc, sql } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { translateText } from "@/lib/translate"

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
        if (!log.autoTranslation) {
          const auto = await translateText(log.word)
          if (auto) {
            await db
              .update(vocabularyLogs)
              .set({ autoTranslation: auto })
              .where(and(eq(vocabularyLogs.id, log.id), eq(vocabularyLogs.userId, user.id)))
            return { ...log, autoTranslation: auto }
          }
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
    const { word, partOfSpeech, definition, translation, exampleSentence, masteryLevel } = body

    if (!word || !translation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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

    const autoTranslation = await translateText(word)

    const [newLog] = await db
      .insert(vocabularyLogs)
      .values({
        userId: user.id,
        word: word.trim(),
        partOfSpeech: partOfSpeech || "n/a",
        definition: definition || "n/a",
        translation: translation.trim(),
        exampleSentence: exampleSentence ? exampleSentence.trim() : null,
        masteryLevel: masteryLevel !== undefined ? Number(masteryLevel) : 3,
        memorized: false,
        autoTranslation,
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
