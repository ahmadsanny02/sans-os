import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { learningMaterials, learningSubjects } from "@/types/schema"
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
    const { subjectId, title, notes, linkUrl } = body

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

    const [newMaterial] = await db
      .insert(learningMaterials)
      .values({
        subjectId,
        title,
        status: "Not Started",
        notes: notes || null,
        linkUrl: linkUrl || null,
      })
      .returning()

    return NextResponse.json(newMaterial)
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
    const { id, title, status, notes, linkUrl } = body

    if (!id) {
      return NextResponse.json({ error: "Missing material ID" }, { status: 400 })
    }

    // Verify material ownership via inner join
    const [authorizedMaterial] = await db
      .select({ materialId: learningMaterials.id })
      .from(learningMaterials)
      .innerJoin(learningSubjects, eq(learningMaterials.subjectId, learningSubjects.id))
      .where(and(eq(learningMaterials.id, id), eq(learningSubjects.userId, user.id)))

    if (!authorizedMaterial) {
      return NextResponse.json({ error: "Material not found or unauthorized" }, { status: 404 })
    }

    const updateFields: {
      title?: string
      status?: string
      notes?: string | null
      linkUrl?: string | null
    } = {}

    if (title !== undefined) updateFields.title = title
    if (status !== undefined) updateFields.status = status
    if (notes !== undefined) updateFields.notes = notes
    if (linkUrl !== undefined) updateFields.linkUrl = linkUrl

    const [updatedMaterial] = await db
      .update(learningMaterials)
      .set(updateFields)
      .where(eq(learningMaterials.id, id))
      .returning()

    return NextResponse.json(updatedMaterial)
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
      return NextResponse.json({ error: "Missing material ID" }, { status: 400 })
    }

    // Verify ownership
    const [authorizedMaterial] = await db
      .select({ materialId: learningMaterials.id })
      .from(learningMaterials)
      .innerJoin(learningSubjects, eq(learningMaterials.subjectId, learningSubjects.id))
      .where(and(eq(learningMaterials.id, id), eq(learningSubjects.userId, user.id)))

    if (!authorizedMaterial) {
      return NextResponse.json({ error: "Material not found or unauthorized" }, { status: 404 })
    }

    const [deletedMaterial] = await db
      .delete(learningMaterials)
      .where(eq(learningMaterials.id, id))
      .returning()

    return NextResponse.json(deletedMaterial)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
