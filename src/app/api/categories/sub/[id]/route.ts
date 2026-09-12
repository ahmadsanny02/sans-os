import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { subCategories, categories, habits, timetableBlocks, priorities, learningSubjects, projects, dailyTodos } from "@/types/schema"
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
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // 1. Get existing subcategory along with its parent category name
    const [existing] = await db
      .select({
        id: subCategories.id,
        name: subCategories.name,
        categoryId: subCategories.categoryId,
        parentCategoryName: categories.name,
      })
      .from(subCategories)
      .innerJoin(categories, eq(subCategories.categoryId, categories.id))
      .where(and(eq(subCategories.id, id), eq(subCategories.userId, user.id)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: "Sub-category not found" }, { status: 404 })
    }

    let updatedSub
    await db.transaction(async (tx) => {
      const [res] = await tx
        .update(subCategories)
        .set({ name })
        .where(and(eq(subCategories.id, id), eq(subCategories.userId, user.id)))
        .returning()
      updatedSub = res

      // 2. If name changed, rename references in other tables scoping to the parent category
      if (name !== existing.name && existing.parentCategoryName) {
        await tx
          .update(habits)
          .set({ subCategory: name })
          .where(
            and(
              eq(habits.userId, user.id),
              eq(habits.category, existing.parentCategoryName),
              eq(habits.subCategory, existing.name)
            )
          )

        await tx
          .update(timetableBlocks)
          .set({ subCategory: name })
          .where(
            and(
              eq(timetableBlocks.userId, user.id),
              eq(timetableBlocks.category, existing.parentCategoryName),
              eq(timetableBlocks.subCategory, existing.name)
            )
          )

        await tx
          .update(priorities)
          .set({ subCategory: name })
          .where(
            and(
              eq(priorities.userId, user.id),
              eq(priorities.category, existing.parentCategoryName),
              eq(priorities.subCategory, existing.name)
            )
          )

        await tx
          .update(learningSubjects)
          .set({ subCategory: name })
          .where(
            and(
              eq(learningSubjects.userId, user.id),
              eq(learningSubjects.category, existing.parentCategoryName),
              eq(learningSubjects.subCategory, existing.name)
            )
          )

        await tx
          .update(projects)
          .set({ subCategory: name })
          .where(
            and(
              eq(projects.userId, user.id),
              eq(projects.category, existing.parentCategoryName),
              eq(projects.subCategory, existing.name)
            )
          )

        await tx
          .update(dailyTodos)
          .set({ subCategory: name })
          .where(
            and(
              eq(dailyTodos.userId, user.id),
              eq(dailyTodos.category, existing.parentCategoryName),
              eq(dailyTodos.subCategory, existing.name)
            )
          )
      }
    })

    return NextResponse.json(updatedSub)
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

    // 1. Get existing subcategory along with its parent category name before deleting
    const [existing] = await db
      .select({
        id: subCategories.id,
        name: subCategories.name,
        categoryId: subCategories.categoryId,
        parentCategoryName: categories.name,
      })
      .from(subCategories)
      .innerJoin(categories, eq(subCategories.categoryId, categories.id))
      .where(and(eq(subCategories.id, id), eq(subCategories.userId, user.id)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: "Sub-category not found" }, { status: 404 })
    }

    // 2. Delete sub-category and clear references scoped to parent category atomically
    await db.transaction(async (tx) => {
      await tx
        .delete(subCategories)
        .where(and(eq(subCategories.id, id), eq(subCategories.userId, user.id)))

      if (existing.parentCategoryName) {
        await tx
          .update(habits)
          .set({ subCategory: null })
          .where(
            and(
              eq(habits.userId, user.id),
              eq(habits.category, existing.parentCategoryName),
              eq(habits.subCategory, existing.name)
            )
          )

        await tx
          .update(timetableBlocks)
          .set({ subCategory: null })
          .where(
            and(
              eq(timetableBlocks.userId, user.id),
              eq(timetableBlocks.category, existing.parentCategoryName),
              eq(timetableBlocks.subCategory, existing.name)
            )
          )

        await tx
          .update(priorities)
          .set({ subCategory: null })
          .where(
            and(
              eq(priorities.userId, user.id),
              eq(priorities.category, existing.parentCategoryName),
              eq(priorities.subCategory, existing.name)
            )
          )

        await tx
          .update(learningSubjects)
          .set({ subCategory: null })
          .where(
            and(
              eq(learningSubjects.userId, user.id),
              eq(learningSubjects.category, existing.parentCategoryName),
              eq(learningSubjects.subCategory, existing.name)
            )
          )

        await tx
          .update(projects)
          .set({ subCategory: null })
          .where(
            and(
              eq(projects.userId, user.id),
              eq(projects.category, existing.parentCategoryName),
              eq(projects.subCategory, existing.name)
            )
          )

        await tx
          .update(dailyTodos)
          .set({ subCategory: null })
          .where(
            and(
              eq(dailyTodos.userId, user.id),
              eq(dailyTodos.category, existing.parentCategoryName),
              eq(dailyTodos.subCategory, existing.name)
            )
          )
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
