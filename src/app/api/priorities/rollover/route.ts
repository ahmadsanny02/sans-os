import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { priorities } from "@/types/schema"
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
      // Auto-rollover: Find incomplete priorities from before today
      const oldIncomplete = await tx
        .select()
        .from(priorities)
        .where(
          and(
            eq(priorities.userId, user.id),
            eq(priorities.completed, false),
            lt(priorities.date, today!)
          )
        )
        .orderBy(asc(priorities.date), asc(priorities.orderIndex))

      if (oldIncomplete.length === 0) {
        return 0
      }

      const todayPriorities = await tx
        .select()
        .from(priorities)
        .where(
          and(
            eq(priorities.userId, user.id),
            eq(priorities.date, today!)
          )
        )

      const availableSlots = 5 - todayPriorities.length
      if (availableSlots <= 0) {
        return 0
      }

      const toRollover = oldIncomplete.slice(0, availableSlots)
      let nextIndex = todayPriorities.length

      for (const item of toRollover) {
        await tx
          .update(priorities)
          .set({
            date: today!,
            orderIndex: nextIndex++,
            rolloverCount: (item.rolloverCount || 0) + 1,
          })
          .where(
            and(
              eq(priorities.id, item.id),
              eq(priorities.userId, user.id),
              lt(priorities.date, today!)
            )
          )
      }

      return toRollover.length
    })

    return NextResponse.json({ success: true, rolledOverCount })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
