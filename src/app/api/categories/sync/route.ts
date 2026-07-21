import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { habits, timetableBlocks, priorities } from "@/types/schema"
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
    const { action, oldName, newName } = body

    if (!action || !oldName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (action === "rename") {
      if (!newName) {
        return NextResponse.json({ error: "newName is required for rename action" }, { status: 400 })
      }

      // Rename categories across all tables for this user
      await db
        .update(habits)
        .set({ category: newName })
        .where(and(eq(habits.userId, user.id), eq(habits.category, oldName)))

      await db
        .update(timetableBlocks)
        .set({ category: newName })
        .where(and(eq(timetableBlocks.userId, user.id), eq(timetableBlocks.category, oldName)))

      await db
        .update(priorities)
        .set({ category: newName })
        .where(and(eq(priorities.userId, user.id), eq(priorities.category, oldName)))
    } else if (action === "delete") {
      // Fallback deleted categories to 'General'
      await db
        .update(habits)
        .set({ category: "General" })
        .where(and(eq(habits.userId, user.id), eq(habits.category, oldName)))

      await db
        .update(timetableBlocks)
        .set({ category: "General" })
        .where(and(eq(timetableBlocks.userId, user.id), eq(timetableBlocks.category, oldName)))

      await db
        .update(priorities)
        .set({ category: "General" })
        .where(and(eq(priorities.userId, user.id), eq(priorities.category, oldName)))
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
