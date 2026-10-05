import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { projectSubTasks } from "@/types/schema"
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

    if (!id || typeof completed !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [updatedSubTask] = await db
      .update(projectSubTasks)
      .set({
        completed,
        status: completed ? "Completed" : "In Progress",
      })
      .where(and(eq(projectSubTasks.id, id), eq(projectSubTasks.userId, user.id)))
      .returning()

    if (!updatedSubTask) {
      return NextResponse.json({ error: "Sub-task not found" }, { status: 404 })
    }

    return NextResponse.json(updatedSubTask)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
