import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { subCategories } from "@/types/schema"
import { eq, and, asc } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request): Promise<NextResponse> {
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
      .from(subCategories)
      .where(eq(subCategories.userId, user.id))
      .orderBy(asc(subCategories.createdAt))

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
    const { name, categoryId } = body

    if (!name || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newSub] = await db
      .insert(subCategories)
      .values({
        userId: user.id,
        categoryId,
        name,
      })
      .returning()

    return NextResponse.json(newSub)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
