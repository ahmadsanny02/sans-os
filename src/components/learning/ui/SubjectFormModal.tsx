import React from "react"
import { X, Loader2 } from "lucide-react"
import { LearningSubject } from "@/hooks/useLearning"

interface SubjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  editingSubject: LearningSubject | null
  name: string
  setName: (s: string) => void
  description: string
  setDescription: (s: string) => void
  status: "Planned" | "Learning" | "Completed"
  setStatus: (s: "Planned" | "Learning" | "Completed") => void
  color: string
  setColor: (s: string) => void
  isPending: boolean
}

const COLOR_OPTIONS = [
  { label: "Violet", value: "hsl(262, 83%, 58%)" },
  { label: "Blue", value: "hsl(217, 91%, 60%)" },
  { label: "Emerald", value: "hsl(142, 72%, 45%)" },
  { label: "Amber", value: "hsl(38, 92%, 50%)" },
  { label: "Rose", value: "hsl(340, 82%, 55%)" },
  { label: "Indigo", value: "hsl(239, 84%, 60%)" },
]

export function SubjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingSubject,
  name,
  setName,
  description,
  setDescription,
  status,
  setStatus,
  color,
  setColor,
  isPending,
}: SubjectFormModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 overflow-hidden flex flex-col justify-between animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3.5 mb-4">
          <h3 className="text-lg font-black tracking-tight text-foreground">
            {editingSubject ? "Edit Subjek Pembelajaran" : "Tambah Subjek Baru"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4 flex-1">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="subjName" className="text-xs font-bold text-muted-foreground">
              Nama Subjek *
            </label>
            <input
              id="subjName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Pemrograman Web, Deep Learning..."
              className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="subjDesc" className="text-xs font-bold text-muted-foreground">
              Deskripsi
            </label>
            <textarea
              id="subjDesc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tujuan belajar, kurikulum singkat, atau catatan..."
              className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Status Pelacakan</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Planned", "Learning", "Completed"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    status === s
                      ? "bg-primary border-primary text-primary-foreground shadow-sm"
                      : "border-border hover:border-primary/45 bg-secondary/20 hover:bg-secondary/40 text-foreground/80"
                  }`}
                >
                  {s === "Planned" ? "Direncanakan" : s === "Learning" ? "Mempelajari" : "Selesai"}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Warna Kartu</label>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                    color === opt.value
                      ? "border-foreground scale-110 shadow-sm"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: opt.value }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border/40 mt-4.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-secondary/40 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingSubject ? "Simpan Perubahan" : "Tambah Subjek"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
