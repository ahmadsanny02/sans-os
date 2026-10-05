import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { projectTasks, projects } from "@/types/schema"
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
    const { projectId, name, status, priority, deadline } = body

    if (!projectId || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify project ownership
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
      .limit(1)

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 })
    }

    const taskStatus = status || "Planning"
    const [newTask] = await db
      .insert(projectTasks)
      .values({
        userId: user.id,
        projectId,
        name,
        status: taskStatus,
        completed: taskStatus === "Completed",
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
    const { id, name, status, completed, priority, deadline } = body

    if (!id) {
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 })
    }

    const updateFields: {
      name?: string
      status?: string
      completed?: boolean
      priority?: string
      deadline?: Date | null
    } = {}

    if (name !== undefined) updateFields.name = name
    if (status !== undefined) {
      updateFields.status = status
      if (completed === undefined) {
        updateFields.completed = status === "Completed"
      }
    }
    if (completed !== undefined) {
      updateFields.completed = completed
      if (status === undefined) {
        updateFields.status = completed ? "Completed" : "In Progress"
      }
    }
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
