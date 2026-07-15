import React from "react"
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  CheckSquare,
  Trophy,
  Loader2,
  Trash2,
  Edit2,
  AlertCircle,
} from "lucide-react"
import { useLearningPage } from "@/hooks/useLearningPage"
import { SubjectFormModal } from "./SubjectFormModal"
import { SubjectDetailModal } from "./SubjectDetailModal"

export function LearningWorkspace() {
  const {
    filteredSubjects,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    activeSubject,
    setActiveSubjectId,
    showAddSubjectModal,
    setShowAddSubjectModal,
    editingSubject,

    // Form inputs Subject
    subjectName,
    setSubjectName,
    subjectDesc,
    setSubjectDesc,
    subjectStatus,
    setSubjectStatus,
    subjectColor,
    setSubjectColor,

    // Form inputs Material
    matTitle,
    setMatTitle,
    matNotes,
    setMatNotes,
    matLink,
    setMatLink,

    // Form inputs Task
    taskTitle,
    setTaskTitle,
    taskDueDate,
    setTaskDueDate,

    // Subject Handlers
    handleOpenAddSubject,
    handleOpenEditSubject,
    handleSaveSubject,
    handleDeleteSubject,
    isSaveSubjectPending,

    // Material Handlers
    handleAddMaterial,
    handleToggleMaterialStatus,
    handleDeleteMaterial,

    // Task Handlers
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
  } = useLearningPage()

  // Calculate high-level stats
  const stats = React.useMemo(() => {
    const total = filteredSubjects.length
    const active = filteredSubjects.filter((s) => s.status === "Learning").length
    const planned = filteredSubjects.filter((s) => s.status === "Planned").length
    const completed = filteredSubjects.filter((s) => s.status === "Completed").length

    return { total, active, planned, completed }
  }, [filteredSubjects])

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" /> Learning Hub
          </h1>
          <p className="text-xs font-semibold text-muted-foreground">
            Kelola materi pembelajaran, topik, referensi, dan tugas harian secara visual.
          </p>
        </div>
        <button
          onClick={handleOpenAddSubject}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-primary-foreground shadow-sm hover:bg-primary/95 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Tambah Subjek
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4 select-none">
        <div className="rounded-2xl border border-border/60 bg-card/45 dark:bg-card/15 p-4.5 shadow-sm backdrop-blur-md flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest block">Total Subjek</span>
            <span className="text-2xl font-black text-foreground">{stats.total}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/45 dark:bg-card/15 p-4.5 shadow-sm backdrop-blur-md flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-500">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest block">Mempelajari</span>
            <span className="text-2xl font-black text-foreground">{stats.active}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/45 dark:bg-card/15 p-4.5 shadow-sm backdrop-blur-md flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest block">Direncanakan</span>
            <span className="text-2xl font-black text-foreground">{stats.planned}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/45 dark:bg-card/15 p-4.5 shadow-sm backdrop-blur-md flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest block">Selesai</span>
            <span className="text-2xl font-black text-foreground">{stats.completed}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari subjek pembelajaran..."
            className="w-full rounded-xl border border-border/60 bg-card/45 dark:bg-card/15 pl-9 pr-4 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 backdrop-blur-md"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground select-none">Status:</span>
          <div className="flex rounded-xl bg-card/45 dark:bg-card/15 border border-border p-1 backdrop-blur-md">
            {["All", "Planned", "Learning", "Completed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                {status === "All" ? "Semua" : status === "Planned" ? "Rencana" : status === "Learning" ? "Belajar" : "Selesai"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 select-none">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">Memuat subjek pembelajaran...</p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 py-12 text-center text-sm text-destructive flex flex-col items-center gap-2 select-none">
          <AlertCircle className="h-8 w-8" />
          <p className="font-semibold">Gagal memuat subjek pembelajaran. Silakan coba lagi nanti.</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/40 py-20 text-center text-sm text-muted-foreground bg-card/10 select-none flex flex-col items-center gap-2">
          <GraduationCap className="h-10 w-10 text-muted-foreground/50" />
          <p className="font-semibold">Belum ada subjek pembelajaran yang sesuai.</p>
          <button
            onClick={handleOpenAddSubject}
            className="mt-2 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary hover:underline cursor-pointer"
          >
            Buat Subjek Pertama <Plus className="h-3 w-3 stroke-[3]" />
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subj) => {
            const totalItems = subj.materials.length + subj.tasks.length
            const completedItems =
              subj.materials.filter((m) => m.status === "Completed").length +
              subj.tasks.filter((t) => t.completed).length
            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

            return (
              <div
                key={subj.id}
                onClick={() => setActiveSubjectId(subj.id)}
                className="group relative rounded-2xl border border-border bg-card/45 dark:bg-card/15 p-5 shadow-sm backdrop-blur-md hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Accent Side Ribbon */}
                <div
                  className="absolute left-0 top-4 bottom-4 w-1 rounded-r-md transition-all group-hover:top-3 group-hover:bottom-3"
                  style={{ backgroundColor: subj.color }}
                />

                <div className="pl-2 space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-base font-black tracking-tight text-foreground leading-snug">
                        {subj.name}
                      </h3>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider ${
                        subj.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : subj.status === "Learning"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-secondary text-muted-foreground border border-border/60"
                      }`}>
                        {subj.status === "Planned" ? "Rencana" : subj.status === "Learning" ? "Belajar" : "Selesai"}
                      </span>
                    </div>

                    {/* Edit/Delete Actions */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => handleOpenEditSubject(subj, e)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer"
                        title="Edit Subjek"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSubject(subj.id, subj.name, e)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Hapus Subjek"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {subj.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {subj.description}
                    </p>
                  )}

                  {/* Progress info */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-secondary/80 overflow-hidden border border-border/30">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: subj.color || "hsl(var(--primary))",
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground/80">
                      <span>Materi: {subj.materials.length}</span>
                      <span>Tugas: {subj.tasks.filter(t => t.completed).length}/{subj.tasks.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Subject Create/Edit Form Modal */}
      <SubjectFormModal
        isOpen={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
        onSubmit={handleSaveSubject}
        editingSubject={editingSubject}
        name={subjectName}
        setName={setSubjectName}
        description={subjectDesc}
        setDescription={setSubjectDesc}
        status={subjectStatus}
        setStatus={setSubjectStatus}
        color={subjectColor}
        setColor={setSubjectColor}
        isPending={isSaveSubjectPending}
      />

      {/* Subject Detail Overlay Modal */}
      <SubjectDetailModal
        isOpen={!!activeSubject}
        onClose={() => setActiveSubjectId(null)}
        subject={activeSubject}
        matTitle={matTitle}
        setMatTitle={setMatTitle}
        matNotes={matNotes}
        setMatNotes={setMatNotes}
        matLink={matLink}
        setMatLink={setMatLink}
        taskTitle={taskTitle}
        setTaskTitle={setTaskTitle}
        taskDueDate={taskDueDate}
        setTaskDueDate={setTaskDueDate}
        onAddMaterial={handleAddMaterial}
        onToggleMaterial={handleToggleMaterialStatus}
        onDeleteMaterial={handleDeleteMaterial}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  )
}
