import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { priorities, timetableBlocks } from "@/types/schema"
import { eq, and, lt, asc, sql, gte, lte } from "drizzle-orm"
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
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")
    let today = searchParams.get("today")

    if (startDateParam && endDateParam) {
      const rangePriorities = await db
        .select()
        .from(priorities)
        .where(
          and(
            eq(priorities.userId, user.id),
            gte(priorities.date, startDateParam),
            lte(priorities.date, endDateParam)
          )
        )
        .orderBy(asc(priorities.date), asc(priorities.orderIndex))

      return NextResponse.json(rangePriorities)
    }

    if (!dateParam) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    if (!today) {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const day = String(now.getDate()).padStart(2, "0")
      today = `${year}-${month}-${day}`
    }

    // Auto-rollover: Find incomplete priorities from before the real today's date and move to real today's date
    await db
      .update(priorities)
      .set({
        date: today,
        rolloverCount: sql`${priorities.rolloverCount} + 1`,
      })
      .where(
        and(
          eq(priorities.userId, user.id),
          eq(priorities.completed, false),
          lt(priorities.date, today)
        )
      )

    // Now query all priorities for the target date
    const dailyPriorities = await db
      .select()
      .from(priorities)
      .where(and(eq(priorities.userId, user.id), eq(priorities.date, dateParam)))
      .orderBy(asc(priorities.orderIndex))

    // Self-healing: Find custom timetable blocks for this user and date that are not in priorities
    const customBlocks = await db
      .select()
      .from(timetableBlocks)
      .where(
        and(
          eq(timetableBlocks.userId, user.id),
          eq(timetableBlocks.date, dateParam)
        )
      )

    const currentPriorities = [...dailyPriorities]
    let hasInsertedNew = false

    for (const block of customBlocks) {
      const exists = currentPriorities.some((p) => p.text === block.title)
      if (!exists && currentPriorities.length < 5) {
        try {
          const [newPriority] = await db
            .insert(priorities)
            .values({
              userId: user.id,
              date: dateParam,
              text: block.title,
              orderIndex: currentPriorities.length,
              completed: false,
              rolloverCount: 0,
            })
            .returning()
          currentPriorities.push(newPriority)
          hasInsertedNew = true
        } catch (err) {
          console.error("Failed to self-heal auto-insert priority:", err)
        }
      }
    }

    if (hasInsertedNew) {
      currentPriorities.sort((a, b) => a.orderIndex - b.orderIndex)
    }

    return NextResponse.json(currentPriorities)
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
    const { date, text, orderIndex, link } = body

    if (!date || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check how many priorities exist for this date
    const currentPriorities = await db
      .select()
      .from(priorities)
      .where(and(eq(priorities.userId, user.id), eq(priorities.date, date)))

    if (currentPriorities.length >= 5) {
      return NextResponse.json(
        { error: "Only 5 priorities are allowed per day" },
        { status: 400 }
      )
    }

    const finalOrderIndex = orderIndex !== undefined ? orderIndex : currentPriorities.length

    const [newPriority] = await db
      .insert(priorities)
      .values({
        userId: user.id,
        date,
        text,
        orderIndex: finalOrderIndex,
        completed: false,
        rolloverCount: 0,
        link: link || null,
      })
      .returning()

    return NextResponse.json(newPriority)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
