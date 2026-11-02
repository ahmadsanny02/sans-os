import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/types/schema"

const connectionString = process.env.DATABASE_URL || ""

// For serverless/dev environments, prevent hot reloading from leaking connections
let client: postgres.Sql
// Small per-instance pool: serverless instances multiply this against the database connection limit
const options = { prepare: false, max: 3, idle_timeout: 20 }

if (process.env.NODE_ENV === "production") {
  client = postgres(connectionString, options)
} else {
  const globalRef = global as typeof globalThis & {
    postgresClient?: postgres.Sql
  }
  if (!globalRef.postgresClient) {
    globalRef.postgresClient = postgres(connectionString, options)
  }
  client = globalRef.postgresClient
}

export const db = drizzle(client, { schema })
export type DbType = typeof db
export type SchemaType = typeof schema
export type PgTransaction = Parameters<Parameters<DbType["transaction"]>[0]>[0]
