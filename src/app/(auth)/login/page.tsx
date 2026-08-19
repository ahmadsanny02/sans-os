"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  BookOpen,
  Calendar,
  Briefcase,
} from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4 sm:p-6 lg:p-8">
      {/* Background ambient lighting and decorative grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -left-20 top-1/4 -z-10 h-96 w-96 rounded-full bg-primary/15 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -right-20 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-violet-500/15 blur-[120px] pointer-events-none animate-pulse" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand & Feature Highlights (Visible on Desktop & Tablet) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col space-y-8 pr-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold w-fit shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Personal Life Operating System
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
              Organize your life with <span className="text-primary">SansOS</span>
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              A unified workspace integrating habit tracking, foreign language learning, daily timetable execution, and engineering projects.
            </p>
          </div>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { label: "Habit Tracker", desc: "Matrix check-in logs", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
              { label: "Language Hub", desc: "Vocab & Sentence drill", icon: BookOpen, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
              { label: "Daily Timetable", desc: "Schedule & Priorities", icon: Calendar, color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
              { label: "Project Board", desc: "Tasks & Deadlines", icon: Briefcase, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
            ].map((feat, idx) => {
              const Icon = feat.icon
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-border/60 bg-card/45 dark:bg-card/15 backdrop-blur-md space-y-1 transition-all hover:border-primary/40 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${feat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-extrabold text-foreground">{feat.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-0.5">{feat.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground pt-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Single-user Encrypted Environment</span>
          </div>
        </div>

        {/* Right Side / Centered: Glassmorphic Login Form */}
        <div className="w-full lg:col-span-6 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="rounded-3xl border border-border/70 bg-card/60 dark:bg-card/25 p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6"
          >
            {/* Form Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-violet-500 text-primary-foreground shadow-lg shadow-primary/20 mb-1">
                <Layers className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                Welcome to SansOS
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter your credentials to access your workspace
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-center text-xs font-semibold text-destructive animate-in fade-in duration-150">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-muted-foreground flex items-center justify-between select-none">
                  <span>Email Address</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sanny@sansos.workspace"
                    className="w-full rounded-xl border border-border/80 bg-background/50 pl-10 pr-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold text-muted-foreground select-none">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border/80 bg-background/50 pl-10 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-xs tracking-wide shadow-glass shadow-glow hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-border/40 text-center">
              <p className="text-micro text-muted-foreground">
                SansOS Personal Workspace v1.0.0
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
