import { NextResponse } from "next/server"
import { apiError } from "@/lib/apiError"
import { db } from "@/lib/db"
import { readingJournal, readingProgressLogs } from "@/types/schema"
import { eq, and, desc, ne } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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
    const bookId = searchParams.get("bookId")

    if (!bookId) {
      return NextResponse.json({ error: "Missing bookId parameter" }, { status: 400 })
    }

    const logs = await db
      .select()
      .from(readingProgressLogs)
      .where(and(eq(readingProgressLogs.bookId, bookId), eq(readingProgressLogs.userId, user.id)))
      .orderBy(desc(readingProgressLogs.createdAt))

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
    const { bookId, progress, notes } = body

    if (!bookId || !progress) {
      return NextResponse.json({ error: "Missing bookId or progress content" }, { status: 400 })
    }

    // Check if book exists and belongs to user
    const [book] = await db
      .select()
      .from(readingJournal)
      .where(and(eq(readingJournal.id, bookId), eq(readingJournal.userId, user.id)))

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    const updateValues: Partial<typeof readingJournal.$inferInsert> = {}
    // A finished book keeps its cleared progress; otherwise track it and move To Read to Reading
    if (book.status !== "Completed") updateValues.currentProgress = progress.trim()
    if (book.status === "To Read") updateValues.status = "Reading"

    const newLog = await db.transaction(async (tx) => {
      const [log] = await tx
        .insert(readingProgressLogs)
        .values({
          userId: user.id,
          bookId,
          progress: progress.trim(),
          notes: notes ? notes.trim() : null,
        })
        .returning()

      if (Object.keys(updateValues).length > 0) {
        await tx
          .update(readingJournal)
          .set(updateValues)
          .where(and(eq(readingJournal.id, bookId), eq(readingJournal.userId, user.id)))
      }
      return log
    })

    return NextResponse.json(newLog)
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

    const deletedLog = await db.transaction(async (tx) => {
      const [deleted] = await tx
        .delete(readingProgressLogs)
        .where(and(eq(readingProgressLogs.id, id), eq(readingProgressLogs.userId, user.id)))
        .returning()
      if (!deleted) return null

      const [latest] = await tx
        .select({ progress: readingProgressLogs.progress })
        .from(readingProgressLogs)
        .where(and(eq(readingProgressLogs.bookId, deleted.bookId), eq(readingProgressLogs.userId, user.id)))
        .orderBy(desc(readingProgressLogs.createdAt))
        .limit(1)

      await tx
        .update(readingJournal)
        .set({ currentProgress: latest?.progress ?? null })
        .where(
          and(
            eq(readingJournal.id, deleted.bookId),
            eq(readingJournal.userId, user.id),
            ne(readingJournal.status, "Completed")
          )
        )
      return deleted
    })

    if (!deletedLog) {
      return NextResponse.json({ error: "Progress log not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
