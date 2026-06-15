import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/types/schema"

const connectionString = process.env.DATABASE_URL || ""

// For serverless/dev environments, prevent hot reloading from leaking connections
let client: postgres.Sql

if (process.env.NODE_ENV === "production") {
  client = postgres(connectionString, { prepare: false })
} else {
  const globalRef = global as typeof globalThis & {
    postgresClient?: postgres.Sql
  }
  if (!globalRef.postgresClient) {
    globalRef.postgresClient = postgres(connectionString, { prepare: false })
  }
  client = globalRef.postgresClient
}

export const db = drizzle(client, { schema })
export type DbType = typeof db
export type SchemaType = typeof schema
export type PgTransaction = Parameters<Parameters<DbType["transaction"]>[0]>[0]
