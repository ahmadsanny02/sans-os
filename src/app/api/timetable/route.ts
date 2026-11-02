import { NextResponse } from "next/server"
import { apiError } from "@/lib/apiError"
import { db } from "@/lib/db"
import { timetableBlocks, priorities, timetableSubSchedules } from "@/types/schema"
import { eq, and, asc } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

// dayOfWeek -1 means a fixed block shown every day
function isValidBlockInput({ dayOfWeek, startTime, endTime, date }: Record<string, unknown>): boolean {
  if (dayOfWeek !== undefined && !(Number.isInteger(dayOfWeek) && Number(dayOfWeek) >= -1 && Number(dayOfWeek) <= 7)) return false
  if (startTime !== undefined && !TIME_REGEX.test(String(startTime))) return false
  if (endTime !== undefined && !TIME_REGEX.test(String(endTime))) return false
  return !date || DATE_REGEX.test(String(date))
}

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
    const { dayOfWeek, startTime, endTime, title, category, subCategory, color, date, isTodo, link, subSchedules } = body

    if (dayOfWeek === undefined || !startTime || !endTime || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!isValidBlockInput({ dayOfWeek, startTime, endTime, date })) {
      return NextResponse.json({ error: "Invalid day, time, or date" }, { status: 400 })
    }

    const newBlockId = await db.transaction(async (tx) => {
      const [newBlock] = await tx
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
          await tx.insert(timetableSubSchedules).values(validSubSchedules)
        }
      }

      // Automatically add to priorities if it is a custom schedule (date is not null)
      if (date) {
        const existing = await tx
          .select()
          .from(priorities)
          .where(and(eq(priorities.userId, user.id), eq(priorities.date, date)))

        if (existing.length < 5) {
          const alreadyExists = existing.some((p) => p.timetableBlockId === newBlock.id || p.text === title)
          if (!alreadyExists) {
            await tx.insert(priorities).values({
              userId: user.id,
              date,
              text: title,
              orderIndex: existing.length,
              completed: false,
              link: link || null,
              timetableBlockId: newBlock.id,
            })
          }
        }
      }

      return newBlock.id
    })

    // Return the block with created sub-schedules
    const fullBlock = await db.query.timetableBlocks.findFirst({
      where: and(eq(timetableBlocks.id, newBlockId), eq(timetableBlocks.userId, user.id)),
      with: {
        subSchedules: {
          orderBy: [asc(timetableSubSchedules.startTime), asc(timetableSubSchedules.createdAt)],
        },
      },
    })

    return NextResponse.json(fullBlock)
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
      return NextResponse.json({ error: "Missing block ID" }, { status: 400 })
    }

    const success = await db.transaction(async (tx) => {
      const [deletedBlock] = await tx
        .delete(timetableBlocks)
        .where(and(eq(timetableBlocks.id, id), eq(timetableBlocks.userId, user.id)))
        .returning()

      if (!deletedBlock) {
        return false
      }

      await tx
        .delete(priorities)
        .where(and(eq(priorities.userId, user.id), eq(priorities.timetableBlockId, deletedBlock.id)))

      return true
    })

    if (!success) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
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
    const { id, dayOfWeek, startTime, endTime, title, category, subCategory, color, date, isTodo, link } = body

    if (!id) {
      return NextResponse.json({ error: "Missing block ID" }, { status: 400 })
    }

    if (!isValidBlockInput({ dayOfWeek, startTime, endTime, date })) {
      return NextResponse.json({ error: "Invalid day, time, or date" }, { status: 400 })
    }

    const updatedBlock = await db.transaction(async (tx) => {
      // Fetch existing block to synchronize priority changes
      const [existingBlock] = await tx
        .select()
        .from(timetableBlocks)
        .where(and(eq(timetableBlocks.id, id), eq(timetableBlocks.userId, user.id)))

      if (!existingBlock) {
        return null
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

      const [updated] = await tx
        .update(timetableBlocks)
        .set(updateData)
        .where(and(eq(timetableBlocks.id, id), eq(timetableBlocks.userId, user.id)))
        .returning()

      // Synchronize custom schedule priorities
      if (existingBlock.date) {
        const newTitle = title !== undefined ? title : existingBlock.title
        const newLink = link !== undefined ? (link || null) : existingBlock.link
        const newDate = date !== undefined ? (date || null) : existingBlock.date

        const linkedPriority = and(eq(priorities.userId, user.id), eq(priorities.timetableBlockId, id))

        if (newDate) {
          // Only an explicit date change moves the priority: rollover may have moved it since
          let dateFields: { date?: string; orderIndex?: number } = {}
          if (newDate !== existingBlock.date) {
            const target = await tx
              .select({ id: priorities.id })
              .from(priorities)
              .where(and(eq(priorities.userId, user.id), eq(priorities.date, newDate)))
            if (target.length < 5) dateFields = { date: newDate, orderIndex: target.length }
          }
          await tx
            .update(priorities)
            .set({ text: newTitle, link: newLink, ...dateFields })
            .where(linkedPriority)
        } else {
          // Date removed, delete corresponding priority
          await tx.delete(priorities).where(linkedPriority)
        }
      } else if (date) {
        // Date added, try to auto-insert priority
        const existing = await tx
          .select()
          .from(priorities)
          .where(and(eq(priorities.userId, user.id), eq(priorities.date, date)))

        if (existing.length < 5) {
          const newTitle = title !== undefined ? title : existingBlock.title
          const newLink = link !== undefined ? (link || null) : existingBlock.link
          const alreadyExists = existing.some((p) => p.timetableBlockId === id || p.text === newTitle)
          if (!alreadyExists) {
            await tx.insert(priorities).values({
              userId: user.id,
              date,
              text: newTitle,
              orderIndex: existing.length,
              completed: false,
              link: newLink,
              timetableBlockId: id,
            })
          }
        }
      }

      return updated
    })

    if (!updatedBlock) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 })
    }

    return NextResponse.json(updatedBlock)
  } catch (error) {
    return apiError(error)
  }
}
