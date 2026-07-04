"use client"

import React from "react"
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
} from "lucide-react"
import { ListSkeleton } from "@/components/ui/Skeletons"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorState } from "@/components/ui/ErrorState"

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
  isPendingProjectCreate: boolean
  isPendingProjectDelete: boolean
  isPendingTaskCreate: boolean
  isPendingTaskDelete: boolean
  isPendingTaskToggle: boolean
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
  isPendingProjectCreate,
  isPendingProjectDelete,
  isPendingTaskCreate,
  isPendingTaskDelete,
  isPendingTaskToggle,
}: ProjectBoardViewProps) {
  const sortedProjects = [...projectsList].sort((a, b) => {
    const aCompleted = a.status === "Completed"
    const bCompleted = b.status === "Completed"
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1
    }
    return 0
  })

  return (
    <div className="grid gap-6 lg:grid-cols-12 animate-in fade-in duration-200">
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95"
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
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
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
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-primary"
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
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-primary"
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
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-primary"
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
                className="rounded-lg border border-border/40 px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPendingProjectCreate}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 flex items-center gap-1"
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
                  className={`group relative rounded-xl border p-4 transition-all duration-300 cursor-pointer select-none ${
                    isSelected
                      ? "border-primary ring-1 ring-primary/35 bg-card shadow-glass"
                      : "border-border/60 bg-card/40 hover:bg-card/75 shadow-sm hover:border-primary/45"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-sm font-bold text-foreground truncate flex items-center gap-1.5 leading-snug">
                          {isSelected ? (
                            <FolderOpen className="h-4.5 w-4.5 text-primary shrink-0 animate-in fade-in" />
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
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                        <span>Progress</span>
                        <span>{completedTasks}/{totalTasks} ({progressPct}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary/80 rounded-full overflow-hidden border border-border/10">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 shadow-glow"
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
          <div className="bento-card p-6 min-h-[400px] space-y-6">
            {/* Project Header details */}
            <div className="border-b border-border/40 pb-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest">
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
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
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
                      return a.name.localeCompare(b.name)
                    })
                    .map((task: ProjectTask) => {
                      const isTaskOver = isOverdue(task.deadline, task.completed)
                      const taskPriorityTheme = PRIORITY_THEMES[task.priority] || PRIORITY_THEMES.Medium

                      return (
                        <div
                          key={task.id}
                          className={`flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                            task.completed
                              ? "border-border/40 bg-secondary/20 opacity-70"
                              : "border-border/60 bg-card/40 shadow-sm hover:border-primary/30 hover:bg-card/70"
                          }`}
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleTask(task.id, task.completed)}
                              disabled={isPendingTaskToggle}
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                task.completed
                                  ? "bg-primary border-primary text-primary-foreground shadow-glow"
                                  : "border-border/65 hover:border-primary/50 bg-card"
                              }`}
                              aria-label="Toggle task completed"
                            >
                              {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            </button>

                            <div className="flex flex-col min-w-0 pr-3">
                              <span
                                className={`text-xs font-semibold break-words whitespace-normal leading-tight ${
                                  task.completed ? "line-through text-muted-foreground font-normal" : "text-foreground"
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
                            disabled={isPendingTaskDelete}
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
            <form onSubmit={handleAddTask} className="border-t border-border/40 pt-5 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  required
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Add new subtask deliverables..."
                  className="flex-1 rounded-lg border border-border/60 bg-background px-3.5 py-2 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                />

                <div className="flex gap-2 shrink-0">
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="rounded-lg border border-border/60 bg-background px-2.5 py-2 text-xs outline-none transition-all focus:border-primary"
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
                    className="rounded-lg border border-border/60 bg-background px-2.5 py-2 text-xs outline-none transition-all focus:border-primary w-[130px]"
                    aria-label="Task deadline selection"
                  />

                  <button
                    type="submit"
                    disabled={isPendingTaskCreate || !taskName.trim()}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 disabled:opacity-50"
                  >
                    {isPendingTaskCreate ? (
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
