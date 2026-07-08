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
    const { projectId, name, priority, deadline } = body

    if (!projectId || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newTask] = await db
      .insert(projectTasks)
      .values({
        userId: user.id,
        projectId,
        name,
        completed: false,
        priority: priority || "Medium",
        deadline: deadline ? new Date(deadline) : null,
      })
      .returning()

    return NextResponse.json(newTask)
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
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 })
    }

    const [deletedTask] = await db
      .delete(projectTasks)
      .where(and(eq(projectTasks.id, id), eq(projectTasks.userId, user.id)))
      .returning()

    if (!deletedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

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
    const { id, name, completed, priority, deadline } = body

    if (!id) {
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 })
    }

    const updateFields: {
      name?: string
      completed?: boolean
      priority?: string
      deadline?: Date | null
    } = {}

    if (name !== undefined) updateFields.name = name
    if (completed !== undefined) updateFields.completed = completed
    if (priority !== undefined) updateFields.priority = priority
    if (deadline !== undefined) {
      updateFields.deadline = deadline ? new Date(deadline) : null
    }

    const [updatedTask] = await db
      .update(projectTasks)
      .set(updateFields)
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
