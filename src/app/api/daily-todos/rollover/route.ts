import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dailyTodos } from "@/types/schema"
import { eq, and, lt, asc } from "drizzle-orm"
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

    const rolledOverCount = await db.transaction(async (tx) => {
      const oldIncomplete = await tx
        .select()
        .from(dailyTodos)
        .where(
          and(
            eq(dailyTodos.userId, user.id),
            eq(dailyTodos.completed, false),
            lt(dailyTodos.date, today!)
          )
        )
        .orderBy(asc(dailyTodos.date), asc(dailyTodos.createdAt))

      if (oldIncomplete.length === 0) {
        return 0
      }

      for (const item of oldIncomplete) {
        await tx
          .update(dailyTodos)
          .set({
            date: today!,
            rolloverCount: (item.rolloverCount || 0) + 1,
          })
          .where(
            and(
              eq(dailyTodos.id, item.id),
              eq(dailyTodos.userId, user.id),
              lt(dailyTodos.date, today!)
            )
          )
      }

      return oldIncomplete.length
    })

    return NextResponse.json({ success: true, rolledOverCount })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
