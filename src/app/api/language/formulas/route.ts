import { NextResponse } from "next/server"
import { apiError } from "@/lib/apiError"
import { db } from "@/lib/db"
import { formulas } from "@/types/schema"
import { eq, and, asc } from "drizzle-orm"
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

    const data = await db
      .select()
      .from(formulas)
      .where(eq(formulas.userId, user.id))
      .orderBy(asc(formulas.name))

    return NextResponse.json(data)
  } catch (error) {
    return apiError(error)
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
    const { name, formula, description } = body

    if (!name || !formula) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newFormula] = await db
      .insert(formulas)
      .values({
        userId: user.id,
        name: name.trim(),
        formula: formula.trim(),
        description: description ? description.trim() : null,
      })
      .returning()

    return NextResponse.json(newFormula)
  } catch (error) {
    return apiError(error)
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
    const { id, name, formula, description } = body

    if (!id || !name || !formula) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [updatedFormula] = await db
      .update(formulas)
      .set({
        name: name.trim(),
        formula: formula.trim(),
        description: description ? description.trim() : null,
      })
      .where(and(eq(formulas.id, id), eq(formulas.userId, user.id)))
      .returning()

    if (!updatedFormula) {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 })
    }

    return NextResponse.json(updatedFormula)
  } catch (error) {
    return apiError(error)
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
      return NextResponse.json({ error: "Missing formula ID" }, { status: 400 })
    }

    const [deletedFormula] = await db
      .delete(formulas)
      .where(and(eq(formulas.id, id), eq(formulas.userId, user.id)))
      .returning()

    if (!deletedFormula) {
      return NextResponse.json({ error: "Formula not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
