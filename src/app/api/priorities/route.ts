import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { priorities, timetableBlocks } from "@/types/schema"
import { eq, and, lt, asc, gte, lte } from "drizzle-orm"
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
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")
    let today = searchParams.get("today")

    if (startDateParam || endDateParam) {
      if (!startDateParam || !endDateParam || !DATE_REGEX.test(startDateParam) || !DATE_REGEX.test(endDateParam)) {
        return NextResponse.json({ error: "Format parameter startDate dan endDate harus YYYY-MM-DD" }, { status: 400 })
      }

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

    if (!dateParam || !DATE_REGEX.test(dateParam)) {
      return NextResponse.json({ error: "Format parameter date harus YYYY-MM-DD" }, { status: 400 })
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

    // Auto-rollover: Find incomplete priorities from before the real today's date and move to real today's date, respecting the limit of 5.
    const oldIncomplete = await db
      .select()
      .from(priorities)
      .where(
        and(
          eq(priorities.userId, user.id),
          eq(priorities.completed, false),
          lt(priorities.date, today)
        )
      )
      .orderBy(asc(priorities.date), asc(priorities.orderIndex))

    if (oldIncomplete.length > 0) {
      const todayPriorities = await db
        .select()
        .from(priorities)
        .where(
          and(
            eq(priorities.userId, user.id),
            eq(priorities.date, today)
          )
        )

      const availableSlots = 5 - todayPriorities.length
      if (availableSlots > 0) {
        const toRollover = oldIncomplete.slice(0, availableSlots)
        let nextIndex = todayPriorities.length

        await db.transaction(async (tx) => {
          for (const item of toRollover) {
            await tx
              .update(priorities)
              .set({
                date: today,
                orderIndex: nextIndex++,
                rolloverCount: (item.rolloverCount || 0) + 1,
              })
              .where(
                and(
                  eq(priorities.id, item.id),
                  eq(priorities.userId, user.id),
                  lt(priorities.date, today)
                )
              )
          }
        })
      }
    }

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
              category: block.category || "General",
              orderIndex: currentPriorities.length,
              completed: false,
              rolloverCount: 0,
            })
            .returning()
          currentPriorities.push(newPriority)
          hasInsertedNew = true
        } catch (err) {
          logger.error("Failed to self-heal auto-insert priority:", err)
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
    const { date, text, orderIndex, link, category, subCategory } = body

    if (!date || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!DATE_REGEX.test(date)) {
      return NextResponse.json({ error: "Format parameter date harus YYYY-MM-DD" }, { status: 400 })
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
        category: category || "General",
        subCategory: subCategory || null,
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

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, text, link, category, subCategory, date, completed } = body

    if (!id) {
      return NextResponse.json({ error: "Missing priority ID" }, { status: 400 })
    }

    const [existing] = await db
      .select()
      .from(priorities)
      .where(and(eq(priorities.id, id), eq(priorities.userId, user.id)))

    if (!existing) {
      return NextResponse.json({ error: "Priority not found" }, { status: 404 })
    }

    const updateData: Partial<typeof priorities.$inferInsert> = {}
    if (completed !== undefined) {
      updateData.completed = completed
    }
    if (text !== undefined) {
      updateData.text = text
    }
    if (link !== undefined) {
      updateData.link = link || null
    }
    if (category !== undefined) {
      updateData.category = category
    }
    if (subCategory !== undefined) {
      updateData.subCategory = subCategory || null
    }
    if (date !== undefined && date !== existing.date) {
      if (!DATE_REGEX.test(date)) {
        return NextResponse.json({ error: "Format parameter date harus YYYY-MM-DD" }, { status: 400 })
      }

      const targetPriorities = await db
        .select()
        .from(priorities)
        .where(and(eq(priorities.userId, user.id), eq(priorities.date, date)))

      if (targetPriorities.length >= 5) {
        return NextResponse.json(
          { error: "Only 5 priorities are allowed per day" },
          { status: 400 }
        )
      }
      updateData.date = date
      updateData.orderIndex = targetPriorities.length
    }

    const [updatedPriority] = await db
      .update(priorities)
      .set(updateData)
      .where(and(eq(priorities.id, id), eq(priorities.userId, user.id)))
      .returning()

    return NextResponse.json(updatedPriority)
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
      return NextResponse.json({ error: "Missing priority ID" }, { status: 400 })
    }

    const [deletedPriority] = await db
      .delete(priorities)
      .where(and(eq(priorities.id, id), eq(priorities.userId, user.id)))
      .returning()

    if (!deletedPriority) {
      return NextResponse.json({ error: "Priority not found" }, { status: 404 })
    }

    // Re-index remaining priorities for this date to maintain contiguous orderIndex
    try {
      const remaining = await db
        .select({ id: priorities.id })
        .from(priorities)
        .where(and(eq(priorities.userId, user.id), eq(priorities.date, deletedPriority.date)))
        .orderBy(asc(priorities.orderIndex), asc(priorities.createdAt))

      if (remaining.length > 0) {
        await db.transaction(async (tx) => {
          for (let i = 0; i < remaining.length; i++) {
            await tx
              .update(priorities)
              .set({ orderIndex: i })
              .where(and(eq(priorities.id, remaining[i].id), eq(priorities.userId, user.id)))
          }
        })
      }
    } catch (err) {
      logger.error("Failed to re-index priorities after delete:", err)
    }

    // Automatically remove matching custom timetable block if it exists to keep in sync
    try {
      await db
        .delete(timetableBlocks)
        .where(
          and(
            eq(timetableBlocks.userId, user.id),
            eq(timetableBlocks.date, deletedPriority.date),
            eq(timetableBlocks.title, deletedPriority.text)
          )
        )
    } catch (err) {
      logger.error("Failed to auto-delete timetable block matching priority:", err)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
