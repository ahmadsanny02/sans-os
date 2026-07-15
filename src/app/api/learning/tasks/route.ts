import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { learningTasks, learningSubjects } from "@/types/schema"
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
    const { subjectId, title, dueDate } = body

    if (!subjectId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify subject ownership
    const [subject] = await db
      .select()
      .from(learningSubjects)
      .where(and(eq(learningSubjects.id, subjectId), eq(learningSubjects.userId, user.id)))

    if (!subject) {
      return NextResponse.json({ error: "Subject not found or unauthorized" }, { status: 404 })
    }

    const [newTask] = await db
      .insert(learningTasks)
      .values({
        subjectId,
        title,
        completed: false,
        dueDate: dueDate ? new Date(dueDate) : null,
      })
      .returning()

    return NextResponse.json(newTask)
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
    const { id, title, completed, dueDate } = body

    if (!id) {
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 })
    }

    // Verify task ownership via inner join
    const [authorizedTask] = await db
      .select({ taskId: learningTasks.id })
      .from(learningTasks)
      .innerJoin(learningSubjects, eq(learningTasks.subjectId, learningSubjects.id))
      .where(and(eq(learningTasks.id, id), eq(learningSubjects.userId, user.id)))

    if (!authorizedTask) {
      return NextResponse.json({ error: "Task not found or unauthorized" }, { status: 404 })
    }

    const updateFields: {
      title?: string
      completed?: boolean
      dueDate?: Date | null
    } = {}

    if (title !== undefined) updateFields.title = title
    if (completed !== undefined) updateFields.completed = completed
    if (dueDate !== undefined) {
      updateFields.dueDate = dueDate ? new Date(dueDate) : null
    }

    const [updatedTask] = await db
      .update(learningTasks)
      .set(updateFields)
      .where(eq(learningTasks.id, id))
      .returning()

    return NextResponse.json(updatedTask)
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

    // Verify ownership
    const [authorizedTask] = await db
      .select({ taskId: learningTasks.id })
      .from(learningTasks)
      .innerJoin(learningSubjects, eq(learningTasks.subjectId, learningSubjects.id))
      .where(and(eq(learningTasks.id, id), eq(learningSubjects.userId, user.id)))

    if (!authorizedTask) {
      return NextResponse.json({ error: "Task not found or unauthorized" }, { status: 404 })
    }

    const [deletedTask] = await db
      .delete(learningTasks)
      .where(eq(learningTasks.id, id))
      .returning()

    return NextResponse.json(deletedTask)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
