import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dailyTodos } from "@/types/schema"
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

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date") // format "YYYY-MM-DD"

    if (!dateParam) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    const items = await db
      .select()
      .from(dailyTodos)
      .where(and(eq(dailyTodos.userId, user.id), eq(dailyTodos.date, dateParam)))
      .orderBy(asc(dailyTodos.createdAt))

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
    const { date, text } = body

    if (!date || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newTodo] = await db
      .insert(dailyTodos)
      .values({
        userId: user.id,
        date,
        text,
        completed: false,
      })
      .returning()

    return NextResponse.json(newTodo)
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
    const { id, completed, text } = body

    if (!id) {
      return NextResponse.json({ error: "Missing todo ID" }, { status: 400 })
    }

    const updateData: Partial<typeof dailyTodos.$inferInsert> = {}
    if (completed !== undefined) {
      updateData.completed = completed
    }
    if (text !== undefined) {
      updateData.text = text
    }

    const [updatedTodo] = await db
      .update(dailyTodos)
      .set(updateData)
      .where(and(eq(dailyTodos.id, id), eq(dailyTodos.userId, user.id)))
      .returning()

    if (!updatedTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    return NextResponse.json(updatedTodo)
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
      return NextResponse.json({ error: "Missing todo ID" }, { status: 400 })
    }

    const [deletedTodo] = await db
      .delete(dailyTodos)
      .where(and(eq(dailyTodos.id, id), eq(dailyTodos.userId, user.id)))
      .returning()

    if (!deletedTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
