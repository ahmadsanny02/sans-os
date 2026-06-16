"use client"

import React, { useState } from "react"
import {
  useProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useToggleTaskMutation,
  Project,
  ProjectTask,
} from "@/hooks/useProjects"
import { format, isPast, isToday } from "date-fns"
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
} from "lucide-react"

// Priority badge color themes
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

// Status badge color themes
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

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "No deadline"
  try {
    const d = new Date(dateStr)
    return format(d, "MMM d, yyyy")
  } catch {
    return "Invalid date"
  }
}

function isOverdue(dateStr: string | null | undefined, completed: boolean = false): boolean {
  if (!dateStr || completed) return false
  try {
    const d = new Date(dateStr)
    // Overdue if in past and not today
    return isPast(d) && !isToday(d)
  } catch {
    return false
  }
}

export function ProjectBoard() {
  const { data: projectsList = [], isLoading, isError } = useProjectsQuery()
  const createProjectMutation = useCreateProjectMutation()
  const deleteProjectMutation = useDeleteProjectMutation()
  const createTaskMutation = useCreateTaskMutation()
  const deleteTaskMutation = useDeleteTaskMutation()
  const toggleTaskMutation = useToggleTaskMutation()

  // Selected project ID
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  // Forms states
  const [showAddProject, setShowAddProject] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectDesc, setProjectDesc] = useState("")
  const [projectPriority, setProjectPriority] = useState("Medium")
  const [projectStatus, setProjectStatus] = useState("Planning")
  const [projectDeadline, setProjectDeadline] = useState("")
  const [projectError, setProjectError] = useState<string | null>(null)

  // Task form states
  const [taskName, setTaskName] = useState("")
  const [taskPriority, setTaskPriority] = useState("Medium")
  const [taskDeadline, setTaskDeadline] = useState("")
  const [taskError, setTaskError] = useState<string | null>(null)

  // Filter project query list
  const activeProject = projectsList.find((p) => p.id === selectedProjectId) || null

  const handleAddProject = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setProjectError(null)
    if (!projectName.trim()) return

    try {
      const newProj = await createProjectMutation.mutateAsync({
        name: projectName,
        description: projectDesc,
        priority: projectPriority,
        status: projectStatus,
        deadline: projectDeadline || undefined,
      })
      setProjectName("")
      setProjectDesc("")
      setProjectPriority("Medium")
      setProjectStatus("Planning")
      setProjectDeadline("")
      setShowAddProject(false)
      setSelectedProjectId(newProj.id)
    } catch {
      setProjectError("Failed to create project.")
    }
  }

  const handleDeleteProject = async (id: string, e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this project? All associated tasks will be permanently removed.")) return
    try {
      await deleteProjectMutation.mutateAsync(id)
      if (selectedProjectId === id) {
        setSelectedProjectId(null)
      }
    } catch {
      alert("Failed to delete project.")
    }
  }

  const handleAddTask = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setTaskError(null)
    if (!selectedProjectId || !taskName.trim()) return

    try {
      await createTaskMutation.mutateAsync({
        projectId: selectedProjectId,
        name: taskName,
        priority: taskPriority,
        deadline: taskDeadline || undefined,
      })
      setTaskName("")
      setTaskPriority("Medium")
      setTaskDeadline("")
    } catch {
      setTaskError("Failed to add task.")
    }
  }

  const handleDeleteTask = async (id: string): Promise<void> => {
    try {
      await deleteTaskMutation.mutateAsync(id)
    } catch {
      alert("Failed to delete task.")
    }
  }

  const handleToggleTask = (id: string, completed: boolean): void => {
    toggleTaskMutation.mutate({ id, completed: !completed })
  }



  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Left Column: Projects List */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-sidebar-primary px-3 py-1.5 text-xs font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/90 hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            {showAddProject ? "Cancel" : "Add Project"}
          </button>
        </div>

        {/* Add Project Card Form */}
        {showAddProject ? (
          <form
            onSubmit={handleAddProject}
            className="rounded-xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-md space-y-4 animate-in slide-in-from-top-4 duration-200"
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
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
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
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10 resize-none"
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
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
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
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
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
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
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
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProjectMutation.isPending}
                className="rounded-lg bg-sidebar-primary px-3 py-1.5 text-xs font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary/95 flex items-center gap-1"
              >
                {createProjectMutation.isPending ? (
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
            <div className="flex h-44 items-center justify-center rounded-xl border border-border bg-card/10">
              <Loader2 className="h-6 w-6 animate-spin text-sidebar-primary" />
            </div>
          ) : isError ? (
            <div className="flex h-44 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 text-xs text-destructive font-semibold">
              Error loading projects.
            </div>
          ) : projectsList.length === 0 ? (
            <div className="rounded-2xl p-2 border border-dashed border-border py-12 text-center text-sm text-muted-foreground bg-card/10">
              No projects added yet. Create a project to start planning.
            </div>
          ) : (
            projectsList.map((project: Project) => {
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
                  className={`group relative rounded-xl border p-4.5 p-2 bg-card/45 hover:bg-card dark:bg-card/25 dark:hover:bg-card/40 transition-all duration-300 cursor-pointer select-none ${
                    isSelected
                      ? "border-sidebar-primary ring-1 ring-sidebar-primary/30 shadow-md"
                      : "border-border shadow-sm hover:border-border-hover"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-sm font-bold text-foreground truncate flex items-center gap-1.5 leading-snug">
                          {isSelected ? (
                            <FolderOpen className="h-4.5 w-4.5 text-violet-500 shrink-0" />
                          ) : (
                            <Folder className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                          )}
                          <span className="truncate">{project.name}</span>
                        </h4>
                        {project.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 leading-normal">
                            {project.description}
                          </p>
                        )}
                      </div>

                      {/* Project deletion trigger */}
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        disabled={deleteProjectMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                        aria-label={`Delete project ${project.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Progress Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                        <span>Progress</span>
                        <span>{completedTasks}/{totalTasks} ({progressPct}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden border border-border/10">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Badges footer */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9px] font-bold uppercase tracking-wider">
                      <span className={`px-2 py-0.5 rounded border ${statusTheme.bg} ${statusTheme.text} ${statusTheme.border}`}>
                        {project.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded border ${priorityTheme.bg} ${priorityTheme.text} ${priorityTheme.border}`}>
                        {project.priority}
                      </span>
                      {project.deadline && (
                        <span className={`px-2 py-0.5 rounded border flex items-center gap-1 ${
                          isOver
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20 dark:text-rose-400"
                            : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                        }`}>
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{formatDate(project.deadline)}</span>
                          {isOver && <AlertTriangle className="h-2.5 w-2.5 shrink-0 animate-pulse text-rose-500" />}
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
      <div className="lg:col-span-7 xl:col-span-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border border-border bg-card/25 dark:bg-card/10 rounded-2xl min-h-[400px] shadow-sm select-none">
            <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border border-border bg-card/25 dark:bg-card/10 rounded-2xl min-h-[400px] shadow-sm select-none text-destructive">
            <AlertCircle className="h-8 w-8 mb-2" />
            <span>Failed to load active workspace.</span>
          </div>
        ) : !activeProject ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border border-border bg-card/25 dark:bg-card/10 rounded-2xl min-h-[400px] shadow-sm select-none">
            <div className="rounded-full bg-secondary p-4 mb-4 text-muted-foreground/60">
              <Inbox className="h-10 w-10" />
            </div>
            <h4 className="text-base font-bold text-foreground">No Project Selected</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
              Select an existing workspace from the list or create a new project to start scheduling task deliverables.
            </p>
          </div>
        ) : (
          <div className="border border-border bg-card dark:bg-card/50 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
            {/* Project Header details */}
            <div className="border-b border-border pb-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                    <TrendingUp className="h-3.5 w-3.5" /> Workspace Agenda
                  </span>
                  <h3 className="text-2xl font-black text-foreground tracking-tight">
                    {activeProject.name}
                  </h3>
                  {activeProject.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {activeProject.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold tracking-wider uppercase self-start">
                  <span className={`px-2 py-0.5 rounded border ${STATUS_THEMES[activeProject.status]?.bg} ${STATUS_THEMES[activeProject.status]?.text} border-border/20`}>
                    {activeProject.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded border ${PRIORITY_THEMES[activeProject.priority]?.bg} ${PRIORITY_THEMES[activeProject.priority]?.text} border-border/20`}>
                    {activeProject.priority}
                  </span>
                </div>
              </div>

              {/* Deadline alert row */}
              {activeProject.deadline && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4 text-violet-500 shrink-0" />
                  <span>Deadline: <span className="font-semibold text-foreground">{formatDate(activeProject.deadline)}</span></span>
                  {isOverdue(activeProject.deadline, activeProject.status === "Completed") && (
                    <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 ml-2 uppercase animate-pulse">
                      <AlertTriangle className="h-3 w-3" /> Overdue
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Task list sub-section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Tasks Checklist
              </h4>

              {activeProject.tasks.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl bg-background/50">
                  No deliverables created for this project. Use the form below to add your first subtask.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Sort tasks: uncompleted first, then by priority/deadline */}
                  {[...activeProject.tasks]
                    .sort((a, b) => {
                      if (a.completed !== b.completed) return a.completed ? 1 : -1
                      return a.name.localeCompare(b.name)
                    })
                    .map((task: ProjectTask) => {
                      const isTaskOver = isOverdue(task.deadline, task.completed)
                      const taskPriorityTheme = PRIORITY_THEMES[task.priority] || PRIORITY_THEMES.Medium

                      return (
                        <div
                          key={task.id}
                          className={`flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 bg-background/40 ${
                            task.completed
                              ? "border-border/40 opacity-60"
                              : "border-border shadow-sm hover:border-sidebar-primary/20"
                          }`}
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleTask(task.id, task.completed)}
                              disabled={toggleTaskMutation.isPending}
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 ${
                                task.completed
                                  ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                                  : "border-border hover:border-sidebar-primary/50"
                              }`}
                              aria-label="Toggle task completed"
                            >
                              {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            </button>

                            <div className="flex flex-col min-w-0 pr-3">
                              <span
                                className={`text-xs font-semibold truncate leading-tight ${
                                  task.completed ? "line-through text-muted-foreground" : "text-foreground"
                                }`}
                              >
                                {task.name}
                              </span>

                              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[8px] font-extrabold uppercase tracking-wide">
                                <span className={`px-1.5 py-0.5 rounded border ${taskPriorityTheme.bg} ${taskPriorityTheme.text} ${taskPriorityTheme.border}`}>
                                  {task.priority}
                                </span>
                                {task.deadline && (
                                  <span className={`px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                                    isTaskOver
                                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                      : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                  }`}>
                                    <Calendar className="h-2.5 w-2.5 shrink-0" />
                                    <span>{formatDate(task.deadline)}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={deleteTaskMutation.isPending}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                            aria-label="Delete task"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Add task inline form */}
            <form onSubmit={handleAddTask} className="border-t border-border/60 pt-5 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  required
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Add new subtask deliverables..."
                  className="flex-1 rounded-lg border border-border bg-background px-3.5 py-2 text-xs outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
                />

                <div className="flex gap-2 shrink-0">
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="rounded-lg border border-border bg-background px-2.5 py-2 text-xs outline-none transition-all focus:border-sidebar-primary"
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
                    className="rounded-lg border border-border bg-background px-2.5 py-2 text-xs outline-none transition-all focus:border-sidebar-primary w-[130px]"
                    aria-label="Task deadline selection"
                  />

                  <button
                    type="submit"
                    disabled={createTaskMutation.isPending || !taskName.trim()}
                    className="inline-flex items-center justify-center rounded-lg bg-sidebar-primary px-3 py-2 text-xs font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/95 disabled:opacity-50"
                  >
                    {createTaskMutation.isPending ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <Plus className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
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
