"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { usePomodoroStore } from "@/store/pomodoroStore"
import { PomodoroModal } from "@/components/pomodoro/ui/PomodoroModal"
import { PomodoroExtendModal } from "@/components/pomodoro/ui/PomodoroExtendModal"
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
  ChevronDown,
  ChevronsUpDown,
  Sun,
  Moon,
  Clock,
  Trophy,
  Timer,
  GraduationCap,
} from "lucide-react"

interface SidebarItemChild {
  name: string
  href: string
}

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: SidebarItemChild[]
}

interface SidebarGroup {
  title: string
  items: SidebarItem[]
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Daily Flow", href: "/daily", icon: Clock },
      { name: "Calendar View", href: "/calendar", icon: Calendar },
    ],
  },
  {
    title: "Productivity",
    items: [
      { name: "Projects & Tasks", href: "/projects", icon: Briefcase },
      { name: "Pomodoro", href: "/pomodoro", icon: Timer },
    ],
  },
  {
    title: "Knowledge Hub",
    items: [
      { name: "Learning Hub", href: "/learning", icon: GraduationCap },
      { name: "Reading Journal", href: "/reading", icon: BookOpen },
      {
        name: "Language Logs",
        href: "/language",
        icon: Languages,
        children: [
          { name: "Vocabulary Logs", href: "/language?tab=vocab" },
          { name: "Formula List", href: "/language?tab=formula" },
          { name: "Writing Practice", href: "/language?tab=writing" },
          { name: "Dialogue Practice", href: "/language?tab=dialogue" },
        ],
      },
    ],
  },
  {
    title: "Habits & Vision",
    items: [
      { name: "Habits", href: "/habits", icon: CheckSquare },
      { name: "Vision Board", href: "/vision-board", icon: ImageIcon },
      { name: "Bucket List", href: "/bucket-list", icon: Trophy },
    ],
  },
]

const FLAT_ITEMS = SIDEBAR_GROUPS.flatMap((g) => g.items)

function SidebarNavigation({
  sidebarOpen,
  pathname,
  expandedMenus,
  setExpandedMenus,
  onItemClick,
}: {
  sidebarOpen: boolean
  pathname: string
  expandedMenus: Record<string, boolean>
  setExpandedMenus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  onItemClick?: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isChildActive = (childHref: string) => {
    const [path, query] = childHref.split("?")
    if (pathname !== path) return false
    if (query) {
      const tabName = query.split("tab=")[1]
      return searchParams.get("tab") === tabName
    }
    return true
  }

  const handleParentClick = (item: SidebarItem) => {
    if (item.children) {
      if (sidebarOpen) {
        setExpandedMenus((prev) => ({ ...prev, [item.name]: !prev[item.name] }))
      } else {
        router.push(item.href)
        if (onItemClick) onItemClick()
      }
    } else {
      router.push(item.href)
      if (onItemClick) onItemClick()
    }
  }

  return (
    <div className="space-y-4">
      {SIDEBAR_GROUPS.map((group) => (
        <div key={group.title} className="space-y-1">
          {sidebarOpen ? (
            <span className="px-3.5 py-1.5 text-[9px] font-black tracking-widest text-muted-foreground/50 uppercase block select-none">
              {group.title}
            </span>
          ) : null}

          {group.items.map((item) => {
            const hasChildren = !!item.children
            const isExpanded = !!expandedMenus[item.name]
            const isParentActive =
              pathname === item.href ||
              (hasChildren && pathname.startsWith(item.href))

            const Icon = item.icon

            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => handleParentClick(item)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isParentActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-glow-active"
                      : "hover:bg-sidebar-accent/50 hover:text-foreground text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`h-5 w-5 shrink-0 ${isParentActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    {sidebarOpen ? <span className="truncate">{item.name}</span> : null}
                  </div>
                  {sidebarOpen && hasChildren ? (
                    isExpanded ? (
                      <ChevronDown className={`h-4 w-4 shrink-0 ${isParentActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    ) : (
                      <ChevronRight className={`h-4 w-4 shrink-0 ${isParentActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    )
                  ) : null}
                </button>

                {sidebarOpen && hasChildren && isExpanded && (
                  <div className="ml-5 pl-3 border-l border-sidebar-border/30 space-y-1 py-1 animate-in slide-in-from-top-1 duration-150">
                    {item.children!.map((child) => {
                      const isActive = isChildActive(child.href)
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onItemClick}
                          className={`flex items-center rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                            isActive
                              ? "text-primary bg-primary/10 font-bold"
                              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/20"
                          }`}
                        >
                          {child.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

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

  // Profile menu popup state
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  // Sub-menu expansion states
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})

  // Floating Pomodoro button measurements to position modal
  const [buttonRect, setButtonRect] = useState<{ top: number; left: number; right: number; bottom: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Auto-expand menu on load if pathname matches child link
  useEffect(() => {
    SIDEBAR_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some((child) => pathname.startsWith(child.href.split("?")[0]))
          if (hasActiveChild) {
            setExpandedMenus((prev) => ({ ...prev, [item.name]: true }))
          }
        }
      })
    })
  }, [pathname])

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

  // Synchronize date and check for day rollover in real-time
  useEffect(() => {
    const getLocalDateStr = (): string => {
      const d = new Date()
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    const clientToday = getLocalDateStr()
    const storeRealToday = useWorkspaceStore.getState().realTodayDate
    const storeActiveDate = useWorkspaceStore.getState().activeDate
    const setRealTodayDate = useWorkspaceStore.getState().setRealTodayDate
    const setActiveDate = useWorkspaceStore.getState().setActiveDate

    // 1. Initial client-side sync (correction for timezone difference from SSR)
    if (clientToday !== storeRealToday) {
      setRealTodayDate(clientToday)
      if (storeActiveDate === storeRealToday) {
        setActiveDate(clientToday)
      }
    }

    // 2. Setup periodic check for midnight rollover
    const interval = setInterval(() => {
      const currentToday = getLocalDateStr()
      const currentStoreRealToday = useWorkspaceStore.getState().realTodayDate
      const currentStoreActive = useWorkspaceStore.getState().activeDate

      if (currentToday !== currentStoreRealToday) {
        setRealTodayDate(currentToday)
        
        // If user was viewing "today", automatically update activeDate to the new today
        if (currentStoreActive === currentStoreRealToday) {
          setActiveDate(currentToday)
        }
      }
    }, 10000) // check every 10 seconds

    return () => clearInterval(interval)
  }, [])

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
    <div ref={rootRef} className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-sidebar-border/30 bg-sidebar/85 backdrop-blur-lg text-sidebar-foreground transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border/20 px-3.5 shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow-md shadow-primary/25 shrink-0 select-none">
                S
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-black tracking-wide text-foreground truncate">
                  SansOS
                </span>
                <span className="text-[9px] text-muted-foreground font-semibold truncate leading-none mt-0.5 select-none">
                  Personal OS
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={toggleSidebar}
              className="mx-auto h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm"
              title="Expand Sidebar"
            >
              S
            </button>
          )}

          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground cursor-pointer transition-colors"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft className="h-4.5 w-4.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto min-w-0">
          <Suspense fallback={null}>
            <SidebarNavigation
              sidebarOpen={sidebarOpen}
              pathname={pathname}
              expandedMenus={expandedMenus}
              setExpandedMenus={setExpandedMenus}
            />
          </Suspense>
        </nav>

        {/* Sidebar Footer (Profile Popover Dropdown) */}
        <div className="border-t border-sidebar-border/20 p-3 relative shrink-0">
          {profileMenuOpen && (
            <>
              {/* Overlay transparent background to capture outside clicks and close popover */}
              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setProfileMenuOpen(false)} />
              
              {/* Profile Dropdown Popup Menu */}
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-card border border-border shadow-lg rounded-xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* User info details */}
                <div className="flex items-center gap-2.5 px-2.5 py-2 border-b border-border/40 mb-1 select-none">
                  <div className="h-8.5 w-8.5 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    AS
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-black text-foreground truncate">Ahmad Sanny</span>
                    <span className="text-[10px] text-muted-foreground truncate">sanny@sansos.workspace</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      toggleTheme()
                      setProfileMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold hover:bg-sidebar-accent/50 hover:text-foreground text-muted-foreground transition-all duration-150 cursor-pointer"
                  >
                    {userConfig.theme === "dark" ? (
                      <>
                        <Sun className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 text-slate-700 shrink-0" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handleLogout()
                      setProfileMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all duration-150 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Collapsible Profile Trigger Button */}
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className={`flex w-full items-center justify-between rounded-xl p-2 hover:bg-sidebar-accent/50 text-sidebar-foreground transition-all duration-200 cursor-pointer ${
              profileMenuOpen ? "bg-sidebar-accent/50" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                AS
              </div>
              {sidebarOpen ? (
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-black text-foreground truncate leading-none mb-0.5">Ahmad Sanny</span>
                  <span className="text-[9px] text-muted-foreground truncate leading-none">sanny@sansos.workspace</span>
                </div>
              ) : null}
            </div>
            {sidebarOpen ? <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" /> : null}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Slide-out Drawer) */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden bg-background/80 backdrop-blur-sm">
          <div className="w-64 border-r border-sidebar-border/30 bg-sidebar/95 backdrop-blur-md text-sidebar-foreground flex flex-col h-full animate-in slide-in-from-left duration-250">
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border/20 px-4 shrink-0">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-lg font-bold tracking-wider text-transparent">
                SansOS
              </span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="flex-1 p-3 overflow-y-auto min-w-0">
              <Suspense fallback={null}>
                <SidebarNavigation
                  sidebarOpen={true}
                  pathname={pathname}
                  expandedMenus={expandedMenus}
                  setExpandedMenus={setExpandedMenus}
                  onItemClick={() => setMobileMenuOpen(false)}
                />
              </Suspense>
            </nav>

            {/* Mobile Drawer Footer (Profile Button) */}
            <div className="border-t border-sidebar-border/20 p-3 relative shrink-0">
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute bottom-full left-3 right-3 mb-2 bg-card border border-border shadow-lg rounded-xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center gap-2.5 px-2.5 py-2 border-b border-border/40 mb-1 select-none">
                      <div className="h-8.5 w-8.5 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        AS
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-foreground truncate">Ahmad Sanny</span>
                        <span className="text-[10px] text-muted-foreground truncate">sanny@sansos.workspace</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <button
                        onClick={() => {
                          toggleTheme()
                          setProfileMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold hover:bg-sidebar-accent/50 hover:text-foreground text-muted-foreground transition-all duration-150 cursor-pointer"
                      >
                        {userConfig.theme === "dark" ? (
                          <>
                            <Sun className="h-4 w-4 text-amber-500 shrink-0" />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <Moon className="h-4 w-4 text-slate-700 shrink-0" />
                            <span>Dark Mode</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          handleLogout()
                          setProfileMenuOpen(false)
                          setMobileMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all duration-150 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className={`flex w-full items-center justify-between rounded-xl p-2 hover:bg-sidebar-accent/50 text-sidebar-foreground transition-all duration-200 cursor-pointer ${
                  profileMenuOpen ? "bg-sidebar-accent/50" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    AS
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-xs font-black text-foreground truncate leading-none mb-0.5">Ahmad Sanny</span>
                    <span className="text-[9px] text-muted-foreground truncate leading-none">sanny@sansos.workspace</span>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-14 items-center justify-between border-b border-border/40 bg-card/70 backdrop-blur-md px-4 md:hidden shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-lg font-bold tracking-wider text-transparent">
              SansOS
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer"
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 pb-24 sm:pb-6 bg-background scroll-smooth">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (Quick Navigation) */}
        <nav className="flex h-16 border-t border-border/40 bg-card/75 backdrop-blur-lg md:hidden items-center justify-around pb-safe shrink-0">
          {FLAT_ITEMS.slice(0, 4).map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors duration-200 ${
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
        className={`fixed bottom-6 right-6 z-40 h-10 w-10 rounded-full flex items-center justify-center border bg-card/90 text-foreground backdrop-blur-md transition-all duration-300 shadow-glass cursor-pointer ${
          isModalOpen ? "pointer-events-none" : "pointer-events-auto"
        } ${
          pomodoroIsRunning
            ? pomodoroPhase === "focus"
              ? "border-primary shadow-glow"
              : "border-emerald-500 shadow-glow"
            : "border-border/60 hover:border-primary/40 hover:shadow-glow-active"
        }`}
        aria-label="Toggle Pomodoro Panel"
        title="Open Pomodoro Timer"
      >
        <div className="relative pointer-events-none">
          <Timer className={`h-5 w-5 ${
            pomodoroIsRunning
              ? pomodoroPhase === "focus"
                ? "text-primary animate-pulse"
                : "text-emerald-400 animate-pulse"
              : "text-muted-foreground"
          }`} />
          {pomodoroIsRunning && (
            <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-zinc-900 ${
              pomodoroPhase === "focus" ? "bg-primary" : "bg-emerald-500"
            }`} />
          )}
        </div>
      </motion.button>
      {/* Pomodoro Floating Modal (global - persists across pages) */}
      <PomodoroModal buttonRect={buttonRect} />
      {/* Pomodoro Time Extension Modal (triggers when focus session ends) */}
      <PomodoroExtendModal />
      {/* Pomodoro Picture-in-Picture Controller */}
      <PomodoroPipController />
    </div>
  )
}
