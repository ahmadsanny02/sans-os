import React from "react"
import { Loader2 } from "lucide-react"
import { LearningSubject } from "@/hooks/useLearning"
import { Modal } from "@/components/ui/Modal"
import { useCategories } from "@/hooks/useCategories"
import { CustomSelect } from "@/components/ui/CustomSelect"

interface SubjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  editingSubject: LearningSubject | null
  name: string
  setName: (s: string) => void
  description: string
  setDescription: (s: string) => void
  category: string
  setCategory: (s: string) => void
  status: "Planned" | "Learning" | "Completed"
  setStatus: (s: "Planned" | "Learning" | "Completed") => void
  isPending: boolean
}

export function SubjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingSubject,
  name,
  setName,
  description,
  setDescription,
  category,
  setCategory,
  status,
  setStatus,
  isPending,
}: SubjectFormModalProps) {
  const { categories } = useCategories()
  const learningCategories = categories.filter((c) => c.module === "learning" || c.module === "general")
  const defaultFallbackCategories = ["General"]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSubject ? "Edit Learning Subject" : "Add New Subject"}
      maxWidth="max-w-md"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="subjName" className="text-xs font-bold text-muted-foreground">
            Subject Name *
          </label>
          <input
            id="subjName"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g., Web Development, Deep Learning..."
            className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label htmlFor="subjCategory" className="text-xs font-bold text-muted-foreground">
            Category
          </label>
          <CustomSelect
            id="subjCategory"
            value={category}
            onChange={(val) => setCategory(val)}
            options={
              learningCategories.length > 0
                ? learningCategories.map((c) => ({ value: c.name, label: c.name }))
                : defaultFallbackCategories.map((catName) => ({ value: catName, label: catName }))
            }
            fullWidth
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="subjDesc" className="text-xs font-bold text-muted-foreground">
            Description
          </label>
          <textarea
            id="subjDesc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Learning objectives, curriculum summary, or notes..."
            className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground">Tracking Status</label>
          <div className="grid grid-cols-3 gap-2">
            {(["Planned", "Learning", "Completed"] as const).map((s) => {
              const isActive = status === s
              let activeClass = ""
              if (isActive) {
                if (s === "Planned") {
                  activeClass = "bg-primary border-primary text-primary-foreground shadow-sm"
                } else if (s === "Learning") {
                  activeClass = "bg-amber-500 border-amber-500 text-white shadow-sm dark:bg-amber-600 dark:border-amber-600"
                } else if (s === "Completed") {
                  activeClass = "bg-emerald-500 border-emerald-500 text-white shadow-sm dark:bg-emerald-600 dark:border-emerald-600"
                }
              } else {
                activeClass = "border-border hover:border-primary/45 bg-secondary/20 hover:bg-secondary/40 text-foreground/80"
              }
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${activeClass}`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-border/40 mt-4.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-secondary/40 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {editingSubject ? "Save Changes" : "Add Subject"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
