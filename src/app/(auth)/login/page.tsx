"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
      } else {
        router.refresh()
        router.push("/")
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Decorative gradient glowing bubbles */}
      <div className="absolute left-1/3 top-1/4 -z-10 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute right-1/3 bottom-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card/45 p-8 shadow-xl backdrop-blur-md dark:bg-card/20">
        <div className="text-center space-y-2">
          <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-3xl font-extrabold tracking-wider text-transparent">
            SansOS
          </span>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Sign In to Workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to manage your life operating system
          </p>
        </div>

        {error ? (
          <div className="rounded-lg bg-destructive/10 p-3 text-center text-xs font-semibold text-destructive">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sanny@sansos.workspace"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/20 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/20 disabled:opacity-50"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/95 text-sm font-semibold h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}
