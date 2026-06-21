import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { writingLogs } from "@/types/schema"
import { eq, and, desc } from "drizzle-orm"
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

    // On-the-fly backfill for older writing logs
    const updatedLogs = await Promise.all(
      logs.map(async (log) => {
        if (!log.autoTranslation) {
          const auto = await translateText(log.englishSentence)
          if (auto) {
            await db
              .update(writingLogs)
              .set({ autoTranslation: auto })
              .where(and(eq(writingLogs.id, log.id), eq(writingLogs.userId, user.id)))
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
    const { vocabId, vocabWord, sentenceType, englishSentence, indonesianTranslation } = body

    if (!englishSentence || !indonesianTranslation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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

    const [deletedLog] = await db
      .delete(writingLogs)
      .where(and(eq(writingLogs.id, id), eq(writingLogs.userId, user.id)))
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
