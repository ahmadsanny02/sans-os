import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { timetableBlocks } from "@/types/schema"
import { eq, and, asc } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blocks = await db
      .select()
      .from(timetableBlocks)
      .where(eq(timetableBlocks.userId, user.id))
      .orderBy(asc(timetableBlocks.dayOfWeek), asc(timetableBlocks.startTime))

    return NextResponse.json(blocks)
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
    const { dayOfWeek, startTime, endTime, title, category, color, date } = body

    if (dayOfWeek === undefined || !startTime || !endTime || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newBlock] = await db
      .insert(timetableBlocks)
      .values({
        userId: user.id,
        dayOfWeek,
        startTime,
        endTime,
        title,
        category: category || "General",
        color: color || "blue",
        date: date || null,
      })
      .returning()

    return NextResponse.json(newBlock)
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
      return NextResponse.json({ error: "Missing block ID" }, { status: 400 })
    }

    const [deletedBlock] = await db
      .delete(timetableBlocks)
      .where(and(eq(timetableBlocks.id, id), eq(timetableBlocks.userId, user.id)))
      .returning()

    if (!deletedBlock) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
