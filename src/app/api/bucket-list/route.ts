import { NextResponse } from "next/server"
import { apiError } from "@/lib/apiError"
import { isHttpUrl } from "@/lib/utils"
import { db } from "@/lib/db"
import { bucketList } from "@/types/schema"
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

    const items = await db
      .select()
      .from(bucketList)
      .where(eq(bucketList.userId, user.id))
      .orderBy(desc(bucketList.createdAt))

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
    const { title, imageUrl } = body

    if (!title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (imageUrl && !isHttpUrl(imageUrl)) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 })
    }

    const [newItem] = await db
      .insert(bucketList)
      .values({
        userId: user.id,
        title,
        imageUrl: imageUrl || null,
        completed: false,
        completedAt: null,
      })
      .returning()

    return NextResponse.json(newItem)
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
    const { id, title, imageUrl, completed } = body

    if (!id) {
      return NextResponse.json({ error: "Missing goal ID" }, { status: 400 })
    }

    if (imageUrl && !isHttpUrl(imageUrl)) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 })
    }

    // Fetch current goal state to resolve completedAt changes
    const [currentGoal] = await db
      .select()
      .from(bucketList)
      .where(and(eq(bucketList.id, id), eq(bucketList.userId, user.id)))

    if (!currentGoal) {
      return NextResponse.json({ error: "Bucket item not found" }, { status: 404 })
    }

    const updateValues: Partial<typeof bucketList.$inferInsert> = {}
    if (title !== undefined) updateValues.title = title
    if (imageUrl !== undefined) updateValues.imageUrl = imageUrl

    if (completed !== undefined) {
      updateValues.completed = completed
      if (completed) {
        updateValues.completedAt = currentGoal.completed ? currentGoal.completedAt : new Date()
      } else {
        updateValues.completedAt = null
      }
    }

    const [updatedGoal] = await db
      .update(bucketList)
      .set(updateValues)
      .where(and(eq(bucketList.id, id), eq(bucketList.userId, user.id)))
      .returning()

    return NextResponse.json(updatedGoal)
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
      return NextResponse.json({ error: "Missing goal ID" }, { status: 400 })
    }

    const [deletedGoal] = await db
      .delete(bucketList)
      .where(and(eq(bucketList.id, id), eq(bucketList.userId, user.id)))
      .returning()

    if (!deletedGoal) {
      return NextResponse.json({ error: "Bucket item not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return apiError(error)
  }
}
