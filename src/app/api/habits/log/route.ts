import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { habitLogs } from "@/types/schema"
import { eq, and } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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
    const { habitId, date, status = "completed" } = body

    if (!habitId || !date) {
      return NextResponse.json({ error: "habitId and date are required" }, { status: 400 })
    }

    // Check if a log already exists for this habit and date
    const [existingLog] = await db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.userId, user.id),
          eq(habitLogs.habitId, habitId),
          eq(habitLogs.date, date)
        )
      )

    if (existingLog) {
      // Toggle off: Delete existing entry
      await db
        .delete(habitLogs)
        .where(eq(habitLogs.id, existingLog.id))
      
      return NextResponse.json({ toggled: false })
    } else {
      // Toggle on: Insert new check-in
      const [newLog] = await db
        .insert(habitLogs)
        .values({
          userId: user.id,
          habitId,
          date,
          status,
        })
        .returning()

      return NextResponse.json({ toggled: true, log: newLog })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
