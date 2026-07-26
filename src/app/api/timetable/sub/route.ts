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
    const { timetableBlockId, title, startTime, endTime } = body

    if (!timetableBlockId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newSubSchedule] = await db
      .insert(timetableSubSchedules)
      .values({
        userId: user.id,
        timetableBlockId,
        title: title.trim(),
        startTime: startTime || null,
        endTime: endTime || null,
        completed: false,
      })
      .returning()

    return NextResponse.json(newSubSchedule)
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
    const { id, title, startTime, endTime } = body

    if (!id) {
      return NextResponse.json({ error: "Missing sub-schedule ID" }, { status: 400 })
    }

    const updateData: Partial<typeof timetableSubSchedules.$inferInsert> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (startTime !== undefined) updateData.startTime = startTime || null
    if (endTime !== undefined) updateData.endTime = endTime || null

    const [updated] = await db
      .update(timetableSubSchedules)
      .set(updateData)
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
      return NextResponse.json({ error: "Missing sub-schedule ID" }, { status: 400 })
    }

    const [deleted] = await db
      .delete(timetableSubSchedules)
      .where(and(eq(timetableSubSchedules.id, id), eq(timetableSubSchedules.userId, user.id)))
      .returning()

    if (!deleted) {
      return NextResponse.json({ error: "Sub-schedule not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
