import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

let migrationRan = false

/**
 * Ensures that the 'status' column exists on 'project_tasks' and 'project_sub_tasks'
 * tables in the PostgreSQL database. This allows production deployments to gracefully
 * auto-migrate without causing 500 column missing errors.
 */
export async function ensureProjectStatusColumns(): Promise<void> {
  if (migrationRan) return

  try {
    await db.execute(sql`
      ALTER TABLE project_tasks 
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Planning';
    `)

    await db.execute(sql`
      ALTER TABLE project_sub_tasks 
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Planning';
    `)

    await db.execute(sql`
      UPDATE project_tasks 
      SET status = 'Completed' 
      WHERE completed = true AND status = 'Planning';
    `)

    await db.execute(sql`
      UPDATE project_sub_tasks 
      SET status = 'Completed' 
      WHERE completed = true AND status = 'Planning';
    `)

    migrationRan = true
  } catch (error) {
    console.error("Auto-migration ensureProjectStatusColumns error:", error)
    throw error
  }
}
