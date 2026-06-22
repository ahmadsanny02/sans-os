"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { usePomodoroStore } from "@/store/pomodoroStore"
import { PomodoroModal } from "@/components/pomodoro/ui/PomodoroModal"
import { PomodoroPipController } from "@/components/pomodoro/ui/PomodoroPipController"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Image as ImageIcon,
  Calendar,
  Languages,
  Briefcase,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  Trophy,
  Timer,
} from "lucide-react"

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Habits", href: "/habits", icon: CheckSquare },
  { name: "Daily Flow", href: "/daily", icon: Clock },
  { name: "Calendar View", href: "/calendar", icon: Calendar },
  { name: "Projects & Tasks", href: "/projects", icon: Briefcase },
  { name: "Reading Journal", href: "/reading", icon: BookOpen },
  { name: "Language Logs", href: "/language", icon: Languages },
  { name: "Vision Board", href: "/vision-board", icon: ImageIcon },
  { name: "Bucket List", href: "/bucket-list", icon: Trophy },
  { name: "Pomodoro", href: "/pomodoro", icon: Timer },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  // Store variables
  const sidebarOpen = useWorkspaceStore((state) => state.sidebarOpen)
  const toggleSidebar = useWorkspaceStore((state) => state.toggleSidebar)
  const userConfig = useWorkspaceStore((state) => state.userConfig)
  const updateUserConfig = useWorkspaceStore((state) => state.updateUserConfig)

  // Pomodoro store
  const pomodoroIsRunning = usePomodoroStore((s) => s.isRunning)
  const pomodoroPhase = usePomodoroStore((s) => s.phase)
  const toggleModal = usePomodoroStore((s) => s.toggleModal)
  const isModalOpen = usePomodoroStore((s) => s.isModalOpen)

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Floating Pomodoro button measurements to position modal
  const [buttonRect, setButtonRect] = useState<{ top: number; left: number; right: number; bottom: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Handle logging out
  const handleLogout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
      router.refresh()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Handle dark mode side effects
  useEffect(() => {
    const root = window.document.documentElement
    if (userConfig.theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [userConfig.theme])

  const toggleTheme = (): void => {
    updateUserConfig({ theme: userConfig.theme === "dark" ? "light" : "dark" })
  }

  // Measure floating Pomodoro button coordinates when opening the modal or on resize
  useEffect(() => {
    const handleMeasure = () => {
      if (isModalOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setButtonRect({
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
        })
      }
    }

    handleMeasure()

    if (isModalOpen) {
      window.addEventListener("resize", handleMeasure)
      return () => window.removeEventListener("resize", handleMeasure)
    }
  }, [isModalOpen])

  return (
    <div ref={rootRef} className="flex h-screen w-screen overflow-hidden bg-background font-sans text-foreground transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          {sidebarOpen ? (
            <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-lg font-bold tracking-wider text-transparent">
              SansOS
            </span>
          ) : null}
          <button
            onClick={toggleSidebar}
            className="rounded p-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground"}`} />
                {sidebarOpen ? <span>{item.name}</span> : null}
              </Link>
            );
          })}
        </nav>

          {/* Sidebar Footer */}

          <div className="border-t border-sidebar-border p-2 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
            aria-label="Toggle Theme"
          >
            {userConfig.theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
            {sidebarOpen ? (
              <span>{userConfig.theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            ) : null}
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen ? <span>Sign Out</span> : null}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Slide-out Drawer) */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden bg-background/80 backdrop-blur-sm">
          <div className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col h-full animate-in slide-in-from-left duration-250">
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
              <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-lg font-bold tracking-wider text-transparent">
                SansOS
              </span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-sidebar-border p-2 space-y-1">
              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
              >
                {userConfig.theme === "dark" ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-700" />
                )}
                <span>{userConfig.theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card/60 backdrop-blur-md px-4 md:hidden shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded p-1 hover:bg-accent hover:text-accent-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-lg font-bold tracking-wider text-transparent">
              SansOS
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded p-1.5 hover:bg-accent hover:text-accent-foreground"
            aria-label="Toggle Theme"
          >
            {userConfig.theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
          </button>
        </header>

        {/* Dynamic page view content container */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-background/95 scroll-smooth">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Quick Navigation) */}
        <nav className="flex h-16 border-t border-border bg-card/85 backdrop-blur-md md:hidden items-center justify-around pb-safe shrink-0">
          {SIDEBAR_ITEMS.slice(0, 4).map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] tracking-wide">
                  {item.name.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Floating Pomodoro Trigger Badge (Bottom Right) */}
      <motion.button
        ref={buttonRef}
        drag
        dragConstraints={rootRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => {
          isDraggingRef.current = true
        }}
        onDragEnd={() => {
          setTimeout(() => {
            isDraggingRef.current = false
          }, 50)
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          if (isDraggingRef.current) {
            e.preventDefault()
            e.stopPropagation()
            return
          }
          toggleModal()
        }}
        animate={{
          opacity: isModalOpen ? 0 : 1,
          scale: isModalOpen ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={`fixed bottom-6 right-6 z-40 h-10 w-10 rounded-full flex items-center justify-center border bg-zinc-900/90 text-white backdrop-blur-md transition-colors duration-300 shadow-lg cursor-pointer ${
          isModalOpen ? "pointer-events-none" : "pointer-events-auto"
        } ${
          pomodoroIsRunning
            ? pomodoroPhase === "focus"
              ? "border-violet-500 shadow-violet-500/20"
              : "border-emerald-500 shadow-emerald-500/20"
            : "border-white/10 hover:border-white/20"
        }`}
        aria-label="Toggle Pomodoro Panel"
        title="Open Pomodoro Timer"
      >
        <div className="relative pointer-events-none">
          <Timer className={`h-5 w-5 ${
            pomodoroIsRunning
              ? pomodoroPhase === "focus"
                ? "text-violet-400 animate-pulse"
                : "text-emerald-400 animate-pulse"
              : "text-muted-foreground"
          }`} />
          {pomodoroIsRunning && (
            <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-zinc-900 ${
              pomodoroPhase === "focus" ? "bg-violet-500" : "bg-emerald-500"
            }`} />
          )}
        </div>
      </motion.button>
      {/* Pomodoro Floating Modal (global - persists across pages) */}
      <PomodoroModal buttonRect={buttonRect} />
      {/* Pomodoro Picture-in-Picture Controller */}
      <PomodoroPipController />
    </div>
  )
}
