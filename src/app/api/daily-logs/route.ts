import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dailyLogs } from "@/types/schema"
import { eq, and } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

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

    if (!dateParam || !DATE_REGEX.test(dateParam)) {
      return NextResponse.json({ error: "Valid date parameter (YYYY-MM-DD) is required" }, { status: 400 })
    }

    const [log] = await db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, user.id), eq(dailyLogs.date, dateParam)))
      .limit(1)

    return NextResponse.json(log || null)
  } catch (error) {
    logger.error("[GET /api/daily-logs] Exception:", error)
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

    if (!date || !DATE_REGEX.test(date)) {
      return NextResponse.json({ error: "Valid date parameter (YYYY-MM-DD) is required" }, { status: 400 })
    }

    const updateSet: Partial<typeof dailyLogs.$inferInsert> = {}
    if (journal !== undefined) updateSet.journal = journal
    if (notes !== undefined) updateSet.notes = notes
    if (gratitude !== undefined) updateSet.gratitude = gratitude
    if (picUrl !== undefined) updateSet.picUrl = picUrl

    if (Object.keys(updateSet).length === 0) {
      updateSet.date = date
    }

    const [resultLog] = await db
      .insert(dailyLogs)
      .values({
        userId: user.id,
        date,
        journal: journal || "",
        notes: notes || "",
        gratitude: gratitude || "",
        picUrl: picUrl || "",
      })
      .onConflictDoUpdate({
        target: [dailyLogs.userId, dailyLogs.date],
        set: updateSet,
      })
      .returning()

    return NextResponse.json(resultLog)
  } catch (error) {
    logger.error("[POST /api/daily-logs] Exception:", error)
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
