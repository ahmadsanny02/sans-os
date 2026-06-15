import { create } from "zustand"

export interface UserConfig {
  startOfWeek: number // 0 = Sunday, 1 = Monday
  theme: "light" | "dark" | "system"
}

export interface WorkspaceState {
  activeDate: string // Date string format YYYY-MM-DD
  sidebarOpen: boolean
  userConfig: UserConfig
  setActiveDate: (date: string) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  updateUserConfig: (config: Partial<UserConfig>) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeDate: (() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  })(),
  sidebarOpen: true,
  userConfig: {
    startOfWeek: 1, // Default Monday per Indonesia standard
    theme: "dark",
  },
  setActiveDate: (date: string): void => {
    set({ activeDate: date })
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
