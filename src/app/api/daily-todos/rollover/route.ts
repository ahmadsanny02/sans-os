import { NextResponse } from "next/server"
import { apiError } from "@/lib/apiError"
import { db } from "@/lib/db"
import { dailyTodos } from "@/types/schema"
import { eq, and, lt, sql } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let today: string | undefined
    try {
      const body = await request.json()
      today = body?.today
    } catch {
      // Body may be empty
    }

    if (today && !DATE_REGEX.test(today)) {
      return NextResponse.json({ error: "Format parameter today harus YYYY-MM-DD" }, { status: 400 })
    }

    if (!today) {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const day = String(now.getDate()).padStart(2, "0")
      today = `${year}-${month}-${day}`
    }

    const rolledOver = await db
      .update(dailyTodos)
      .set({ date: today, rolloverCount: sql`coalesce(${dailyTodos.rolloverCount}, 0) + 1` })
      .where(
        and(
          eq(dailyTodos.userId, user.id),
          eq(dailyTodos.completed, false),
          lt(dailyTodos.date, today)
        )
      )
      .returning({ id: dailyTodos.id })
    const rolledOverCount = rolledOver.length

    return NextResponse.json({ success: true, rolledOverCount })
  } catch (error) {
    return apiError(error)
  }
}
