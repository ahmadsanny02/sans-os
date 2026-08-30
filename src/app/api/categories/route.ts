import { NextResponse } from "next/server"
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

    // Prepend General if it is not present in the DB
    const hasGeneral = items.some((c) => c.name.toLowerCase() === "general")
    if (!hasGeneral) {
      const generalItem: typeof categories.$inferSelect = {
        id: "00000000-0000-0000-0000-000000000001",
        userId: user.id,
        name: "General",
        module: "general",
        color: "primary",
        description: "General or unclassified tasks",
        isSystemDefault: true,
        createdAt: new Date(),
      }
      items.unshift(generalItem)
    }

    return NextResponse.json(items)
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
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
