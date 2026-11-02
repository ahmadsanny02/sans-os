import { NextResponse } from "next/server"

// Postgres: invalid text (bad uuid, NaN integer), bad date/time, numeric out of range
const BAD_INPUT_CODES = new Set(["22P02", "22007", "22008", "22003"])
const UNIQUE_VIOLATION = "23505"

// Single exit for route catch blocks: details go to the server log, never to the client.
export function apiError(error: unknown): NextResponse {
  const code = (error as { cause?: { code?: string } } | null)?.cause?.code
  if (code === UNIQUE_VIOLATION) {
    return NextResponse.json({ error: "Already exists" }, { status: 409 })
  }
  if (
    (code && BAD_INPUT_CODES.has(code)) ||
    error instanceof SyntaxError || // malformed JSON body
    error instanceof RangeError || // new Date("garbage") reaching a timestamp column
    (error instanceof Error && error.message === "No values to set") // empty PATCH body
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }
  console.error("[API Error]", error)
  return NextResponse.json({ error: "Server Error" }, { status: 500 })
}
