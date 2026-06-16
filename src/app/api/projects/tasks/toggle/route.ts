import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { projectTasks } from "@/types/schema"
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
    const { id, completed } = body

    if (!id || completed === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [updatedTask] = await db
      .update(projectTasks)
      .set({ completed })
      .where(and(eq(projectTasks.id, id), eq(projectTasks.userId, user.id)))
      .returning()

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
