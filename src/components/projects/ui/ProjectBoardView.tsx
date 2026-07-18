"use client"

import React, { useState, useRef, useEffect } from "react"
import { Project, ProjectTask } from "@/hooks/useProjects"
import { formatDate, isOverdue } from "@/hooks/useProjectsPage"
import {
  Plus,
  Trash2,
  Check,
  Loader2,
  Calendar,
  AlertCircle,
  Folder,
  FolderOpen,
  Trophy,
  TrendingUp,
  Inbox,
  AlertTriangle,
  ChevronLeft,
  Edit2,
} from "lucide-react"
import { ListSkeleton } from "@/components/ui/Skeletons"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorState } from "@/components/ui/ErrorState"

interface DropdownOption {
  value: string
  label: string
  dotClass?: string
}

const PROJECT_STATUS_OPTIONS: DropdownOption[] = [
  { value: "Planning", label: "Planning", dotClass: "bg-slate-400 dark:bg-slate-500" },
  { value: "In Progress", label: "In Progress", dotClass: "bg-blue-400 dark:bg-blue-500" },
  { value: "On Hold", label: "On Hold", dotClass: "bg-amber-400 dark:bg-amber-500" },
  { value: "Completed", label: "Completed", dotClass: "bg-emerald-400 dark:bg-emerald-500" },
]

const PROJECT_PRIORITY_OPTIONS: DropdownOption[] = [
  { value: "Low", label: "Low", dotClass: "bg-slate-400 dark:bg-slate-500" },
  { value: "Medium", label: "Medium", dotClass: "bg-indigo-400 dark:bg-indigo-500" },
  { value: "High", label: "High", dotClass: "bg-rose-400 dark:bg-rose-500" },
]

interface CustomBadgeDropdownProps {
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  disabled?: boolean
  theme: { bg: string; text: string; border: string }
  showDot?: boolean
  align?: "left" | "right"
}

function CustomBadgeDropdown({
  value,
  options,
  onChange,
  disabled = false,
  theme,
  showDot = false,
  align = "left",
}: CustomBadgeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const selectedOption = options.find((opt) => opt.value === value) || options[0]

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) setIsOpen(!isOpen)
        }}
        className={`px-2 py-0.5 rounded-full border flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 duration-200 select-none ${theme.bg} ${theme.text} ${theme.border} ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {showDot && (
          <div className={`h-1.5 w-1.5 rounded-full shadow-[0_0_5px_currentColor] ${selectedOption.dotClass || "bg-current"}`} />
        )}
        <span className="text-[9px] font-bold uppercase tracking-wider">{selectedOption.label}</span>
      </button>

      {isOpen && (
        <div className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 w-36 origin-top-left rounded-xl border border-border/85 bg-card/90 backdrop-blur-md p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-150`}>
          <div className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors duration-150 ${isSelected
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {showDot && option.dotClass && (
                      <div className={`h-1.5 w-1.5 rounded-full ${option.dotClass}`} />
                    )}
                    <span>{option.label}</span>
                  </div>
                  {isSelected && <Check className="h-3 w-3 text-primary stroke-[3]" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


const PRIORITY_THEMES: Record<string, { bg: string; text: string; border: string }> = {
  High: {
    bg: "bg-rose-500/10",
    text: "text-rose-500 dark:text-rose-400",
    border: "border-rose-500/20",
  },
  Medium: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
  },
  Low: {
    bg: "bg-slate-500/10",
    text: "text-slate-500 dark:text-slate-400",
    border: "border-slate-500/20",
  },
}

const STATUS_THEMES: Record<string, { bg: string; text: string; border: string }> = {
  Planning: {
    bg: "bg-slate-500/10",
    text: "text-slate-500 dark:text-slate-400",
    border: "border-slate-500/20",
  },
  "In Progress": {
    bg: "bg-blue-500/10",
    text: "text-blue-500 dark:text-blue-400",
    border: "border-blue-500/20",
  },
  "On Hold": {
    bg: "bg-amber-500/10",
    text: "text-amber-500 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  Completed: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
}

interface ProjectBoardViewProps {
  projectsList: Project[]
  isLoading: boolean
  isError: boolean
  selectedProjectId: string | null
  setSelectedProjectId: (id: string | null) => void
  showAddProject: boolean
  setShowAddProject: (show: boolean) => void
  projectName: string
  setProjectName: (name: string) => void
  projectDesc: string
  setProjectDesc: (desc: string) => void
  projectPriority: string
  setProjectPriority: (priority: string) => void
  projectStatus: string
  setProjectStatus: (status: string) => void
  projectDeadline: string
  setProjectDeadline: (deadline: string) => void
  projectError: string | null
  taskName: string
  setTaskName: (name: string) => void
  taskPriority: string
  setTaskPriority: (priority: string) => void
  taskDeadline: string
  setTaskDeadline: (deadline: string) => void
  taskError: string | null
  activeProject: Project | null
  handleAddProject: (e: React.FormEvent) => Promise<void>
  handleDeleteProject: (id: string, e: React.MouseEvent) => Promise<void>
  handleAddTask: (e: React.FormEvent) => Promise<void>
  handleDeleteTask: (id: string) => Promise<void>
  handleToggleTask: (id: string, completed: boolean) => void
  subTaskInputs: Record<string, string>
  setSubTaskInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>
  subTaskErrors: Record<string, string>
  handleAddSubTask: (e: React.FormEvent, taskId: string) => Promise<void>
  handleDeleteSubTask: (id: string) => Promise<void>
  handleToggleSubTask: (id: string, completed: boolean) => void
  handleUpdateProjectStatus: (id: string, status: string) => Promise<void>
  handleUpdateProjectPriority: (id: string, priority: string) => Promise<void>
  handleUpdateTaskPriority: (id: string, priority: string) => Promise<void>
  handleUpdateProjectDeadline: (id: string, deadline: string) => Promise<void>
  handleUpdateTaskDeadline: (id: string, deadline: string) => Promise<void>
  handleUpdateProjectName: (id: string, name: string) => Promise<void>
  handleUpdateProjectDesc: (id: string, description: string | null) => Promise<void>
  handleUpdateTaskName: (id: string, name: string) => Promise<void>
  isPendingProjectCreate: boolean
  isPendingProjectDelete: boolean
  isPendingTaskCreate: boolean
  isPendingTaskDelete: boolean
  isPendingTaskToggle: boolean
  isPendingSubTaskCreate: boolean
  isPendingSubTaskDelete: boolean
  isPendingSubTaskToggle: boolean
  isPendingProjectUpdate: boolean
  isPendingTaskUpdate: boolean
}

export function ProjectBoardView({
  projectsList,
  isLoading,
  isError,
  selectedProjectId,
  setSelectedProjectId,
  showAddProject,
  setShowAddProject,
  projectName,
  setProjectName,
  projectDesc,
  setProjectDesc,
  projectPriority,
  setProjectPriority,
  projectStatus,
  setProjectStatus,
  projectDeadline,
  setProjectDeadline,
  projectError,
  taskName,
  setTaskName,
  taskPriority,
  setTaskPriority,
  taskDeadline,
  setTaskDeadline,
  taskError,
  activeProject,
  handleAddProject,
  handleDeleteProject,
  handleAddTask,
  handleDeleteTask,
  handleToggleTask,
  subTaskInputs,
  setSubTaskInputs,
  subTaskErrors,
  handleAddSubTask,
  handleDeleteSubTask,
  handleToggleSubTask,
  handleUpdateProjectStatus,
  handleUpdateProjectPriority,
  handleUpdateTaskPriority,
  handleUpdateProjectDeadline,
  handleUpdateTaskDeadline,
  handleUpdateProjectName,
  handleUpdateProjectDesc,
  handleUpdateTaskName,
  isPendingProjectCreate,
  isPendingProjectDelete,
  isPendingTaskCreate,
  isPendingTaskDelete,
  isPendingTaskToggle,
  isPendingSubTaskCreate,
  isPendingSubTaskDelete,
  isPendingSubTaskToggle,
  isPendingProjectUpdate,
  isPendingTaskUpdate,
}: ProjectBoardViewProps) {
  // Local inline editing states for active project name & description
  const [isEditingProjectName, setIsEditingProjectName] = useState(false)
  const [tempProjectName, setTempProjectName] = useState("")

  const [isEditingProjectDesc, setIsEditingProjectDesc] = useState(false)
  const [tempProjectDesc, setTempProjectDesc] = useState("")

  // Local inline editing states for tasks
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [tempTaskName, setTempTaskName] = useState("")

  // Optional multi-item batch creation state for tasks
  const [extraProjectTaskRows, setExtraProjectTaskRows] = useState<Array<{ id: string; name: string; priority: string; deadline: string }>>([])

  const handleTaskBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskName.trim()) return

    await handleAddTask(e)

    if (extraProjectTaskRows.length > 0) {
      for (const row of extraProjectTaskRows) {
        if (row.name.trim()) {
          setTaskName(row.name.trim())
          setTaskPriority(row.priority || "Medium")
          setTaskDeadline(row.deadline || "")
          const fakeEvent = { preventDefault: () => {} } as React.FormEvent
          await handleAddTask(fakeEvent)
        }
      }
      setExtraProjectTaskRows([])
    }
  }

  const handleSaveProjectName = () => {
    if (activeProject && tempProjectName.trim() && tempProjectName.trim() !== activeProject.name) {
      handleUpdateProjectName(activeProject.id, tempProjectName)
    }
    setIsEditingProjectName(false)
  }

  const handleSaveProjectDesc = () => {
    if (activeProject) {
      const descVal = tempProjectDesc.trim() || null
      const originalDesc = activeProject.description
      if (descVal !== originalDesc) {
        handleUpdateProjectDesc(activeProject.id, descVal)
      }
    }
    setIsEditingProjectDesc(false)
  }

  const handleSaveTaskName = (taskId: string) => {
    if (tempTaskName.trim()) {
      handleUpdateTaskName(taskId, tempTaskName)
    }
    setEditingTaskId(null)
  }
  const sortedProjects = [...projectsList].sort((a, b) => {
    // 1. Completed projects always go to the bottom
    const aCompleted = a.status === "Completed"
    const bCompleted = b.status === "Completed"
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1
    }

    // 2. Sort active projects by deadline (closest date first)
    if (a.deadline && b.deadline) {
      const aTime = new Date(a.deadline).getTime()
      const bTime = new Date(b.deadline).getTime()
      if (aTime !== bTime) {
        return aTime - bTime
      }
    } else if (a.deadline) {
      return -1 // a has deadline, b doesn't -> a comes first
    } else if (b.deadline) {
      return 1 // b has deadline, a doesn't -> b comes first
    }

    // 3. If deadlines are same or both are null, sort by priority (High > Medium > Low)
    const priorityWeights: Record<string, number> = { High: 3, Medium: 2, Low: 1 }
    const aWeight = priorityWeights[a.priority] || 2
    const bWeight = priorityWeights[b.priority] || 2
    if (aWeight !== bWeight) {
      return bWeight - aWeight
    }

    // 4. Fallback to creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-200 w-full min-w-0">
      {/* Left Column: Projects List */}
      <div className={`md:col-span-5 xl:col-span-4 space-y-6 min-w-0 ${selectedProjectId ? "hidden md:block" : "block"}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Projects List
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select or create a workspace
            </p>
          </div>
          <button
            onClick={() => setShowAddProject(!showAddProject)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-tr from-primary to-primary/80 px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-[0_4px_14px_0_rgba(var(--primary),0.39)] transition-all hover:shadow-[0_6px_20px_rgba(var(--primary),0.23)] hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {showAddProject ? "Cancel" : "Add Project"}
          </button>
        </div>

        {/* Add Project Card Form */}
        {showAddProject ? (
          <form
            onSubmit={handleAddProject}
            className="bento-card p-4 space-y-4 animate-in slide-in-from-top-4 duration-200"
          >
            <div className="space-y-1.5">
              <label htmlFor="projectName" className="text-xs font-bold text-muted-foreground">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., SansOS redesign, Travel planning..."
                className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="projectDesc" className="text-xs font-bold text-muted-foreground">
                Description
              </label>
              <textarea
                id="projectDesc"
                rows={2}
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Write description or goals..."
                className="w-full rounded-xl border border-border bg-background/50 p-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none shadow-sm"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="projectPriority" className="text-xs font-bold text-muted-foreground">
                  Priority
                </label>
                <select
                  id="projectPriority"
                  value={projectPriority}
                  onChange={(e) => setProjectPriority(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="projectStatus" className="text-xs font-bold text-muted-foreground">
                  Status
                </label>
                <select
                  id="projectStatus"
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="projectDeadline" className="text-xs font-bold text-muted-foreground">
                Deadline
              </label>
              <input
                id="projectDeadline"
                type="date"
                value={projectDeadline}
                onChange={(e) => setProjectDeadline(e.target.value)}
                className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
              />
            </div>

            {projectError && (
              <p className="text-xs text-destructive flex items-center gap-1 font-semibold">
                <AlertCircle className="h-3.5 w-3.5" />
                {projectError}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
              <button
                type="button"
                onClick={() => setShowAddProject(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-secondary/30 px-4 py-2.5 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:bg-secondary/60 hover:text-foreground hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPendingProjectCreate}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isPendingProjectCreate ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Create Workspace"
                )}
              </button>
            </div>
          </form>
        ) : null}

        {/* Project Cards Grid */}
        <div className="space-y-3.5">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-24 w-full bg-muted/25 dark:bg-card/15 animate-pulse rounded-2xl border border-border/60" />
              <div className="h-24 w-full bg-muted/25 dark:bg-card/15 animate-pulse rounded-2xl border border-border/60" />
            </div>
          ) : isError ? (
            <ErrorState className="h-44 text-xs font-semibold" message="Error loading projects." />
          ) : projectsList.length === 0 ? (
            <EmptyState
              className="py-12 p-2"
              title="No projects added yet."
              description="Create a project to start planning."
            />
          ) : (
            sortedProjects.map((project: Project) => {
              const totalTasks = project.tasks.length
              const completedTasks = project.tasks.filter((t) => t.completed).length
              const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

              const isSelected = project.id === selectedProjectId
              const priorityTheme = PRIORITY_THEMES[project.priority] || PRIORITY_THEMES.Medium
              const statusTheme = STATUS_THEMES[project.status] || STATUS_THEMES.Planning
              const isOver = isOverdue(project.deadline, project.status === "Completed")

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`group relative rounded-2xl border p-5 transition-all duration-300 cursor-pointer select-none overflow-hidden min-w-0 ${isSelected
                    ? "border-primary/50 bg-gradient-to-br from-primary/10 via-card to-card shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)]"
                    : "border-border/40 bg-card/40 hover:bg-card/80 shadow-sm hover:border-primary/30 hover:shadow-glow"
                    }`}
                >
                  <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100" />

                  <div className="relative space-y-4 min-w-0">
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${isSelected ? "bg-primary/20 border-primary/30 text-primary" : "bg-secondary/50 border-border/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20"
                          }`}>
                          {isSelected ? (
                            <FolderOpen className="h-5 w-5 animate-in fade-in" />
                          ) : (
                            <Folder className="h-5 w-5" />
                          )}
                        </div>
                        <div className="space-y-1 min-w-0 pt-0.5">
                          <h4 className="text-[15px] font-bold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                            {project.name}
                          </h4>
                          {project.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1 leading-normal">
                              {project.description}
                            </p>
                          )}
                          <div className="px-2.5 py-1 text-[9px] rounded-full border border-border/30 bg-secondary/30 text-muted-foreground font-medium w-fit mt-100">
                            Added: {formatDate(project.createdAt)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        disabled={isPendingProjectDelete}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                        aria-label={`Delete project ${project.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Progress Slider */}
                    <div className="space-y-2 bg-background/40 rounded-xl p-3 border border-border/30">
                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Progress</span>
                        <span className="text-foreground">{completedTasks}/{totalTasks} ({progressPct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-secondary/80 dark:bg-white/10 rounded-full overflow-hidden border border-border/20">
                        <div
                          className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Badges footer */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[9px] font-bold uppercase tracking-wider">
                      <span className={`px-2.5 py-1 rounded-full border flex items-center gap-1 ${statusTheme.bg} ${statusTheme.text} ${statusTheme.border}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${statusTheme.text.split(' ')[0].replace('text-', 'bg-')} shadow-[0_0_5px_currentColor]`} />
                        {project.status}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full border ${priorityTheme.bg} ${priorityTheme.text} ${priorityTheme.border}`}>
                        {project.priority}
                      </span>
                      {project.deadline && (
                        <span className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${isOver
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20 dark:text-rose-400"
                          : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                          }`}>
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{formatDate(project.deadline)}</span>
                          {isOver && <AlertTriangle className="h-3 w-3 shrink-0 animate-pulse text-rose-500" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right Column: Project Tasks Detail Workspace */}
      <div className={`md:col-span-7 xl:col-span-8 ${!selectedProjectId ? "hidden md:block" : "block"}`}>
        {isLoading ? (
          <div className="bento-card p-6 min-h-[400px] space-y-6">
            <div className="border-b border-border/40 pb-4 space-y-2 animate-pulse">
              <div className="h-6 w-1/3 bg-muted/70 rounded-md" />
              <div className="h-4 w-1/2 bg-muted/60 rounded-md" />
            </div>
            <ListSkeleton count={4} />
          </div>
        ) : isError ? (
          <ErrorState className="min-h-[400px] h-auto p-8" message="Failed to load active workspace." />
        ) : !activeProject ? (
          <EmptyState
            className="min-h-[400px] py-16 p-8"
            title="No Project Selected"
            description="Select an existing workspace from the list or create a new project to start scheduling task deliverables."
            icon={
              <div className="rounded-full bg-secondary p-4 text-muted-foreground/60">
                <Inbox className="h-10 w-10" />
              </div>
            }
          />
        ) : (
          <div className="bento-card p-4 sm:p-6 min-h-[400px] space-y-6">
            {/* Project Header details */}
            <div className="border-b border-border/40 pb-5 space-y-4">
              <button
                onClick={() => setSelectedProjectId(null)}
                className="md:hidden inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground mb-1 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Projects
              </button>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest">
                    <TrendingUp className="h-3.5 w-3.5" /> Workspace Agenda
                  </span>
                  {isEditingProjectName ? (
                    <input
                      type="text"
                      value={tempProjectName}
                      onChange={(e) => setTempProjectName(e.target.value)}
                      onBlur={handleSaveProjectName}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveProjectName()
                        if (e.key === "Escape") setIsEditingProjectName(false)
                      }}
                      className="bg-secondary/40 border border-border/50 text-2xl font-black text-foreground rounded-xl px-3.5 py-1.5 w-full focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all max-w-md shadow-inner"
                      autoFocus
                    />
                  ) : (
                    <h3
                      onClick={() => {
                        setTempProjectName(activeProject.name)
                        setIsEditingProjectName(true)
                      }}
                      className="text-2xl font-black text-foreground tracking-tight cursor-pointer hover:text-primary transition-colors flex items-center gap-2 group w-fit"
                    >
                      {activeProject.name}
                      <Edit2 className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity text-muted-foreground" />
                    </h3>
                  )}
                  {isEditingProjectDesc ? (
                    <textarea
                      value={tempProjectDesc}
                      onChange={(e) => setTempProjectDesc(e.target.value)}
                      onBlur={handleSaveProjectDesc}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSaveProjectDesc()
                        }
                        if (e.key === "Escape") setIsEditingProjectDesc(false)
                      }}
                      rows={2}
                      className="bg-secondary/40 border border-border/50 text-sm text-foreground rounded-xl p-3 w-full resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-inner"
                      autoFocus
                    />
                  ) : (
                    <p
                      onClick={() => {
                        setTempProjectDesc(activeProject.description || "")
                        setIsEditingProjectDesc(true)
                      }}
                      className="text-sm text-muted-foreground leading-relaxed cursor-pointer hover:text-primary transition-colors min-h-[1.5rem] flex items-center gap-2 group w-fit"
                    >
                      {activeProject.description || <span className="italic text-xs opacity-50">Add description...</span>}
                      <Edit2 className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity text-muted-foreground" />
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold tracking-wider uppercase self-start">
                  <CustomBadgeDropdown
                    value={activeProject.status}
                    options={PROJECT_STATUS_OPTIONS}
                    onChange={(val) => handleUpdateProjectStatus(activeProject.id, val)}
                    disabled={isPendingProjectUpdate}
                    theme={STATUS_THEMES[activeProject.status] || STATUS_THEMES.Planning}
                    showDot={true}
                    align="right"
                  />
                  <CustomBadgeDropdown
                    value={activeProject.priority}
                    options={PROJECT_PRIORITY_OPTIONS}
                    onChange={(val) => handleUpdateProjectPriority(activeProject.id, val)}
                    disabled={isPendingProjectUpdate}
                    theme={PRIORITY_THEMES[activeProject.priority] || PRIORITY_THEMES.Medium}
                    align="right"
                  />
                </div>
              </div>

              {/* Deadline alert row */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>Deadline: </span>
                  <span className="relative inline-block font-semibold text-foreground cursor-pointer hover:text-primary transition-colors underline decoration-dotted decoration-border/60 hover:decoration-primary">
                    {activeProject.deadline ? formatDate(activeProject.deadline) : "No deadline"}
                    <input
                      type="date"
                      value={activeProject.deadline ? (() => {
                        try {
                          return new Date(activeProject.deadline).toISOString().split('T')[0]
                        } catch {
                          return ""
                        }
                      })() : ""}
                      onChange={(e) => handleUpdateProjectDeadline(activeProject.id, e.target.value)}
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker();
                        } catch { }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      aria-label="Change project deadline"
                    />
                  </span>
                  {activeProject.deadline && isOverdue(activeProject.deadline, activeProject.status === "Completed") && (
                    <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/20 ml-2 uppercase animate-pulse">
                      <AlertTriangle className="h-3 w-3" /> Overdue
                    </span>
                  )}
                </div>

                <span className="text-border/40 select-none">•</span>

                <div className="flex items-center gap-1.5">
                  <span className="font-medium">Added:</span>
                  <span className="font-semibold text-foreground">{formatDate(activeProject.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Task list sub-section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                Tasks Checklist
              </h4>

              {activeProject.tasks.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground border border-dashed border-border/60 rounded-xl bg-background/50">
                  No deliverables created for this project. Use the form below to add your first subtask.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[...activeProject.tasks]
                    .sort((a, b) => {
                      if (a.completed !== b.completed) return a.completed ? 1 : -1
                      // Sort by createdAt DESC (newest first)
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    })
                    .map((task: ProjectTask) => {
                      const isTaskOver = isOverdue(task.deadline, task.completed)
                      const taskPriorityTheme = PRIORITY_THEMES[task.priority] || PRIORITY_THEMES.Medium

                      return (
                        <div key={task.id} className="space-y-2">
                          <div
                            className={`flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 ${task.completed
                              ? "border-border/40 bg-secondary/20 opacity-70"
                              : "border-border/60 bg-card/40 shadow-sm hover:border-primary/30 hover:bg-card/70"
                              }`}
                          >
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                              <button
                                onClick={() => handleToggleTask(task.id, task.completed)}
                                disabled={isPendingTaskToggle}
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${task.completed
                                  ? "bg-primary border-primary text-primary-foreground shadow-glow"
                                  : "border-border/65 hover:border-primary/50 bg-card"
                                  }`}
                                aria-label="Toggle task completed"
                              >
                                {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </button>

                              <div className="flex flex-col min-w-0 pr-3">
                                {editingTaskId === task.id ? (
                                  <input
                                    type="text"
                                    value={tempTaskName}
                                    onChange={(e) => setTempTaskName(e.target.value)}
                                    onBlur={() => handleSaveTaskName(task.id)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSaveTaskName(task.id)
                                      if (e.key === "Escape") setEditingTaskId(null)
                                    }}
                                    className="bg-secondary/35 border border-border/40 text-xs font-semibold text-foreground rounded-lg px-2.5 py-1 w-full focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                                    autoFocus
                                  />
                                ) : (
                                  <span
                                    onClick={() => {
                                      setEditingTaskId(task.id)
                                      setTempTaskName(task.name)
                                    }}
                                    className={`text-xs font-semibold break-words whitespace-normal leading-tight cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5 group ${
                                      task.completed ? "line-through text-muted-foreground font-normal" : "text-foreground"
                                    }`}
                                  >
                                    {task.name}
                                    <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity text-muted-foreground shrink-0" />
                                  </span>
                                )}

                                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[8px] font-extrabold uppercase tracking-wide">
                                  <CustomBadgeDropdown
                                    value={task.priority}
                                    options={PROJECT_PRIORITY_OPTIONS}
                                    onChange={(val) => handleUpdateTaskPriority(task.id, val)}
                                    disabled={isPendingTaskUpdate}
                                    theme={taskPriorityTheme}
                                  />
                                  <div className="relative inline-flex items-center group/deadline">
                                    <input
                                      type="date"
                                      value={task.deadline ? (() => {
                                        try {
                                          return new Date(task.deadline).toISOString().split('T')[0]
                                        } catch {
                                          return ""
                                        }
                                      })() : ""}
                                      onChange={(e) => handleUpdateTaskDeadline(task.id, e.target.value)}
                                      onClick={(e) => {
                                        try {
                                          e.currentTarget.showPicker()
                                        } catch (err) {
                                          console.error(err)
                                        }
                                      }}
                                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-20"
                                      aria-label="Change task deadline"
                                    />
                                    <span className={`px-1.5 py-0.5 rounded-full border flex items-center gap-1 transition-all ${
                                      task.deadline 
                                        ? isTaskOver
                                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20"
                                          : "bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20"
                                        : "bg-secondary/30 text-muted-foreground border-border/30 hover:bg-secondary/60 hover:text-foreground hover:border-border/60"
                                    }`}>
                                      <Calendar className="h-2.5 w-2.5 shrink-0" />
                                      <span>{task.deadline ? formatDate(task.deadline) : "Set Deadline"}</span>
                                    </span>
                                  </div>
                                  <span className="px-1.5 py-0.5 rounded-full border border-border/30 bg-secondary/30 text-muted-foreground flex items-center gap-1">
                                    Added: {formatDate(task.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              disabled={isPendingTaskDelete}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                              aria-label="Delete task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Nested Sub-Tasks Area */}
                          <div className="pl-11 pr-2 space-y-2 pb-3 pt-1">
                            {task.subTasks && task.subTasks.length > 0 && (
                              <div className="space-y-1.5">
                                {task.subTasks
                                  .sort((a, b) => {
                                    if (a.completed !== b.completed) return a.completed ? 1 : -1
                                    return a.createdAt.localeCompare(b.createdAt)
                                  })
                                  .map((st) => (
                                    <div
                                      key={st.id}
                                      onClick={() => !isPendingSubTaskToggle && handleToggleSubTask(st.id, st.completed)}
                                      className="group flex items-center justify-between py-1 px-2 -mx-2 rounded-lg hover:bg-secondary/40 cursor-pointer transition-colors"
                                    >
                                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleToggleSubTask(st.id, st.completed)
                                          }}
                                          disabled={isPendingSubTaskToggle}
                                          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px] border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${st.completed
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : "border-border/65 hover:border-primary/50 bg-card"
                                            }`}
                                        >
                                          {st.completed && <Check className="h-2.5 w-2.5 stroke-[4]" />}
                                        </button>
                                        <span
                                          className={`text-[11px] min-w-0 break-words ${st.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"
                                            }`}
                                        >
                                          {st.name}
                                        </span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteSubTask(st.id)
                                        }}
                                        disabled={isPendingSubTaskDelete}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            )}

                            {/* Inline Add Sub-Task Form */}
                            <form onSubmit={(e) => handleAddSubTask(e, task.id)} className="flex items-center gap-2 mt-2">
                              <input
                                type="text"
                                value={subTaskInputs[task.id] || ""}
                                onChange={(e) => setSubTaskInputs((prev) => ({ ...prev, [task.id]: e.target.value }))}
                                placeholder="Add a sub-task..."
                                className="flex-1 min-w-0 bg-transparent border-b border-dashed border-border/60 hover:border-primary/40 focus:border-primary px-1 py-1 text-[11px] outline-none transition-all placeholder:text-muted-foreground/60"
                              />
                              <button
                                type="submit"
                                disabled={isPendingSubTaskCreate || !(subTaskInputs[task.id]?.trim())}
                                className="shrink-0 rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-50 disabled:hover:bg-transparent"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </form>
                            {subTaskErrors[task.id] && (
                              <p className="text-[10px] text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {subTaskErrors[task.id]}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Add task inline form */}
            <form onSubmit={handleTaskBatchSubmit} className="border-t border-border/40 pt-5 space-y-3">
              <div className="flex flex-col gap-3 lg:flex-row">
                <input
                  type="text"
                  required
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Add new subtask deliverables..."
                  className="flex-1 rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 min-w-0 shadow-sm"
                />

                <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-2 shrink-0">
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="col-span-1 sm:w-auto rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
                    aria-label="Task priority selection"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>

                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="col-span-1 w-full sm:w-[130px] rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
                    aria-label="Task deadline selection"
                  />

                  <button
                    type="submit"
                    disabled={isPendingTaskCreate || !taskName.trim()}
                    className="col-span-2 sm:col-span-1 inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {isPendingTaskCreate ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <Plus className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Extra Task Rows (Optional Multi-Item Batch Creation) */}
              {extraProjectTaskRows.map((row, idx) => (
                <div key={row.id} className="flex flex-col gap-3 lg:flex-row pt-2 border-t border-dashed border-border/30 relative">
                  <input
                    type="text"
                    required
                    value={row.name}
                    onChange={(e) => {
                      const updated = [...extraProjectTaskRows]
                      updated[idx].name = e.target.value
                      setExtraProjectTaskRows(updated)
                    }}
                    placeholder={`Deliverable #${idx + 2}...`}
                    className="flex-1 rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 min-w-0 shadow-sm"
                  />

                  <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-2 shrink-0">
                    <select
                      value={row.priority}
                      onChange={(e) => {
                        const updated = [...extraProjectTaskRows]
                        updated[idx].priority = e.target.value
                        setExtraProjectTaskRows(updated)
                      }}
                      className="col-span-1 sm:w-auto rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>

                    <input
                      type="date"
                      value={row.deadline}
                      onChange={(e) => {
                        const updated = [...extraProjectTaskRows]
                        updated[idx].deadline = e.target.value
                        setExtraProjectTaskRows(updated)
                      }}
                      className="col-span-1 w-full sm:w-[130px] rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
                    />

                    <button
                      type="button"
                      onClick={() => setExtraProjectTaskRows(extraProjectTaskRows.filter((r) => r.id !== row.id))}
                      className="p-2.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-all shrink-0 cursor-pointer"
                      title="Remove task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* + Add Another Task Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setExtraProjectTaskRows([
                      ...extraProjectTaskRows,
                      { id: Math.random().toString(), name: "", priority: "Medium", deadline: "" },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors py-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add Another Task</span>
                </button>
              </div>

              {taskError && (
                <p className="text-xs text-destructive flex items-center gap-1 font-semibold animate-in slide-in-from-top-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {taskError}
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
