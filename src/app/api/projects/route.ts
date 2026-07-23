import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { projects } from "@/types/schema"
import { eq, and, desc } from "drizzle-orm"
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

    // Retrieve projects with their tasks sorted by creation date
    const userProjects = await db.query.projects.findMany({
      where: eq(projects.userId, user.id),
      with: {
        tasks: {
          with: {
            subTasks: true
          }
        }
      },
      orderBy: [desc(projects.createdAt)],
    })

    return NextResponse.json(userProjects)
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
    const { name, description, status, priority, deadline, category, subCategory } = body

    if (!name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newProject] = await db
      .insert(projects)
      .values({
        userId: user.id,
        name,
        description: description || null,
        status: status || "Planning",
        priority: priority || "Medium",
        deadline: deadline ? new Date(deadline) : null,
        category: category || "General",
        subCategory: subCategory || null,
      })
      .returning()

    return NextResponse.json(newProject)
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
      return NextResponse.json({ error: "Missing project ID" }, { status: 400 })
    }

    const [deletedProject] = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
      .returning()

    if (!deletedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
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
    const { id, name, description, status, priority, deadline, category, subCategory } = body

    if (!id) {
      return NextResponse.json({ error: "Missing project ID" }, { status: 400 })
    }

    const updateFields: {
      name?: string
      description?: string | null
      status?: string
      priority?: string
      deadline?: Date | null
      category?: string
      subCategory?: string | null
    } = {}

    if (name !== undefined) updateFields.name = name
    if (description !== undefined) updateFields.description = description
    if (status !== undefined) updateFields.status = status
    if (priority !== undefined) updateFields.priority = priority
    if (category !== undefined) updateFields.category = category
    if (subCategory !== undefined) updateFields.subCategory = subCategory || null
    if (deadline !== undefined) {
      updateFields.deadline = deadline ? new Date(deadline) : null
    }

    const [updatedProject] = await db
      .update(projects)
      .set(updateFields)
      .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
      .returning()

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(updatedProject)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
