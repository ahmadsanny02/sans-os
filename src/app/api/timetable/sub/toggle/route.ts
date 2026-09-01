import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { timetableSubSchedules } from "@/types/schema"
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
    const { id, completed, date } = body

    if (!id || completed === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const now = new Date()
    const defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

    const [updated] = await db
      .update(timetableSubSchedules)
      .set({
        completed,
        completedDate: completed ? (date || defaultDate) : null,
      })
      .where(and(eq(timetableSubSchedules.id, id), eq(timetableSubSchedules.userId, user.id)))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Sub-schedule not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
