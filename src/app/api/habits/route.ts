import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { habits, habitLogs } from "@/types/schema"
import { eq, and, gte, lte } from "drizzle-orm"
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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Fetch habits belonging to the user
    const userHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.userId, user.id))

    if (!startDate || !endDate) {
      return NextResponse.json({ habits: userHabits, logs: [] })
    }

    // Fetch logs within date boundaries
    const logs = await db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.userId, user.id),
          gte(habitLogs.date, startDate),
          lte(habitLogs.date, endDate)
        )
      )

    return NextResponse.json({ habits: userHabits, logs })
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
    const { name, category, frequency } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const [newHabit] = await db
      .insert(habits)
      .values({
        userId: user.id,
        name,
        category: category || "General",
        frequency: frequency || "daily",
      })
      .returning()

    return NextResponse.json(newHabit)
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
      return NextResponse.json({ error: "Habit ID is required" }, { status: 400 })
    }

    await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
