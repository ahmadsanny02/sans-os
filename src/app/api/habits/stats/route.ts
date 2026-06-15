import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { habits, habitLogs } from "@/types/schema"
import { eq, and, like } from "drizzle-orm"
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
    const month = searchParams.get("month") // format "YYYY-MM"

    if (!month) {
      return NextResponse.json({ error: "month parameter (YYYY-MM) is required" }, { status: 400 })
    }

    // Get all user habits
    const userHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, user.id))

    // Get all logs in the selected month
    const monthlyLogs = await db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.userId, user.id),
          like(habitLogs.date, `${month}-%`)
        )
      )

    const totalHabits = userHabits.length
    const completedCount = monthlyLogs.filter((log) => log.status === "completed").length

    return NextResponse.json({
      totalHabits,
      completedCount,
      logs: monthlyLogs,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
