import React, { useState } from "react"
import {
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  BookOpen,
  ListTodo,
  CheckCircle,
  Clock,
  HelpCircle,
  Check,
} from "lucide-react"
import { LearningSubject, LearningMaterial, LearningTask } from "@/hooks/useLearning"
import { Modal } from "@/components/ui/Modal"

interface SubjectDetailModalProps {
  isOpen: boolean
  onClose: () => void
  subject: LearningSubject | null
  // Material state
  matTitle: string
  setMatTitle: (s: string) => void
  matNotes: string
  setMatNotes: (s: string) => void
  matLink: string
  setMatLink: (s: string) => void
  // Task state
  taskTitle: string
  setTaskTitle: (s: string) => void
  taskDueDate: string
  setTaskDueDate: (s: string) => void
  // Handlers
  onAddMaterial: (e: React.FormEvent) => Promise<void>
  onToggleMaterial: (id: string, currentStatus: string) => Promise<void>
  onDeleteMaterial: (id: string) => Promise<void>
  onAddTask: (e: React.FormEvent) => Promise<void>
  onToggleTask: (id: string, completed: boolean) => Promise<void>
  onDeleteTask: (id: string) => Promise<void>
}

export function SubjectDetailModal({
  isOpen,
  onClose,
  subject,
  matTitle,
  setMatTitle,
  matNotes,
  setMatNotes,
  matLink,
  setMatLink,
  taskTitle,
  setTaskTitle,
  taskDueDate,
  setTaskDueDate,
  onAddMaterial,
  onToggleMaterial,
  onDeleteMaterial,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: SubjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"materials" | "tasks">("materials")

  if (!subject) return null

  // Calculate stats
  const totalMats = subject.materials.length
  const completedMats = subject.materials.filter((m: LearningMaterial) => m.status === "Completed").length
  const inProgressMats = subject.materials.filter((m: LearningMaterial) => m.status === "In Progress").length

  const totalTasks = subject.tasks.length
  const completedTasks = subject.tasks.filter((t: LearningTask) => t.completed).length

  const totalItems = totalMats + totalTasks
  const completedItems = completedMats + completedTasks
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const titleNode = (
    <div className="space-y-1">
      <div className="flex items-center gap-2.5">
        <span
          className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-sm"
          style={{ backgroundColor: subject.color }}
        />
        <span className="text-lg font-black tracking-tight text-foreground leading-none">
          {subject.name}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
          subject.status === "Completed"
            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            : subject.status === "Learning"
            ? "bg-primary/10 text-primary border border-primary/20"
            : "bg-secondary text-muted-foreground border border-border/60"
        }`}>
          {subject.status === "Planned" ? "Planned" : subject.status === "Learning" ? "Learning" : "Completed"}
        </span>
      </div>
      {subject.description && (
        <p className="text-xs font-semibold text-muted-foreground leading-relaxed max-w-[500px]">
          {subject.description}
        </p>
      )}
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleNode}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Overall Progress */}
        <div className="bg-card/45 dark:bg-card/15 border border-border shadow-sm rounded-2xl p-4.5 space-y-2 backdrop-blur-md select-none">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="text-foreground">{progressPercent}% ({completedItems}/{totalItems} Completed)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary/80 overflow-hidden border border-border/30">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: subject.color || "hsl(var(--primary))",
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] font-bold text-muted-foreground text-center">
            <div>Materials: {completedMats}/{totalMats}</div>
            <div>Tasks: {completedTasks}/{totalTasks}</div>
            <div>In Progress: {inProgressMats}</div>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-border/40 mb-1">
          <button
            type="button"
            onClick={() => setActiveTab("materials")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "materials"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground/80"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Materials ({totalMats})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "tasks"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground/80"
            }`}
          >
            <ListTodo className="h-3.5 w-3.5" />
            Tasks ({totalTasks})
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="overflow-y-auto min-h-[220px] max-h-[360px] pr-1.5 space-y-4">
          {activeTab === "materials" ? (
            <div className="space-y-4">
              {/* Add Material Inline Form */}
              <form onSubmit={onAddMaterial} className="bg-card/45 dark:bg-card/15 border border-border/60 shadow-sm rounded-2xl p-4.5 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block select-none">
                  Add New Material
                </span>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    placeholder="Material title..."
                    className="rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                  />
                  <input
                    type="url"
                    value={matLink}
                    onChange={(e) => setMatLink(e.target.value)}
                    placeholder="Reference URL link (optional)..."
                    className="rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={matNotes}
                    onChange={(e) => setMatNotes(e.target.value)}
                    placeholder="Brief notes about the material..."
                    className="flex-1 rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              </form>

              {/* Materials List */}
              {subject.materials.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border/40 rounded-xl">
                  No learning materials added yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {subject.materials.map((mat: LearningMaterial) => {
                    return (
                      <div
                        key={mat.id}
                        className="group flex items-start justify-between gap-3 p-3 bg-card/30 dark:bg-card/5 hover:bg-card/50 hover:border-primary/10 border border-border/40 rounded-xl transition-all shadow-sm"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          {/* 3-State Status Button */}
                          <button
                            type="button"
                            onClick={() => onToggleMaterial(mat.id, mat.status)}
                            className="mt-0.5 cursor-pointer"
                            title={`Status: ${mat.status}. Click to change.`}
                          >
                            {mat.status === "Completed" ? (
                              <CheckCircle className="h-4.5 w-4.5 text-emerald-500 stroke-[2.5]" />
                            ) : mat.status === "In Progress" ? (
                              <Clock className="h-4.5 w-4.5 text-amber-500 stroke-[2.5]" />
                            ) : (
                              <HelpCircle className="h-4.5 w-4.5 text-muted-foreground/60 hover:text-foreground" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold leading-normal ${
                                mat.status === "Completed" ? "text-muted-foreground line-through" : "text-foreground"
                              }`}>
                                {mat.title}
                              </span>
                              {mat.linkUrl && (
                                <a
                                  href={mat.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-0.5 text-[10px] font-bold"
                                >
                                  Link <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              )}
                            </div>
                            {mat.notes && (
                              <p className="text-[10px] text-muted-foreground/90 font-medium leading-relaxed max-w-[450px]">
                                {mat.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteMaterial(mat.id)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 cursor-pointer"
                          aria-label="Delete material"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add Task Inline Form */}
              <form onSubmit={onAddTask} className="bg-card/45 dark:bg-card/15 border border-border/60 shadow-sm rounded-2xl p-4.5 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block select-none">
                  Add New Task
                </span>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Task/todo title..."
                    className="flex-1 min-w-[200px] rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                  />
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm text-muted-foreground"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              </form>

              {/* Tasks List */}
              {subject.tasks.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border/40 rounded-xl">
                  No learning tasks added yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {subject.tasks.map((task: LearningTask) => {
                    const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date()
                    return (
                      <div
                        key={task.id}
                        className="group flex items-start justify-between gap-3 p-3 bg-card/30 dark:bg-card/5 hover:bg-card/50 hover:border-primary/10 border border-border/40 rounded-xl transition-all shadow-sm"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onToggleTask(task.id, task.completed)}
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 mt-0.5 cursor-pointer ${
                              task.completed
                                ? "bg-primary border-primary text-primary-foreground shadow-glow"
                                : "border-border/60 hover:border-primary/50 hover:bg-primary/10 bg-card"
                            }`}
                            aria-label="Toggle task completion"
                          >
                            {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </button>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <span className={`text-xs font-bold leading-normal block ${
                              task.completed ? "text-muted-foreground line-through" : "text-foreground"
                            }`}>
                              {task.title}
                            </span>
                            {task.dueDate && (
                              <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold tracking-wide uppercase ${
                                isOverdue ? "text-rose-500" : "text-muted-foreground"
                              }`}>
                                <Calendar className="h-3 w-3" />
                                Due: {new Date(task.dueDate).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                                {isOverdue && " (Overdue)"}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 cursor-pointer"
                          aria-label="Delete task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
