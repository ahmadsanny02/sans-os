import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { writingLogs, vocabularyLogs, formulas } from "@/types/schema"
import { eq, and, desc, inArray } from "drizzle-orm"
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
      .from(writingLogs)
      .where(eq(writingLogs.userId, user.id))
      .orderBy(desc(writingLogs.createdAt))

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
    const { vocabId, vocabWord, sentenceType, englishSentence, indonesianTranslation, formulaId, formula } = body

    if (!englishSentence || !indonesianTranslation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify vocab ownership if vocabId is provided
    if (vocabId) {
      const [vocab] = await db
        .select({ id: vocabularyLogs.id })
        .from(vocabularyLogs)
        .where(and(eq(vocabularyLogs.id, vocabId), eq(vocabularyLogs.userId, user.id)))
        .limit(1)

      if (!vocab) {
        return NextResponse.json({ error: "Vocabulary not found or unauthorized" }, { status: 404 })
      }
    }

    // Verify formula ownership if formulaId is provided
    if (formulaId) {
      const [f] = await db
        .select({ id: formulas.id })
        .from(formulas)
        .where(and(eq(formulas.id, formulaId), eq(formulas.userId, user.id)))
        .limit(1)

      if (!f) {
        return NextResponse.json({ error: "Formula not found or unauthorized" }, { status: 404 })
      }
    }

    const autoTranslation = await translateText(englishSentence)

    const [newLog] = await db
      .insert(writingLogs)
      .values({
        userId: user.id,
        vocabId: vocabId || null,
        vocabWord: vocabWord || null,
        sentenceType: sentenceType || null,
        englishSentence,
        indonesianTranslation,
        autoTranslation,
        formulaId: formulaId || null,
        formula: formula || null,
      })
      .returning()

    return NextResponse.json(newLog)
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

    const ids = id.split(",")

    const deletedLogs = await db
      .delete(writingLogs)
      .where(and(inArray(writingLogs.id, ids), eq(writingLogs.userId, user.id)))
      .returning()

    if (deletedLogs.length === 0) {
      return NextResponse.json({ error: "Logs not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
