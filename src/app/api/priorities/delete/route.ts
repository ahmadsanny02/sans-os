import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { priorities } from "@/types/schema"
import { eq, and } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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
      return NextResponse.json({ error: "Missing priority ID" }, { status: 400 })
    }

    const [deletedPriority] = await db
      .delete(priorities)
      .where(and(eq(priorities.id, id), eq(priorities.userId, user.id)))
      .returning()

    if (!deletedPriority) {
      return NextResponse.json({ error: "Priority not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
