import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { habits, habitLogs } from "@/types/schema"
import { eq, and, gte, lte, asc, sql, inArray } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isValidUUIDArray } from "@/lib/utils"

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
      .orderBy(asc(habits.orderIndex), asc(habits.createdAt))

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
    const { name, category, subCategory, frequency } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Determine the next order index (max order index + 1)
    const maxOrderRes = await db
      .select({ maxOrder: sql<number>`max(${habits.orderIndex})` })
      .from(habits)
      .where(eq(habits.userId, user.id))
    const maxOrder = maxOrderRes[0]?.maxOrder ?? -1
    const nextOrder = maxOrder + 1

    const [newHabit] = await db
      .insert(habits)
      .values({
        userId: user.id,
        name,
        category: category || "General",
        subCategory: subCategory || null,
        frequency: frequency || "daily",
        orderIndex: nextOrder,
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

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderedIds } = body

    if (!isValidUUIDArray(orderedIds)) {
      return NextResponse.json(
        { error: "orderedIds is required and must be an array of valid UUID strings" },
        { status: 400 }
      )
    }

    // Update all habits with their new orderIndex in a single batch query
    await db.transaction(async (tx) => {
      if (orderedIds.length === 0) return

      const sqlChunks = [sql`CASE`]
      for (let i = 0; i < orderedIds.length; i++) {
        sqlChunks.push(sql`WHEN ${habits.id} = ${orderedIds[i]} THEN ${i}::integer`)
      }
      sqlChunks.push(sql`END`)

      const finalSql = sql.join(sqlChunks, sql` `)

      await tx
        .update(habits)
        .set({ orderIndex: finalSql })
        .where(and(inArray(habits.id, orderedIds), eq(habits.userId, user.id)))
    })

    return NextResponse.json({ success: true })
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
    const { id, name, category, subCategory, frequency } = body

    if (!id || !name) {
      return NextResponse.json({ error: "Habit ID and Name are required" }, { status: 400 })
    }

    const [updatedHabit] = await db
      .update(habits)
      .set({
        name: name.trim(),
        category: category || "General",
        subCategory: subCategory || null,
        frequency: frequency || "daily",
      })
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
      .returning()

    if (!updatedHabit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    return NextResponse.json(updatedHabit)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
