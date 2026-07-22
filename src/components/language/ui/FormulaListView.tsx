"use client"

import React, { useState, useMemo } from "react"
import { Formula, WritingLog, DialogueLog } from "@/hooks/useLanguage"
import {
  Plus,
  Trash2,
  Loader2,
  Search,
  AlertCircle,
  Sparkles,
  Edit2,
  Check,
  X,
  Braces,
  PencilLine,
  MessageSquare,
  Activity
} from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"

interface FormulaListViewProps {
  formulaList: Formula[]
  writingList: WritingLog[]
  dialogueList: DialogueLog[]
  isLoading: boolean
  isError: boolean
  showFormulaForm: boolean
  setShowFormulaForm: (show: boolean) => void
  formulaName: string
  setFormulaName: (name: string) => void
  formulaString: string
  setFormulaString: (formula: string) => void
  formulaDescription: string
  setFormulaDescription: (desc: string) => void
  searchQueryFormula: string
  setSearchQueryFormula: (query: string) => void
  formulaFormError: string | null
  handleAddFormula: (e: React.FormEvent) => Promise<void>
  handleUpdateFormula: (id: string, name: string, formulaVal: string, description: string | null) => Promise<void>
  handleDeleteFormula: (id: string) => Promise<void>
  filteredFormulas: Formula[]
  formulaCreatePending: boolean
}

export function FormulaListView({
  formulaList = [],
  writingList = [],
  dialogueList = [],
  isLoading,
  isError,
  showFormulaForm,
  setShowFormulaForm,
  formulaName,
  setFormulaName,
  formulaString,
  setFormulaString,
  formulaDescription,
  setFormulaDescription,
  searchQueryFormula,
  setSearchQueryFormula,
  formulaFormError,
  handleAddFormula,
  handleUpdateFormula,
  handleDeleteFormula,
  filteredFormulas,
  formulaCreatePending,
}: FormulaListViewProps) {
  // Inline edit states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editFormulaVal, setEditFormulaVal] = useState("")
  const [editDesc, setEditDesc] = useState("")

  const startEdit = (f: Formula) => {
    setEditingId(f.id)
    setEditName(f.name)
    setEditFormulaVal(f.formula)
    setEditDesc(f.description || "")
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (id: string) => {
    if (!editName.trim() || !editFormulaVal.trim()) {
      return
    }
    await handleUpdateFormula(id, editName.trim(), editFormulaVal.trim(), editDesc.trim() || null)
    setEditingId(null)
  }

  // Calculate statistics
  const { totalFormulas, practicedCount, practiceCoverage } = useMemo(() => {
    const total = formulaList.length
    
    // Count unique formulas practiced in either writing or dialogue
    const practicedIds = new Set<string>()
    writingList.forEach((w) => {
      if (w.formulaId) practicedIds.add(w.formulaId)
    })
    dialogueList.forEach((d) => {
      if (d.formulaId) practicedIds.add(d.formulaId)
    })

    const practiced = practicedIds.size
    const coverage = total > 0 ? Math.round((practiced / total) * 100) : 0

    return {
      totalFormulas: total,
      practicedCount: practiced,
      practiceCoverage: coverage,
    }
  }, [formulaList, writingList, dialogueList])

  // Count practices per formula id
  const formulaPracticeStats = useMemo(() => {
    const stats: Record<string, { writing: number; dialogue: number; total: number }> = {}
    
    formulaList.forEach((f) => {
      stats[f.id] = { writing: 0, dialogue: 0, total: 0 }
    })

    writingList.forEach((w) => {
      if (w.formulaId && stats[w.formulaId]) {
        stats[w.formulaId].writing++
        stats[w.formulaId].total++
      }
    })

    dialogueList.forEach((d) => {
      if (d.formulaId && stats[d.formulaId]) {
        stats[d.formulaId].dialogue++
        stats[d.formulaId].total++
      }
    })

    return stats
  }, [formulaList, writingList, dialogueList])

  // Optional multi-item batch creation state
  const [extraFormulaRows, setExtraFormulaRows] = useState<Array<{ id: string; name: string; formula: string; description: string }>>([])

  const handleFormulaBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formulaName.trim() || !formulaString.trim()) return

    await handleAddFormula(e)

    if (extraFormulaRows.length > 0) {
      for (const row of extraFormulaRows) {
        if (row.name.trim() && row.formula.trim()) {
          setFormulaName(row.name.trim())
          setFormulaString(row.formula.trim())
          setFormulaDescription(row.description.trim())
          const fakeEvent = { preventDefault: () => {} } as React.FormEvent
          await handleAddFormula(fakeEvent)
        }
      }
      setExtraFormulaRows([])
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-3 animate-in fade-in duration-200">
        <StatCard
          title="Total Formulas"
          value={totalFormulas}
          icon={<Braces className="h-6 w-6" />}
          iconBgClass="bg-violet-500/10"
          iconTextClass="text-violet-500"
          isLoading={isLoading}
          description="Registered patterns"
        />

        <StatCard
          title="Practiced Patterns"
          value={
            <>
              {practicedCount}
              <span className="text-sm font-bold text-muted-foreground">/ {totalFormulas}</span>
            </>
          }
          icon={<Activity className="h-6 w-6" />}
          iconBgClass="bg-emerald-500/10"
          iconTextClass="text-emerald-500"
          isLoading={isLoading}
          description={`${practiceCoverage}% coverage rate`}
        />

        <StatCard
          title="Total Practice Logs"
          value={writingList.filter(w => w.formulaId).length + dialogueList.filter(d => d.formulaId).length}
          icon={<PencilLine className="h-6 w-6" />}
          iconBgClass="bg-amber-500/10"
          iconTextClass="text-amber-500"
          isLoading={isLoading}
          description="Formula practices saved"
        />
      </div>

      {/* 2. Controls & Actions Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-5">
        {/* Search bar */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search formula names, patterns, or descriptions..."
            value={searchQueryFormula}
            onChange={(e) => setSearchQueryFormula(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card/45 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <button
          onClick={() => setShowFormulaForm(!showFormulaForm)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 self-start md:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {showFormulaForm ? "Cancel Add" : "Add Formula"}
        </button>
      </div>

      {/* 3. Add Formula Form */}
      {showFormulaForm && (
        <div className="bento-card p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
            <Sparkles className="h-4.5 w-4.5 text-primary" /> Register a New Grammar Formula
          </h4>

          <form onSubmit={handleFormulaBatchSubmit} className="space-y-4 pt-1">
            <div className="space-y-4">
              {/* Primary Input Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="formulaNameInput" className="text-xs font-bold text-muted-foreground">
                    Formula Name *
                  </label>
                  <input
                    id="formulaNameInput"
                    type="text"
                    required
                    value={formulaName}
                    onChange={(e) => setFormulaName(e.target.value)}
                    placeholder="e.g. Present Continuous, Simple Past"
                    className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="formulaStringInput" className="text-xs font-bold text-muted-foreground">
                    Formula Pattern *
                  </label>
                  <input
                    id="formulaStringInput"
                    type="text"
                    required
                    value={formulaString}
                    onChange={(e) => setFormulaString(e.target.value)}
                    placeholder="e.g. S + am/is/are + V-ing | Q: Aux + S + V1?"
                    className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="formulaDescInput" className="text-xs font-bold text-muted-foreground">
                  Description (Optional)
                </label>
                <textarea
                  id="formulaDescInput"
                  value={formulaDescription}
                  onChange={(e) => setFormulaDescription(e.target.value)}
                  placeholder="Briefly explain the use case or grammar context for this pattern..."
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm resize-none"
                />
              </div>

              {/* Extra Formula Rows (Optional Multi-Item Batch Creation) */}
              {extraFormulaRows.map((row, idx) => (
                <div key={row.id} className="space-y-3 pt-3 border-t border-dashed border-border/40 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">Formula #{idx + 2}</span>
                    <button
                      type="button"
                      onClick={() => setExtraFormulaRows(extraFormulaRows.filter((r) => r.id !== row.id))}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">
                        Formula Name #{idx + 2} *
                      </label>
                      <input
                        type="text"
                        required
                        value={row.name}
                        onChange={(e) => {
                          const updated = [...extraFormulaRows]
                          updated[idx].name = e.target.value
                          setExtraFormulaRows(updated)
                        }}
                        placeholder="Formula Name..."
                        className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">
                        Formula Pattern #{idx + 2} *
                      </label>
                      <input
                        type="text"
                        required
                        value={row.formula}
                        onChange={(e) => {
                          const updated = [...extraFormulaRows]
                          updated[idx].formula = e.target.value
                          setExtraFormulaRows(updated)
                        }}
                        placeholder="Pattern..."
                        className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      Description #{idx + 2} (Optional)
                    </label>
                    <textarea
                      value={row.description}
                      onChange={(e) => {
                        const updated = [...extraFormulaRows]
                        updated[idx].description = e.target.value
                        setExtraFormulaRows(updated)
                      }}
                      placeholder="Description..."
                      rows={2}
                      className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm resize-none"
                    />
                  </div>
                </div>
              ))}

              {/* + Add Another Formula Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setExtraFormulaRows([
                      ...extraFormulaRows,
                      { id: Math.random().toString(), name: "", formula: "", description: "" },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors py-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add Another Formula</span>
                </button>
              </div>
            </div>

            {formulaFormError && (
              <p className="text-xs text-destructive flex items-center gap-1 font-semibold animate-in slide-in-from-top-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {formulaFormError}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowFormulaForm(false)
                  setExtraFormulaRows([])
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:bg-secondary/60 hover:text-foreground hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formulaCreatePending}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {formulaCreatePending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : extraFormulaRows.length > 0 ? (
                  `Save ${extraFormulaRows.length + 1} Formulas`
                ) : (
                  "Save Formula"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Formulas Cards Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-44 rounded-2xl bg-card/35 border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 text-sm font-semibold text-destructive">
          <AlertCircle className="h-6 w-6" />
          <span>Error loading formulas. Please reload the page.</span>
        </div>
      ) : filteredFormulas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/40 py-16 text-center text-sm text-muted-foreground bg-card/10 select-none animate-in fade-in duration-200">
          {searchQueryFormula ? (
            <>
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
              <p className="font-bold">No results found</p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Try adjusting your search query.
              </p>
            </>
          ) : (
            <>
              <Sparkles className="mx-auto h-8 w-8 text-primary/60 mb-2 animate-pulse" />
              <p className="font-bold">No formulas registered yet</p>
              <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs mx-auto">
                Click &quot;Add Formula&quot; above to register your first grammar formula.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFormulas.map((f) => {
            const isEditing = editingId === f.id
            const stats = formulaPracticeStats[f.id] || { writing: 0, dialogue: 0, total: 0 }

            return (
              <div
                key={f.id}
                className="group relative rounded-xl border border-border bg-card/45 dark:bg-card/15 p-5 shadow-sm hover:border-primary/30 transition-all duration-200 flex flex-col justify-between"
              >
                {isEditing ? (
                  // Inline editing form
                  <div className="space-y-3 w-full">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Formula Name"
                      className="w-full text-xs font-bold rounded-lg border border-border/80 bg-background px-3 py-2 outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      value={editFormulaVal}
                      onChange={(e) => setEditFormulaVal(e.target.value)}
                      placeholder="Formula Pattern"
                      className="w-full text-xs font-mono rounded-lg border border-border/80 bg-background px-3 py-2 outline-none focus:border-primary"
                    />
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Description"
                      rows={2}
                      className="w-full text-xs rounded-lg border border-border/80 bg-background px-3 py-2 outline-none focus:border-primary resize-none"
                    />
                    <div className="flex justify-end gap-1.5 pt-2 border-t border-border/30">
                      <button
                        onClick={cancelEdit}
                        className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all cursor-pointer"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => saveEdit(f.id)}
                        disabled={!editName.trim() || !editFormulaVal.trim()}
                        className="p-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all disabled:opacity-50 cursor-pointer"
                        title="Save Changes"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display card
                  <>
                    <div className="space-y-3.5">
                      {/* Card Header row */}
                      <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2.5">
                        <span className="text-[10px] font-extrabold text-muted-foreground/50 tracking-wider">
                          FORMULA
                        </span>
                        
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(f)}
                            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            title="Edit formula"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFormula(f.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                            title="Delete formula"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Formula Name */}
                      <h4 className="text-base font-bold tracking-tight text-foreground leading-none">
                        {f.name}
                      </h4>

                      {/* Formula Pattern Code Box */}
                      <div className="font-mono bg-primary/5 border border-primary/10 text-primary px-3 py-2 rounded-xl text-xs font-bold leading-relaxed max-w-full overflow-x-auto select-all shadow-inner">
                        {f.formula}
                      </div>

                      {/* Description */}
                      {f.description ? (
                        <p className="text-xs text-muted-foreground/90 leading-relaxed">
                          {f.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/40 italic">
                          No description provided.
                        </p>
                      )}
                    </div>

                    {/* Bottom Metadata & Practice Badges */}
                    <div className="flex items-center justify-between border-t border-border/30 pt-3 mt-4">
                      {/* Practice statistics badges */}
                      <div className="flex gap-1.5">
                        {stats.total > 0 ? (
                          <>
                            {stats.writing > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                                <PencilLine className="h-2 w-2" /> Write: {stats.writing}
                              </span>
                            )}
                            {stats.dialogue > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                                <MessageSquare className="h-2 w-2" /> Dialog: {stats.dialogue}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase bg-muted text-muted-foreground border border-border/50">
                            Unpracticed
                          </span>
                        )}
                      </div>

                      <span className="text-[9px] font-bold text-muted-foreground/40 select-none">
                        Added {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
