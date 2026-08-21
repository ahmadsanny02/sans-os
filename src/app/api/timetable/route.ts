import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { timetableBlocks, priorities, timetableSubSchedules } from "@/types/schema"
import { eq, and, asc } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger";

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blocks = await db.query.timetableBlocks.findMany({
      where: eq(timetableBlocks.userId, user.id),
      with: {
        subSchedules: {
          orderBy: [asc(timetableSubSchedules.startTime), asc(timetableSubSchedules.createdAt)],
        },
      },
      orderBy: [asc(timetableBlocks.dayOfWeek), asc(timetableBlocks.startTime)],
    })

    return NextResponse.json(blocks)
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
    const { dayOfWeek, startTime, endTime, title, category, subCategory, color, date, isTodo, link, subSchedules } = body

    if (dayOfWeek === undefined || !startTime || !endTime || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [newBlock] = await db
      .insert(timetableBlocks)
      .values({
        userId: user.id,
        dayOfWeek,
        startTime,
        endTime,
        title,
        category: category || "General",
        subCategory: subCategory || null,
        color: color || "blue",
        date: date || null,
        isTodo: isTodo ?? false,
        link: link || null,
      })
      .returning()

    // Insert initial sub schedules if provided
    if (Array.isArray(subSchedules) && subSchedules.length > 0) {
      const validSubSchedules = subSchedules
        .filter((s: { title?: string }) => s && s.title && s.title.trim())
        .map((s: { title: string; startTime?: string; endTime?: string }) => ({
          userId: user.id,
          timetableBlockId: newBlock.id,
          title: s.title.trim(),
          startTime: s.startTime || null,
          endTime: s.endTime || null,
          completed: false,
        }))

      if (validSubSchedules.length > 0) {
        await db.insert(timetableSubSchedules).values(validSubSchedules)
      }
    }

    // Automatically add to priorities if it is a custom schedule (date is not null)
    if (date) {
      try {
        const existing = await db
          .select()
          .from(priorities)
          .where(and(eq(priorities.userId, user.id), eq(priorities.date, date)))

        if (existing.length < 5) {
          const alreadyExists = existing.some((p) => p.text === title)
          if (!alreadyExists) {
            await db.insert(priorities).values({
              userId: user.id,
              date,
              text: title,
              orderIndex: existing.length,
              completed: false,
              link: link || null,
            })
          }
        }
      } catch (err) {
        logger.error("Failed to auto-insert priority:", err)
      }
    }

    // Return the block with created sub-schedules
    const fullBlock = await db.query.timetableBlocks.findFirst({
      where: and(eq(timetableBlocks.id, newBlock.id), eq(timetableBlocks.userId, user.id)),
      with: {
        subSchedules: {
          orderBy: [asc(timetableSubSchedules.startTime), asc(timetableSubSchedules.createdAt)],
        },
      },
    })

    return NextResponse.json(fullBlock || newBlock)
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
      return NextResponse.json({ error: "Missing block ID" }, { status: 400 })
    }

    const [deletedBlock] = await db
      .delete(timetableBlocks)
      .where(and(eq(timetableBlocks.id, id), eq(timetableBlocks.userId, user.id)))
      .returning()

    if (!deletedBlock) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 })
    }

    // Automatically remove matching priority if it was a custom schedule
    if (deletedBlock.date) {
      try {
        await db
          .delete(priorities)
          .where(
            and(
              eq(priorities.userId, user.id),
              eq(priorities.date, deletedBlock.date),
              eq(priorities.text, deletedBlock.title)
            )
          )
      } catch (err) {
        logger.error("Failed to auto-delete priority:", err)
      }
    }

    return NextResponse.json({ success: true })
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
    const { id, dayOfWeek, startTime, endTime, title, category, subCategory, color, date, isTodo, link } = body

    if (!id) {
      return NextResponse.json({ error: "Missing block ID" }, { status: 400 })
    }

    // Fetch existing block to synchronize priority changes
    const [existingBlock] = await db
      .select()
      .from(timetableBlocks)
      .where(and(eq(timetableBlocks.id, id), eq(timetableBlocks.userId, user.id)))

    if (!existingBlock) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 })
    }

    const updateData: Partial<typeof timetableBlocks.$inferInsert> = {}
    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek
    if (startTime !== undefined) updateData.startTime = startTime
    if (endTime !== undefined) updateData.endTime = endTime
    if (title !== undefined) updateData.title = title
    if (category !== undefined) updateData.category = category
    if (subCategory !== undefined) updateData.subCategory = subCategory || null
    if (color !== undefined) updateData.color = color
    if (date !== undefined) updateData.date = date || null
    if (isTodo !== undefined) updateData.isTodo = isTodo
    if (link !== undefined) updateData.link = link || null

    const [updatedBlock] = await db
      .update(timetableBlocks)
      .set(updateData)
      .where(and(eq(timetableBlocks.id, id), eq(timetableBlocks.userId, user.id)))
      .returning()

    // Synchronize custom schedule priorities
    if (existingBlock.date) {
      try {
        const newTitle = title !== undefined ? title : existingBlock.title
        const newLink = link !== undefined ? (link || null) : existingBlock.link
        const newDate = date !== undefined ? (date || null) : existingBlock.date

        if (newDate) {
          await db
            .update(priorities)
            .set({
              text: newTitle,
              link: newLink,
              date: newDate,
            })
            .where(
              and(
                eq(priorities.userId, user.id),
                eq(priorities.date, existingBlock.date),
                eq(priorities.text, existingBlock.title)
              )
            )
        } else {
          // Date removed, delete corresponding priority
          await db
            .delete(priorities)
            .where(
              and(
                eq(priorities.userId, user.id),
                eq(priorities.date, existingBlock.date),
                eq(priorities.text, existingBlock.title)
              )
            )
        }
      } catch (err) {
        logger.error("Failed to sync updated priority:", err)
      }
    } else if (date) {
      // Date added, try to auto-insert priority
      try {
        const existing = await db
          .select()
          .from(priorities)
          .where(and(eq(priorities.userId, user.id), eq(priorities.date, date)))

        if (existing.length < 5) {
          const newTitle = title !== undefined ? title : existingBlock.title
          const newLink = link !== undefined ? (link || null) : existingBlock.link
          const alreadyExists = existing.some((p) => p.text === newTitle)
          if (!alreadyExists) {
            await db.insert(priorities).values({
              userId: user.id,
              date,
              text: newTitle,
              orderIndex: existing.length,
              completed: false,
              link: newLink,
            })
          }
        }
      } catch (err) {
        logger.error("Failed to auto-insert updated priority:", err)
      }
    }

    return NextResponse.json(updatedBlock)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
