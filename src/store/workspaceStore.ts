import { create } from "zustand"

export interface UserConfig {
  startOfWeek: number // 0 = Sunday, 1 = Monday
  theme: "light" | "dark" | "system"
}

export function getTodayDateString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export interface WorkspaceState {
  activeDate: string // Date string format YYYY-MM-DD
  realTodayDate: string // Date string format YYYY-MM-DD
  sidebarOpen: boolean
  userConfig: UserConfig
  setActiveDate: (date: string) => void
  setRealTodayDate: (date: string) => void
  checkRollover: () => boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  updateUserConfig: (config: Partial<UserConfig>) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeDate: getTodayDateString(),
  realTodayDate: getTodayDateString(),
  sidebarOpen: true,
  userConfig: {
    startOfWeek: 1, // Default Monday per Indonesia standard
    theme: "dark",
  },
  setActiveDate: (date: string): void => {
    set({ activeDate: date })
  },
  setRealTodayDate: (date: string): void => {
    set({ realTodayDate: date })
  },
  checkRollover: (): boolean => {
    const today = getTodayDateString()
    const { realTodayDate, activeDate } = get()
    if (today !== realTodayDate) {
      const wasOnToday = activeDate === realTodayDate || activeDate < today
      set({
        realTodayDate: today,
        activeDate: wasOnToday ? today : activeDate,
      })
      return true
    }
    return false
  },
  setSidebarOpen: (open: boolean): void => {
    set({ sidebarOpen: open })
  },
  toggleSidebar: (): void => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },
  updateUserConfig: (config: Partial<UserConfig>): void => {
    set((state) => ({
      userConfig: { ...state.userConfig, ...config },
    }))
  },
}))
