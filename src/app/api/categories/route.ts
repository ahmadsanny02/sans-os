import { NextResponse } from "next/server"
import { apiError } from "@/lib/apiError"
import { db } from "@/lib/db"
import { categories } from "@/types/schema"
import { eq, asc } from "drizzle-orm"
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

    const items = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, user.id))
      .orderBy(asc(categories.createdAt))

    // Seed General if it is not present in the DB
    const hasGeneral = items.some((c) => c.name.toLowerCase() === "general")
    if (!hasGeneral) {
      // Concurrent first-load requests are resolved by the unique index
      const [createdGeneral] = await db
        .insert(categories)
        .values({
          userId: user.id,
          name: "General",
          module: "general",
          color: "primary",
          description: "General or unclassified tasks",
          isSystemDefault: true,
        })
        .onConflictDoNothing()
        .returning()

      if (createdGeneral) {
        items.unshift(createdGeneral)
      }
    }

    return NextResponse.json(items)
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
    const { name, module, color, description } = body

    if (!name || !module || !color) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        userId: user.id,
        name,
        module,
        color,
        description: description || null,
        isSystemDefault: false,
      })
      .returning()

    return NextResponse.json(newCategory)
  } catch (error) {
    return apiError(error)
  }
}
