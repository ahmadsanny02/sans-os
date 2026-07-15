import React, { useState } from "react"
import {
  X,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  BookOpen,
  ListTodo,
  CheckCircle,
  Clock,
  HelpCircle,
} from "lucide-react"
import { LearningSubject, LearningMaterial, LearningTask } from "@/hooks/useLearning"

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

  if (!isOpen || !subject) return null

  // Calculate stats
  const totalMats = subject.materials.length
  const completedMats = subject.materials.filter((m: LearningMaterial) => m.status === "Completed").length
  const inProgressMats = subject.materials.filter((m: LearningMaterial) => m.status === "In Progress").length

  const totalTasks = subject.tasks.length
  const completedTasks = subject.tasks.filter((t: LearningTask) => t.completed).length

  const totalItems = totalMats + totalTasks
  const completedItems = completedMats + completedTasks
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/40 pb-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-sm"
                style={{ backgroundColor: subject.color }}
              />
              <h3 className="text-xl font-black tracking-tight text-foreground leading-none">
                {subject.name}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                subject.status === "Completed"
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : subject.status === "Learning"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-secondary text-muted-foreground border border-border/60"
              }`}>
                {subject.status === "Planned" ? "Direncanakan" : subject.status === "Learning" ? "Belajar" : "Selesai"}
              </span>
            </div>
            {subject.description && (
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[500px]">
                {subject.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Overall Progress */}
        <div className="bg-secondary/15 rounded-2xl p-4 border border-border/60 mb-5 space-y-2 select-none">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground">Progress Keseluruhan</span>
            <span className="text-foreground">{progressPercent}% ({completedItems}/{totalItems} Selesai)</span>
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
            <div>Materi: {completedMats}/{totalMats}</div>
            <div>Tugas: {completedTasks}/{totalTasks}</div>
            <div>Sedang Dipelajari: {inProgressMats}</div>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-border/40 mb-4.5">
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
            Materi ({totalMats})
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
            Tugas Todo ({totalTasks})
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[360px] pr-1.5 space-y-4">
          {activeTab === "materials" ? (
            <div className="space-y-4">
              {/* Add Material Inline Form */}
              <form onSubmit={onAddMaterial} className="bg-secondary/15 dark:bg-zinc-950/20 border border-border/40 rounded-xl p-3.5 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block select-none">
                  Tambah Materi Baru
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    placeholder="Judul bab/materi..."
                    className="rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    type="url"
                    value={matLink}
                    onChange={(e) => setMatLink(e.target.value)}
                    placeholder="Tautan URL referensi (opsional)..."
                    className="rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={matNotes}
                    onChange={(e) => setMatNotes(e.target.value)}
                    placeholder="Catatan ringkas materi..."
                    className="flex-1 rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah
                  </button>
                </div>
              </form>

              {/* Materials List */}
              {subject.materials.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border/40 rounded-xl">
                  Belum ada materi pembelajaran yang ditambahkan.
                </div>
              ) : (
                <div className="space-y-2">
                  {subject.materials.map((mat: LearningMaterial) => {
                    return (
                      <div
                        key={mat.id}
                        className="group flex items-start justify-between gap-3 p-3 bg-secondary/10 dark:bg-card/5 hover:bg-secondary/25 border border-border/40 rounded-xl transition-all"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          {/* 3-State Status Button */}
                          <button
                            type="button"
                            onClick={() => onToggleMaterial(mat.id, mat.status)}
                            className="mt-0.5 cursor-pointer"
                            title={`Status: ${mat.status}. Klik untuk mengubah.`}
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
              <form onSubmit={onAddTask} className="bg-secondary/15 dark:bg-zinc-950/20 border border-border/40 rounded-xl p-3.5 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block select-none">
                  Tambah Tugas Baru
                </span>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Judul tugas/todo..."
                    className="flex-1 min-w-[200px] rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary text-muted-foreground"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah
                  </button>
                </div>
              </form>

              {/* Tasks List */}
              {subject.tasks.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border/40 rounded-xl">
                  Belum ada tugas pembelajaran yang ditambahkan.
                </div>
              ) : (
                <div className="space-y-2">
                  {subject.tasks.map((task: LearningTask) => {
                    const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date()
                    return (
                      <div
                        key={task.id}
                        className="group flex items-start justify-between gap-3 p-3 bg-secondary/10 dark:bg-card/5 hover:bg-secondary/25 border border-border/40 rounded-xl transition-all"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onToggleTask(task.id, task.completed)}
                            className="mt-0.5 cursor-pointer text-muted-foreground hover:text-foreground"
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => {}}
                              className="h-4 w-4 rounded border-border/60 accent-primary cursor-pointer"
                            />
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
                                Tenggat: {new Date(task.dueDate).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                                {isOverdue && " (Terlambat)"}
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
    </div>
  )
}
