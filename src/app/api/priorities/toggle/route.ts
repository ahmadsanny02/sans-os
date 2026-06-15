import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { priorities } from "@/types/schema"
import { eq, and } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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
    const { id, completed } = body

    if (!id || completed === undefined) {
      return NextResponse.json({ error: "Missing priority ID or status" }, { status: 400 })
    }

    const [updatedPriority] = await db
      .update(priorities)
      .set({ completed })
      .where(and(eq(priorities.id, id), eq(priorities.userId, user.id)))
      .returning()

    if (!updatedPriority) {
      return NextResponse.json({ error: "Priority not found" }, { status: 404 })
    }

    return NextResponse.json(updatedPriority)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
