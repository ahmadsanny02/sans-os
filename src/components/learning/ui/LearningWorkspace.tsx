"use client"

import React from "react"
import { useRouter } from "next/navigation"
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  CheckSquare,
  Trophy,
  Trash2,
  Edit2,
} from "lucide-react"
import { useLearningPage } from "@/hooks/useLearningPage"
import { SubjectFormModal } from "./SubjectFormModal"
import { StatCard } from "@/components/ui/StatCard"
import { GridCardSkeleton } from "@/components/ui/Skeletons"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorState } from "@/components/ui/ErrorState"
import { Badge } from "@/components/ui/Badge"

export function LearningWorkspace() {
  const router = useRouter()
  const {
    filteredSubjects,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
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

    // Subject Handlers
    handleOpenAddSubject,
    handleOpenEditSubject,
    handleSaveSubject,
    handleDeleteSubject,
    isSaveSubjectPending,
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 select-none">
        <StatCard
          title="Total Subjects"
          value={stats.total}
          icon={<BookOpen className="h-6 w-6" />}
          iconBgClass="bg-primary/10"
          iconTextClass="text-primary"
          isLoading={isLoading}
          description="Subjects registered"
        />

        <StatCard
          title="Learning"
          value={stats.active}
          icon={<GraduationCap className="h-6 w-6" />}
          iconBgClass="bg-amber-500/10"
          iconTextClass="text-amber-500"
          isLoading={isLoading}
          description="Subjects in progress"
        />

        <StatCard
          title="Planned"
          value={stats.planned}
          icon={<CheckSquare className="h-6 w-6" />}
          iconBgClass="bg-primary/10"
          iconTextClass="text-primary"
          isLoading={isLoading}
          description="Subjects planned"
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<Trophy className="h-6 w-6" />}
          iconBgClass="bg-emerald-500/10"
          iconTextClass="text-emerald-500"
          isLoading={isLoading}
          description="Finished learning"
        />
      </div>

      {/* 2. Controls Section (Search, Add button) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-5">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search learning subjects..."
            className="w-full rounded-xl border border-border/60 bg-card/40 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
          />
        </div>

        <button
          onClick={handleOpenAddSubject}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95 self-start md:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </button>
      </div>

      {/* 3. Filter Section */}
      <div className="flex flex-wrap gap-2">
        {["All", "Planned", "Learning", "Completed"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statusFilter === status
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/40 text-muted-foreground hover:text-foreground/80 hover:bg-secondary/70 border border-border/40"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* 4. Main Grid View */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <GridCardSkeleton />
          <GridCardSkeleton />
          <GridCardSkeleton />
        </div>
      ) : isError ? (
        <ErrorState message="Failed to load learning subjects. Please try again later." />
      ) : filteredSubjects.length === 0 ? (
        <EmptyState
          title="No matching learning subjects found."
          description="Click 'Add Subject' to register a new learning subject."
          icon={<GraduationCap className="h-10 w-10 text-muted-foreground/50" />}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subj) => {
            const totalItems = subj.materials.length + subj.tasks.length
            const completedItems =
              subj.materials.filter((m) => m.status === "Completed").length +
              subj.tasks.filter((t) => t.completed).length
            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

            return (
              <div
                key={subj.id}
                onClick={() => router.push(`/learning/${subj.id}`)}
                className="group relative rounded-2xl border border-border bg-card/45 dark:bg-card/15 p-5 shadow-sm backdrop-blur-md hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between cursor-pointer animate-in zoom-in-95 duration-200"
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
                      <Badge
                        variant={
                          subj.status === "Completed"
                            ? "success"
                            : subj.status === "Learning"
                            ? "warning"
                            : "primary"
                        }
                      >
                        {subj.status}
                      </Badge>
                    </div>

                    {/* Edit/Delete Actions */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => handleOpenEditSubject(subj, e)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer transition-all"
                        title="Edit Subject"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSubject(subj.id, subj.name, e)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-all"
                        title="Delete Subject"
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
                      <span>Materials: {subj.materials.length}</span>
                      <span>Tasks: {subj.tasks.filter(t => t.completed).length}/{subj.tasks.length}</span>
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
    </div>
  )
}
