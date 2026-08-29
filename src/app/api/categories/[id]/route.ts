import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  categories,
  habits,
  timetableBlocks,
  priorities,
  learningSubjects,
  projects,
  dailyTodos,
} from "@/types/schema"
import { eq, and } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, module, color, description } = body

    // 1. Get the existing category to check if name is changing
    const [existing] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const updateData: Partial<typeof categories.$inferInsert> = {}
    if (name !== undefined) updateData.name = name
    if (module !== undefined) updateData.module = module
    if (color !== undefined) updateData.color = color
    if (description !== undefined) updateData.description = description || null

    const updatedCategory = await db.transaction(async (tx) => {
      const [cat] = await tx
        .update(categories)
        .set(updateData)
        .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
        .returning()

      // 2. If the category name was changed, sync the renaming across other tables
      if (name && name !== existing.name) {
        await tx
          .update(habits)
          .set({ category: name })
          .where(and(eq(habits.userId, user.id), eq(habits.category, existing.name)))

        await tx
          .update(timetableBlocks)
          .set({ category: name, color: color || undefined })
          .where(and(eq(timetableBlocks.userId, user.id), eq(timetableBlocks.category, existing.name)))

        await tx
          .update(priorities)
          .set({ category: name })
          .where(and(eq(priorities.userId, user.id), eq(priorities.category, existing.name)))

        await tx
          .update(learningSubjects)
          .set({ category: name })
          .where(and(eq(learningSubjects.userId, user.id), eq(learningSubjects.category, existing.name)))

        await tx
          .update(projects)
          .set({ category: name })
          .where(and(eq(projects.userId, user.id), eq(projects.category, existing.name)))

        await tx
          .update(dailyTodos)
          .set({ category: name })
          .where(and(eq(dailyTodos.userId, user.id), eq(dailyTodos.category, existing.name)))
      }

      return cat
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // 1. Get the existing category name before deleting
    const [existing] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    await db.transaction(async (tx) => {
      // 2. Delete the category
      await tx
        .delete(categories)
        .where(and(eq(categories.id, id), eq(categories.userId, user.id)))

      // 3. Fallback deleted category references to 'General'
      await tx
        .update(habits)
        .set({ category: "General" })
        .where(and(eq(habits.userId, user.id), eq(habits.category, existing.name)))

      await tx
        .update(timetableBlocks)
        .set({ category: "General", color: "blue" })
        .where(and(eq(timetableBlocks.userId, user.id), eq(timetableBlocks.category, existing.name)))

      await tx
        .update(priorities)
        .set({ category: "General" })
        .where(and(eq(priorities.userId, user.id), eq(priorities.category, existing.name)))

      await tx
        .update(learningSubjects)
        .set({ category: "General" })
        .where(and(eq(learningSubjects.userId, user.id), eq(learningSubjects.category, existing.name)))

      await tx
        .update(projects)
        .set({ category: "General" })
        .where(and(eq(projects.userId, user.id), eq(projects.category, existing.name)))

      await tx
        .update(dailyTodos)
        .set({ category: "General" })
        .where(and(eq(dailyTodos.userId, user.id), eq(dailyTodos.category, existing.name)))
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
