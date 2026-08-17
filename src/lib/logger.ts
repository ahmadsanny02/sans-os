/**
 * Custom logger utility
 * Silences output in production environments to avoid leaking stack traces or sensitive internal states.
 */
export const logger = {
  error: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.error(...args)
    }
  },
  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(...args)
    }
  },
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(...args)
    }
  },
}
