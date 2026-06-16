import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { readingJournal } from "@/types/schema"
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

    const books = await db
      .select()
      .from(readingJournal)
      .where(eq(readingJournal.userId, user.id))
      .orderBy(desc(readingJournal.createdAt))

    return NextResponse.json(books)
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
    const { title, author, status, rating, review, finishedAt, currentProgress } = body

    if (!title || !author || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const isCompleted = status === "Completed"
    const finishedAtVal = isCompleted ? (finishedAt ? new Date(finishedAt) : new Date()) : null
    const currentProgressVal = status === "Reading" ? (currentProgress || null) : null

    const [newBook] = await db
      .insert(readingJournal)
      .values({
        userId: user.id,
        title,
        author,
        status,
        rating: isCompleted && rating !== undefined ? Number(rating) : null,
        review: isCompleted && review !== undefined ? review : null,
        finishedAt: finishedAtVal,
        currentProgress: currentProgressVal,
      })
      .returning()

    return NextResponse.json(newBook)
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
    const { id, title, author, status, rating, review, finishedAt, currentProgress } = body

    if (!id) {
      return NextResponse.json({ error: "Missing book ID" }, { status: 400 })
    }

    // Fetch current book state to check status
    const [currentBook] = await db
      .select()
      .from(readingJournal)
      .where(and(eq(readingJournal.id, id), eq(readingJournal.userId, user.id)))

    if (!currentBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Determine finishedAt values
    let finishedAtVal = currentBook.finishedAt
    if (status !== undefined) {
      if (status === "Completed") {
        finishedAtVal = finishedAt ? new Date(finishedAt) : (currentBook.status === "Completed" ? currentBook.finishedAt : new Date())
      } else {
        finishedAtVal = null
      }
    } else if (finishedAt !== undefined) {
      finishedAtVal = finishedAt ? new Date(finishedAt) : null
    }

    const isCompleted = status !== undefined ? status === "Completed" : currentBook.status === "Completed"
    const isReading = status !== undefined ? status === "Reading" : currentBook.status === "Reading"

    const updateValues: Partial<typeof readingJournal.$inferInsert> = {}
    if (title !== undefined) updateValues.title = title
    if (author !== undefined) updateValues.author = author
    if (status !== undefined) updateValues.status = status
    
    // Set rating/review/progress based on status transitions
    if (isCompleted) {
      if (rating !== undefined) updateValues.rating = rating !== null ? Number(rating) : null
      if (review !== undefined) updateValues.review = review
      updateValues.currentProgress = null
    } else {
      updateValues.rating = null
      updateValues.review = null
      if (isReading) {
        if (currentProgress !== undefined) {
          updateValues.currentProgress = currentProgress
        }
      } else {
        updateValues.currentProgress = null
      }
    }
    updateValues.finishedAt = finishedAtVal

    const [updatedBook] = await db
      .update(readingJournal)
      .set(updateValues)
      .where(and(eq(readingJournal.id, id), eq(readingJournal.userId, user.id)))
      .returning()

    return NextResponse.json(updatedBook)
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
      return NextResponse.json({ error: "Missing book ID" }, { status: 400 })
    }

    const [deletedBook] = await db
      .delete(readingJournal)
      .where(and(eq(readingJournal.id, id), eq(readingJournal.userId, user.id)))
      .returning()

    if (!deletedBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
