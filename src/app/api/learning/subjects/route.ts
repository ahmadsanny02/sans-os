import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { learningSubjects } from "@/types/schema"
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

    const userSubjects = await db.query.learningSubjects.findMany({
      where: eq(learningSubjects.userId, user.id),
      with: {
        materials: {
          orderBy: (materials, { desc }) => [desc(materials.createdAt)],
        },
        tasks: {
          orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
        },
      },
      orderBy: [desc(learningSubjects.createdAt)],
    })

    return NextResponse.json(userSubjects)
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
    const { name, description, status, color } = body

    if (!name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newSubject] = await db
      .insert(learningSubjects)
      .values({
        userId: user.id,
        name,
        description: description || null,
        status: status || "Learning",
        color: color || "hsl(var(--primary))",
      })
      .returning()

    return NextResponse.json(newSubject)
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
      return NextResponse.json({ error: "Missing subject ID" }, { status: 400 })
    }

    const [deletedSubject] = await db
      .delete(learningSubjects)
      .where(and(eq(learningSubjects.id, id), eq(learningSubjects.userId, user.id)))
      .returning()

    if (!deletedSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
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
    const { id, name, description, status, color } = body

    if (!id) {
      return NextResponse.json({ error: "Missing subject ID" }, { status: 400 })
    }

    const updateFields: {
      name?: string
      description?: string | null
      status?: string
      color?: string
    } = {}

    if (name !== undefined) updateFields.name = name
    if (description !== undefined) updateFields.description = description
    if (status !== undefined) updateFields.status = status
    if (color !== undefined) updateFields.color = color

    const [updatedSubject] = await db
      .update(learningSubjects)
      .set(updateFields)
      .where(and(eq(learningSubjects.id, id), eq(learningSubjects.userId, user.id)))
      .returning()

    if (!updatedSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    return NextResponse.json(updatedSubject)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
