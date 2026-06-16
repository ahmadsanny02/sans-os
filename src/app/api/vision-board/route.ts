import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { visionBoardItems } from "@/types/schema"
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

    // Retrieve vision board items sorted by creation order so layer order is stable
    const items = await db
      .select()
      .from(visionBoardItems)
      .where(eq(visionBoardItems.userId, user.id))
      .orderBy(asc(visionBoardItems.createdAt))

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
    const { type, content, xOffset, yOffset, width, height } = body

    if (!type || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newItem] = await db
      .insert(visionBoardItems)
      .values({
        userId: user.id,
        type,
        content,
        xOffset: xOffset !== undefined ? Number(xOffset) : 0,
        yOffset: yOffset !== undefined ? Number(yOffset) : 0,
        width: width !== undefined ? Number(width) : 200,
        height: height !== undefined ? Number(height) : 200,
      })
      .returning()

    return NextResponse.json(newItem)
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
    const { id, xOffset, yOffset, width, height } = body

    if (!id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updateData: Partial<typeof visionBoardItems.$inferInsert> = {}
    if (xOffset !== undefined) updateData.xOffset = Number(xOffset)
    if (yOffset !== undefined) updateData.yOffset = Number(yOffset)
    if (width !== undefined) updateData.width = Number(width)
    if (height !== undefined) updateData.height = Number(height)

    const [updatedItem] = await db
      .update(visionBoardItems)
      .set(updateData)
      .where(and(eq(visionBoardItems.id, id), eq(visionBoardItems.userId, user.id)))
      .returning()

    if (!updatedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(updatedItem)
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
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 })
    }

    const [deletedItem] = await db
      .delete(visionBoardItems)
      .where(and(eq(visionBoardItems.id, id), eq(visionBoardItems.userId, user.id)))
      .returning()

    if (!deletedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
