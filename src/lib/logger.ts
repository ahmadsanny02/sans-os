/**
 * Custom logger utility
 * Server logs are not client-visible, so errors and warnings stay on in production; only debug logs are silenced.
 */
export const logger = {
  error: (...args: unknown[]) => console.error(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(...args)
    }
  },
}
