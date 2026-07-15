"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
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
  Edit2,
} from "lucide-react"
import { useLearningSubjectPage } from "@/hooks/useLearningSubjectPage"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { HeaderPage } from "@/components/ui/HeaderPage"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorState } from "@/components/ui/ErrorState"
import { GridCardSkeleton } from "@/components/ui/Skeletons"

interface SubjectDetailViewProps {
  subjectId: string
}

export function SubjectDetailView({ subjectId }: SubjectDetailViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"materials" | "tasks">("materials")

  const {
    subject,
    isLoading,
    isError,
    // Subject Actions
    showEditModal,
    setShowEditModal,
    handleOpenEdit,
    handleSaveSubject,
    handleDeleteSubject,
    // Subject Form States
    subjectName,
    setSubjectName,
    subjectDesc,
    setSubjectDesc,
    subjectStatus,
    setSubjectStatus,
    subjectColor,
    setSubjectColor,
    // Material states & handlers
    matTitle,
    setMatTitle,
    matNotes,
    setMatNotes,
    matLink,
    setMatLink,
    handleAddMaterial,
    handleToggleMaterialStatus,
    handleDeleteMaterial,
    // Task states & handlers
    taskTitle,
    setTaskTitle,
    taskDueDate,
    setTaskDueDate,
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
  } = useLearningSubjectPage(subjectId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-secondary/40 rounded animate-pulse" />
        <div className="h-32 w-full bg-secondary/20 rounded-2xl animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          <GridCardSkeleton />
          <GridCardSkeleton />
        </div>
      </div>
    )
  }

  if (isError || !subject) {
    return (
      <div className="space-y-4">
        <Link
          href="/learning"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Learning Hub
        </Link>
        <ErrorState
          message="Subject Not Found: The learning subject you are looking for does not exist or has been deleted."
        />
      </div>
    )
  }

  // Calculate stats
  const totalMats = subject.materials.length
  const completedMats = subject.materials.filter((m) => m.status === "Completed").length
  const inProgressMats = subject.materials.filter((m) => m.status === "In Progress").length
  const progressPercentMats = totalMats > 0 ? Math.round((completedMats / totalMats) * 100) : 0

  const totalTasks = subject.tasks.length
  const completedTasks = subject.tasks.filter((t) => t.completed).length
  const progressPercentTasks = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const onDelete = async () => {
    const deleted = await handleDeleteSubject()
    if (deleted) {
      router.push("/learning")
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/learning"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Learning Hub
        </Link>
      </div>

      {/* Header Banner */}
      <HeaderPage
        title={subject.name}
        description={
          <div className="space-y-1.5 mt-1">
            {subject.description && (
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                {subject.description}
              </p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <span
                className="w-3 h-3 rounded-full inline-block shadow-sm"
                style={{ backgroundColor: subject.color }}
              />
              <Badge
                variant={
                  subject.status === "Completed"
                    ? "success"
                    : subject.status === "Learning"
                    ? "primary"
                    : "default"
                }
              >
                {subject.status}
              </Badge>
            </div>
          </div>
        }
        icon={<BookOpen className="h-6 w-6 text-primary" />}
        extraActions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-secondary/30 px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all shadow-sm cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 transition-all shadow-sm cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        }
      />

      {/* Split Progress Columns */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Materials Progress Card */}
        <div className="bg-card/45 dark:bg-card/15 border border-border shadow-sm rounded-2xl p-5 space-y-3.5 backdrop-blur-md select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Materials Progress
              </span>
            </div>
            <span className="text-xs font-bold text-foreground">
              {progressPercentMats}% ({completedMats}/{totalMats} Read)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-secondary/80 overflow-hidden border border-border/30">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercentMats}%`,
                backgroundColor: subject.color || "hsl(var(--primary))",
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground/80">
            <span>In Progress: {inProgressMats}</span>
            <span>Planned: {totalMats - completedMats - inProgressMats}</span>
          </div>
        </div>

        {/* Tasks Progress Card */}
        <div className="bg-card/45 dark:bg-card/15 border border-border shadow-sm rounded-2xl p-5 space-y-3.5 backdrop-blur-md select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Tasks Progress
              </span>
            </div>
            <span className="text-xs font-bold text-foreground">
              {progressPercentTasks}% ({completedTasks}/{totalTasks} Done)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-secondary/80 overflow-hidden border border-border/30">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercentTasks}%`,
                backgroundColor: subject.color || "hsl(var(--primary))",
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground/80">
            <span>Pending: {totalTasks - completedTasks}</span>
            <span>Completed: {completedTasks}</span>
          </div>
        </div>
      </div>

      {/* Main Tab Workspace */}
      <div className="space-y-4">
        {/* Tabs switcher */}
        <div className="flex border-b border-border/40">
          <button
            type="button"
            onClick={() => setActiveTab("materials")}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 -mb-[2px] ${
              activeTab === "materials"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground/80"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Materials ({totalMats})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tasks")}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 -mb-[2px] ${
              activeTab === "tasks"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground/80"
            }`}
          >
            <ListTodo className="h-4 w-4" />
            Tasks ({totalTasks})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-4 min-h-[300px]">
          {activeTab === "materials" ? (
            <div className="space-y-4">
              {/* Add Material Form */}
              <form
                onSubmit={handleAddMaterial}
                className="bg-card/45 dark:bg-card/15 border border-border/60 shadow-sm rounded-2xl p-5 space-y-4"
              >
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
                <EmptyState
                  title="No learning materials"
                  description="Add articles, documentation, or links to reference files to organize your study plan."
                />
              ) : (
                <div className="grid gap-2">
                  {subject.materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="group flex items-start justify-between gap-3 p-4 bg-card/30 dark:bg-card/5 hover:bg-card/50 hover:border-primary/10 border border-border/40 rounded-xl transition-all shadow-sm"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleMaterialStatus(mat.id, mat.status)}
                          className="mt-0.5 cursor-pointer"
                          title={`Status: ${mat.status}. Click to change.`}
                        >
                          {mat.status === "Completed" ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500 stroke-[2.5]" />
                          ) : mat.status === "In Progress" ? (
                            <Clock className="h-5 w-5 text-amber-500 stroke-[2.5]" />
                          ) : (
                            <HelpCircle className="h-5 w-5 text-muted-foreground/60 hover:text-foreground" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-sm font-bold leading-normal ${
                                mat.status === "Completed"
                                  ? "text-muted-foreground line-through font-semibold"
                                  : "text-foreground"
                              }`}
                            >
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
                            <p className="text-xs text-muted-foreground/90 font-medium leading-relaxed max-w-3xl">
                              {mat.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMaterial(mat.id)}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 cursor-pointer"
                        aria-label="Delete material"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add Task Form */}
              <form
                onSubmit={handleAddTask}
                className="bg-card/45 dark:bg-card/15 border border-border/60 shadow-sm rounded-2xl p-5 space-y-4"
              >
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
                <EmptyState
                  title="No learning tasks"
                  description="Add tasks, objectives, or items to stay aligned with your goals."
                />
              ) : (
                <div className="grid gap-2">
                  {subject.tasks.map((task) => {
                    const isOverdue =
                      task.dueDate &&
                      !task.completed &&
                      new Date(task.dueDate) < new Date()
                    return (
                      <div
                        key={task.id}
                        className="group flex items-start justify-between gap-3 p-4 bg-card/30 dark:bg-card/5 hover:bg-card/50 hover:border-primary/10 border border-border/40 rounded-xl transition-all shadow-sm"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id, task.completed)}
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
                            <span
                              className={`text-sm font-bold leading-normal block ${
                                task.completed
                                  ? "text-muted-foreground line-through font-semibold"
                                  : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.dueDate && (
                              <span
                                className={`inline-flex items-center gap-1 text-[9px] font-extrabold tracking-wide uppercase ${
                                  isOverdue ? "text-rose-500" : "text-muted-foreground"
                                }`}
                              >
                                <Calendar className="h-3 w-3" />
                                Due:{" "}
                                {new Date(task.dueDate).toLocaleDateString("en-US", {
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
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 cursor-pointer"
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
          )}
        </div>
      </div>

      {/* Edit Subject Modal */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Subject"
        >
          <form onSubmit={handleSaveSubject} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">Subject Name</label>
              <input
                type="text"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                className="rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">Description</label>
              <textarea
                value={subjectDesc}
                onChange={(e) => setSubjectDesc(e.target.value)}
                placeholder="Optional notes..."
                rows={3}
                className="rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">Status</label>
                <select
                  value={subjectStatus}
                  onChange={(e) =>
                    setSubjectStatus(e.target.value as "Planned" | "Learning" | "Completed")
                  }
                  className="rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm text-foreground"
                >
                  <option value="Planned">Planned</option>
                  <option value="Learning">Learning</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">Card Accent Color</label>
                <div className="flex items-center gap-2 h-[42px]">
                  <input
                    type="color"
                    value={subjectColor}
                    onChange={(e) => setSubjectColor(e.target.value)}
                    className="w-10 h-8 rounded border border-border/65 bg-transparent p-0 overflow-hidden cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-muted-foreground select-none uppercase">
                    {subjectColor}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-xs font-bold text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
