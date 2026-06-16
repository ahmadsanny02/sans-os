import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dailyLogs } from "@/types/schema"
import { eq, and } from "drizzle-orm"
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
    const dateParam = searchParams.get("date") // format "YYYY-MM-DD"

    if (!dateParam) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    const [log] = await db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, user.id), eq(dailyLogs.date, dateParam)))
      .limit(1)

    return NextResponse.json(log || null)
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
    const { date, journal, notes, gratitude, picUrl } = body

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    // Check if a log already exists for this date
    const [existingLog] = await db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, user.id), eq(dailyLogs.date, date)))
      .limit(1)

    let resultLog

    if (existingLog) {
      // Perform update
      const updateData: Partial<typeof dailyLogs.$inferInsert> = {}
      if (journal !== undefined) updateData.journal = journal
      if (notes !== undefined) updateData.notes = notes
      if (gratitude !== undefined) updateData.gratitude = gratitude
      if (picUrl !== undefined) updateData.picUrl = picUrl

      const [updatedLog] = await db
        .update(dailyLogs)
        .set(updateData)
        .where(eq(dailyLogs.id, existingLog.id))
        .returning()
      
      resultLog = updatedLog
    } else {
      // Perform insert
      const [newLog] = await db
        .insert(dailyLogs)
        .values({
          userId: user.id,
          date,
          journal: journal || "",
          notes: notes || "",
          gratitude: gratitude || "",
          picUrl: picUrl || "",
        })
        .returning()
      
      resultLog = newLog
    }

    return NextResponse.json(resultLog)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
