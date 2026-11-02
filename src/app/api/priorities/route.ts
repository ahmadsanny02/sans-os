import { NextResponse } from "next/server"
import { apiError } from "@/lib/apiError"
import { db } from "@/lib/db"
import { priorities, timetableBlocks } from "@/types/schema"
import { eq, and, asc, gte, lte, sql } from "drizzle-orm"
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

    const dailyPriorities = await db
      .select()
      .from(priorities)
      .where(and(eq(priorities.userId, user.id), eq(priorities.date, dateParam)))
      .orderBy(asc(priorities.orderIndex))

    return NextResponse.json(dailyPriorities)
  } catch (error) {
    return apiError(error)
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

    const newPriority = await db.transaction(async (tx) => {
      // Serializes concurrent creates for this user and date so the daily limit holds
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${user.id + date}))`)

      const current = await tx
        .select({ orderIndex: priorities.orderIndex })
        .from(priorities)
        .where(and(eq(priorities.userId, user.id), eq(priorities.date, date)))

      if (current.length >= 5) return null

      const [created] = await tx
        .insert(priorities)
        .values({
          userId: user.id,
          date,
          text,
          category: category || "General",
          subCategory: subCategory || null,
          orderIndex:
            Number.isInteger(orderIndex) && orderIndex >= 0
              ? orderIndex
              : current.reduce((next, p) => Math.max(next, p.orderIndex + 1), 0),
          completed: false,
          rolloverCount: 0,
          link: link || null,
        })
        .returning()
      return created
    })

    if (!newPriority) {
      return NextResponse.json({ error: "Only 5 priorities are allowed per day" }, { status: 400 })
    }

    return NextResponse.json(newPriority)
  } catch (error) {
    return apiError(error)
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
    return apiError(error)
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
      if (deletedPriority.timetableBlockId) {
        await db
          .delete(timetableBlocks)
          .where(
            and(
              eq(timetableBlocks.userId, user.id),
              eq(timetableBlocks.id, deletedPriority.timetableBlockId)
            )
          )
      }
    } catch (err) {
      logger.error("Failed to auto-delete timetable block matching priority:", err)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
