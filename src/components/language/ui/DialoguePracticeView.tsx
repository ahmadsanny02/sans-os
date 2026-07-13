import React, { useRef, useEffect, useState } from "react"
import { VocabularyLog, DialogueLog } from "@/hooks/useLanguage"
import {
  Plus,
  Trash2,
  Loader2,
  Search,
  AlertCircle,
  BookOpen,
  Eye,
  EyeOff,
  MessageSquare,
  Sparkles,
} from "lucide-react"
import { GridCardSkeleton } from "@/components/ui/Skeletons"

interface DialoguePracticeViewProps {
  vocabList: VocabularyLog[]
  dialogueList: DialogueLog[]
  isLoading: boolean
  isError: boolean
  showDialogueForm: boolean
  setShowDialogueForm: (show: boolean) => void
  dialoguePracticeMode: "vocab" | "formula"
  setDialoguePracticeMode: (mode: "vocab" | "formula") => void
  dialogueActiveHistoryTab: "vocab" | "formula"
  setDialogueActiveHistoryTab: (tab: "vocab" | "formula") => void
  searchQueryDialogue: string
  setSearchQueryDialogue: (q: string) => void
  selectedDialogueVocabId: string
  setSelectedDialogueVocabId: (id: string) => void
  searchDialogueVocabQuery: string
  setSearchDialogueVocabQuery: (q: string) => void
  showDialogueVocabDropdown: boolean
  setShowDialogueVocabDropdown: (show: boolean) => void
  dialogueEngQ: string
  setDialogueEngQ: (s: string) => void
  dialogueTransQ: string
  setDialogueTransQ: (s: string) => void
  dialogueEngA: string
  setDialogueEngA: (s: string) => void
  dialogueTransA: string
  setDialogueTransA: (s: string) => void
  dialogueFormula: string
  setDialogueFormula: (s: string) => void
  dialogueFormError: string | null
  revealedDialogueTranslationIds: Record<string, boolean>
  handleSelectDialogueVocab: (id: string, word: string) => void
  handleAddDialogue: (
    e: React.FormEvent,
    formData?: {
      dialogueEngQ?: string
      dialogueTransQ?: string
      dialogueEngA?: string
      dialogueTransA?: string
      dialogueFormula?: string
    }
  ) => Promise<void>
  handleDeleteDialogue: (id: string, wordStr: string) => Promise<void>
  toggleDialogueTranslation: (id: string) => void
  revealAllDialogueTranslations: () => void
  hideAllDialogueTranslations: () => void
  filteredDialogueVocabList: VocabularyLog[]
  vocabDialogueLogs: DialogueLog[]
  formulaDialogueLogs: DialogueLog[]
  filteredVocabDialogueHistory: DialogueLog[]
  filteredFormulaDialogueHistory: DialogueLog[]
  dialogueCreatePending: boolean
  dialogueDeletePending: boolean
}

export function DialoguePracticeView({
  vocabList,
  isLoading,
  isError,
  showDialogueForm,
  setShowDialogueForm,
  dialoguePracticeMode,
  setDialoguePracticeMode,
  dialogueActiveHistoryTab,
  setDialogueActiveHistoryTab,
  searchQueryDialogue,
  setSearchQueryDialogue,
  selectedDialogueVocabId,
  setSelectedDialogueVocabId,
  searchDialogueVocabQuery,
  setSearchDialogueVocabQuery,
  showDialogueVocabDropdown,
  setShowDialogueVocabDropdown,
  dialogueFormError,
  revealedDialogueTranslationIds,
  handleSelectDialogueVocab,
  handleAddDialogue,
  handleDeleteDialogue,
  toggleDialogueTranslation,
  revealAllDialogueTranslations,
  hideAllDialogueTranslations,
  filteredDialogueVocabList,
  vocabDialogueLogs,
  formulaDialogueLogs,
  filteredVocabDialogueHistory,
  filteredFormulaDialogueHistory,
  dialogueCreatePending,
  dialogueDeletePending,
}: DialoguePracticeViewProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [localDialogueEngQ, setLocalDialogueEngQ] = useState("")
  const [localDialogueTransQ, setLocalDialogueTransQ] = useState("")
  const [localDialogueEngA, setLocalDialogueEngA] = useState("")
  const [localDialogueTransA, setLocalDialogueTransA] = useState("")
  const [localDialogueFormula, setLocalDialogueFormula] = useState("")

  // Reset local form values when form closes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!showDialogueForm) {
      setLocalDialogueEngQ("")
      setLocalDialogueTransQ("")
      setLocalDialogueEngA("")
      setLocalDialogueTransA("")
      setLocalDialogueFormula("")
    }
  }, [showDialogueForm])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleAddDialogue(e, {
      dialogueEngQ: localDialogueEngQ,
      dialogueTransQ: localDialogueTransQ,
      dialogueEngA: localDialogueEngA,
      dialogueTransA: localDialogueTransA,
      dialogueFormula: localDialogueFormula,
    })
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDialogueVocabDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setShowDialogueVocabDropdown])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header Row (Reveal helper, Search, and Toggle Add button) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border/40 pb-5 select-none">
        <div className="flex flex-col md:flex-row gap-3 flex-1 max-w-4xl">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQueryDialogue}
              onChange={(e) => setSearchQueryDialogue(e.target.value)}
              placeholder={
                dialogueActiveHistoryTab === "vocab"
                  ? "Search by vocabulary word or sentences..."
                  : "Search by formula or sentences..."
              }
              className="w-full rounded-xl border border-border/60 bg-card/40 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* History Category Selector */}
          <div className="flex gap-1.5 p-0.5 bg-secondary/35 border border-border/30 rounded-xl select-none shrink-0 self-start md:self-auto">
            <button
              onClick={() => {
                setDialogueActiveHistoryTab("vocab")
                setSearchQueryDialogue("")
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                dialogueActiveHistoryTab === "vocab"
                  ? "bg-primary text-primary-foreground shadow-glass shadow-glow font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" /> Vocab-Based ({vocabDialogueLogs.length})
            </button>
            <button
              onClick={() => {
                setDialogueActiveHistoryTab("formula")
                setSearchQueryDialogue("")
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                dialogueActiveHistoryTab === "formula"
                  ? "bg-primary text-primary-foreground shadow-glass shadow-glow font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" /> Formula-Based ({formulaDialogueLogs.length})
            </button>
          </div>

          {/* Study Reveal Actions */}
          <div className="flex items-center gap-1.5 bg-secondary/35 border border-border/30 p-1 rounded-xl shrink-0 self-start md:self-auto select-none">
            <button
              onClick={revealAllDialogueTranslations}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
              title="Reveal all dialogue translations"
            >
              <Eye className="h-3.5 w-3.5" /> Reveal All
            </button>
            <button
              onClick={hideAllDialogueTranslations}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
              title="Hide all dialogue translations"
            >
              <EyeOff className="h-3.5 w-3.5" /> Hide All
            </button>
          </div>
        </div>

        {/* Toggle Dialogue Form Button */}
        <button
          onClick={() => setShowDialogueForm(!showDialogueForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95 self-start lg:self-auto"
        >
          <Plus className="h-4 w-4" />
          {showDialogueForm ? "Cancel Add" : "Add Dialogue"}
        </button>
      </div>

      {/* 2. Dialogue Form Card (Only visible if showDialogueForm is true) */}
      {showDialogueForm && (
        <div className="bento-card p-5 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Add Conversation</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Practice Mode Selector Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/30 rounded-xl mb-5 border border-border/30 select-none max-w-sm">
              <button
                type="button"
                onClick={() => setDialoguePracticeMode("vocab")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  dialoguePracticeMode === "vocab"
                    ? "bg-primary text-primary-foreground shadow-glass shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Vocab-Based
              </button>
              <button
                type="button"
                onClick={() => setDialoguePracticeMode("formula")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  dialoguePracticeMode === "formula"
                    ? "bg-primary text-primary-foreground shadow-glass shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Formula-Based
              </button>
            </div>

            {/* Conditional Fields for Formula-Based Practice */}
            {dialoguePracticeMode === "formula" && (
              <div className="space-y-4 border-b border-border/40 pb-4 animate-in fade-in duration-200">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Formula Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="dialogueFormulaInput" className="text-xs font-bold text-muted-foreground">
                      Formula / Rumus *
                    </label>
                    <input
                      id="dialogueFormulaInput"
                      type="text"
                      required
                      value={localDialogueFormula}
                      onChange={(e) => setLocalDialogueFormula(e.target.value)}
                      placeholder="e.g. Q: Aux + S + V1? | A: S + V1"
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  {/* Optional Vocab Selector */}
                  <div className="space-y-1.5 relative" ref={dropdownRef}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-muted-foreground">
                        Select Word (Optional)
                      </label>
                      {selectedDialogueVocabId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDialogueVocabId("")
                            setSearchDialogueVocabQuery("")
                          }}
                          className="text-[10px] text-destructive hover:underline font-semibold cursor-pointer"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>
                    {vocabList.length === 0 ? (
                      <div className="text-xs border border-border/40 bg-muted/20 text-muted-foreground rounded-lg p-2.5 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        No vocabulary found. You can still save dialogue with just the formula.
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchDialogueVocabQuery}
                            onFocus={() => setShowDialogueVocabDropdown(true)}
                            onChange={(e) => {
                              setSearchDialogueVocabQuery(e.target.value)
                              setSelectedDialogueVocabId("") // Clear selection while typing
                              setShowDialogueVocabDropdown(true)
                            }}
                            placeholder="Type to filter vocabulary..."
                            className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                          />
                          {selectedDialogueVocabId && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Word Linked" />
                          )}
                        </div>

                        {showDialogueVocabDropdown && (
                          <div className="absolute z-30 w-full mt-1.5 max-h-48 overflow-y-auto rounded-lg border border-border/40 bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in slide-in-from-top-1 duration-150">
                            {filteredDialogueVocabList.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-muted-foreground">
                                No matching vocabulary found
                              </div>
                            ) : (
                              filteredDialogueVocabList.map((v) => (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => handleSelectDialogueVocab(v.id, v.word)}
                                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between cursor-pointer ${
                                    selectedDialogueVocabId === v.id ? "bg-accent/40 font-bold" : ""
                                  }`}
                                >
                                  <span>{v.word}</span>
                                  <span className="text-[10px] text-muted-foreground italic max-w-[120px] truncate">{v.translation}</span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Conditional Fields for Vocabulary Practice */}
            {dialoguePracticeMode === "vocab" && (
              <div className="space-y-1.5 relative max-w-md" ref={dropdownRef}>
                <label className="text-xs font-bold text-muted-foreground">
                  Search & Select Vocabulary Word *
                </label>
                {vocabList.length === 0 ? (
                  <div className="text-xs border border-destructive/25 bg-destructive/5 text-destructive rounded-lg p-2.5 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    No vocabulary found. Please register vocabulary logs first.
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchDialogueVocabQuery}
                        onFocus={() => setShowDialogueVocabDropdown(true)}
                        onChange={(e) => {
                          setSearchDialogueVocabQuery(e.target.value)
                          setSelectedDialogueVocabId("") // Clear selection while typing
                          setShowDialogueVocabDropdown(true)
                        }}
                        placeholder="Search vocabulary logs..."
                        className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                      {selectedDialogueVocabId && (
                        <span 
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" 
                          title="Vocabulary Word Selected" 
                        />
                      )}
                    </div>

                    {showDialogueVocabDropdown && (
                      <div className="absolute z-30 w-full mt-1.5 max-h-48 overflow-y-auto rounded-lg border border-border/40 bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in slide-in-from-top-1 duration-150">
                        {filteredDialogueVocabList.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-muted-foreground">
                            No matching vocabulary found
                          </div>
                        ) : (
                          filteredDialogueVocabList.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => handleSelectDialogueVocab(v.id, v.word)}
                              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between cursor-pointer ${
                                selectedDialogueVocabId === v.id ? "bg-accent/40 font-bold" : ""
                              }`}
                            >
                              <span>{v.word}</span>
                              <span className="text-[10px] text-muted-foreground italic max-w-[120px] truncate">
                                {v.translation}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* English & Translation inputs wrapper */}
            <div className="grid gap-6 sm:grid-cols-2">
              
              {/* USER A: Question Form Inputs */}
              <div className="space-y-3 border-l-2 border-primary pl-3.5 py-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                    Q
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    User A (Question)
                  </span>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={localDialogueEngQ}
                    onChange={(e) => setLocalDialogueEngQ(e.target.value)}
                    placeholder="English question (e.g., What are you doing?)"
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <input
                    type="text"
                    required
                    value={localDialogueTransQ}
                    onChange={(e) => setLocalDialogueTransQ(e.target.value)}
                    placeholder="Indonesian translation (e.g., Apa yang sedang kamu lakukan?)"
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* USER B: Answer Form Inputs */}
              <div className="space-y-3 border-l-2 border-emerald-500 pl-3.5 py-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold">
                    A
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    User B (Answer)
                  </span>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={localDialogueEngA}
                    onChange={(e) => setLocalDialogueEngA(e.target.value)}
                    placeholder="English answer (e.g., I am reading a book.)"
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <input
                    type="text"
                    required
                    value={localDialogueTransA}
                    onChange={(e) => setLocalDialogueTransA(e.target.value)}
                    placeholder="Indonesian translation (e.g., Saya sedang membaca buku.)"
                    className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

            </div>

            {dialogueFormError && (
              <p className="text-xs text-destructive flex items-center gap-1 font-semibold animate-in slide-in-from-top-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {dialogueFormError}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
              <button
                type="button"
                onClick={() => setShowDialogueForm(false)}
                className="rounded-lg border border-border/40 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  dialogueCreatePending ||
                  (dialoguePracticeMode === "vocab" && (!selectedDialogueVocabId || vocabList.length === 0)) ||
                  (dialoguePracticeMode === "formula" && !localDialogueFormula.trim())
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {dialogueCreatePending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Save Dialogue
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. History Feed (Flows 1-column full-width) */}
      <div className="space-y-4 w-full">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <GridCardSkeleton key={idx} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 text-sm font-semibold text-destructive">
            <AlertCircle className="h-6 w-6" />
            <span>Error loading dialogue logs. Please reload the page.</span>
          </div>
        ) : dialogueActiveHistoryTab === "vocab" ? (
          // ==================== VOCAB-BASED DIALOGUE HISTORY ====================
          filteredVocabDialogueHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/40 py-16 text-center text-sm text-muted-foreground bg-card/10 select-none animate-in fade-in duration-200">
              {searchQueryDialogue ? (
                <>
                  <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                  <p className="font-bold">No results found</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Try adjusting your search keywords.
                  </p>
                </>
              ) : (
                <>
                  <Sparkles className="mx-auto h-8 w-8 text-primary/60 mb-2 animate-pulse" />
                  <p className="font-bold">No vocab-based dialogue practices yet</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs mx-auto">
                    Click &quot;Add Dialogue&quot; above and write a vocab-based Q&A conversation practice.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              {filteredVocabDialogueHistory.map((log) => {
                const isRevealed = !!revealedDialogueTranslationIds[log.id]
                return (
                  <div
                    key={log.id}
                    className="group rounded-2xl border border-border/60 bg-card/40 dark:bg-card/20 p-5 shadow-sm hover:bg-card/65 hover:border-primary/20 transition-all duration-200 backdrop-blur-md relative"
                  >
                    {/* Log Header Actions */}
                    <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" />
                          Word: {log.vocabWord}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleDialogueTranslation(log.id)}
                          title={isRevealed ? "Hide translations" : "Reveal translations"}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteDialogue(log.id, log.vocabWord || "")}
                          disabled={dialogueDeletePending}
                          title="Delete dialogue log"
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Chat Bubble Conversational Script */}
                    <div className="space-y-4">
                      {/* Speaker A */}
                      <div className="flex flex-col items-start space-y-1 max-w-[85%]">
                        <div className="flex items-center gap-1.5 ml-1">
                          <span className="text-[10px] font-extrabold text-primary uppercase tracking-wide">
                            User A
                          </span>
                        </div>
                        <div className="bg-primary/[0.07] dark:bg-primary/[0.12] border border-primary/15 rounded-2xl rounded-tl-none px-4 py-3 text-left">
                          <p className="text-sm font-semibold text-foreground leading-relaxed">
                            {log.englishQuestion}
                          </p>
                          {isRevealed && (
                            <div className="mt-2.5 pt-2 border-t border-primary/10 dark:border-primary/20 space-y-2 animate-in fade-in duration-200">
                              <div>
                                <span className="text-[8px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                  Manual Translation
                                </span>
                                <p className="text-xs text-muted-foreground italic font-semibold">
                                  {log.indonesianQuestion}
                                </p>
                              </div>
                              {log.autoTranslationQuestion && (
                                <div className="border-t border-dotted border-primary/10 dark:border-primary/20 pt-1">
                                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                    Google Translation
                                  </span>
                                  <p className="text-xs text-muted-foreground/80 italic">
                                    {log.autoTranslationQuestion}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Speaker B */}
                      <div className="flex flex-col items-end space-y-1 ml-auto max-w-[85%]">
                        <div className="flex items-center gap-1.5 mr-1">
                          <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wide">
                            User B
                          </span>
                        </div>
                        <div className="bg-emerald-500/[0.07] dark:bg-emerald-500/[0.12] border border-emerald-500/15 rounded-2xl rounded-tr-none px-4 py-3 text-left">
                          <p className="text-sm font-semibold text-foreground leading-relaxed">
                            {log.englishAnswer}
                          </p>
                          {isRevealed && (
                            <div className="mt-2.5 pt-2 border-t border-emerald-500/10 dark:border-emerald-500/20 space-y-2 animate-in fade-in duration-200">
                              <div>
                                <span className="text-[8px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                  Manual Translation
                                </span>
                                <p className="text-xs text-muted-foreground italic font-semibold">
                                  {log.indonesianAnswer}
                                </p>
                              </div>
                              {log.autoTranslationAnswer && (
                                <div className="border-t border-dotted border-emerald-500/10 dark:border-emerald-500/20 pt-1">
                                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                    Google Translation
                                  </span>
                                  <p className="text-xs text-muted-foreground/80 italic">
                                    {log.autoTranslationAnswer}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          // ==================== FORMULA-BASED DIALOGUE HISTORY ====================
          filteredFormulaDialogueHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/40 py-16 text-center text-sm text-muted-foreground bg-card/10 select-none animate-in fade-in duration-200">
              {searchQueryDialogue ? (
                <>
                  <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                  <p className="font-bold">No results found</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Try adjusting your search keywords.
                  </p>
                </>
              ) : (
                <>
                  <Sparkles className="mx-auto h-8 w-8 text-primary/60 mb-2 animate-pulse" />
                  <p className="font-bold">No formula-based dialogue practices yet</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs mx-auto">
                    Click &quot;Add Dialogue&quot; above and write a formula-based Q&A conversation practice.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              {filteredFormulaDialogueHistory.map((log) => {
                const isRevealed = !!revealedDialogueTranslationIds[log.id]
                return (
                  <div
                    key={log.id}
                    className="group rounded-2xl border border-border/60 bg-card/40 dark:bg-card/20 p-5 shadow-sm hover:bg-card/65 hover:border-primary/20 transition-all duration-200 backdrop-blur-md relative"
                  >
                    {/* Log Header Actions */}
                    <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5" />
                          Formula: {log.formula}
                        </span>
                        {log.vocabWord && (
                          <span className="bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            Word: {log.vocabWord}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleDialogueTranslation(log.id)}
                          title={isRevealed ? "Hide translations" : "Reveal translations"}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteDialogue(log.id, log.formula || "")}
                          disabled={dialogueDeletePending}
                          title="Delete dialogue log"
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Chat Bubble Conversational Script */}
                    <div className="space-y-4">
                      {/* Speaker A */}
                      <div className="flex flex-col items-start space-y-1 max-w-[85%]">
                        <div className="flex items-center gap-1.5 ml-1">
                          <span className="text-[10px] font-extrabold text-primary uppercase tracking-wide">
                            User A
                          </span>
                        </div>
                        <div className="bg-primary/[0.07] dark:bg-primary/[0.12] border border-primary/15 rounded-2xl rounded-tl-none px-4 py-3 text-left">
                          <p className="text-sm font-semibold text-foreground leading-relaxed">
                            {log.englishQuestion}
                          </p>
                          {isRevealed && (
                            <div className="mt-2.5 pt-2 border-t border-primary/10 dark:border-primary/20 space-y-2 animate-in fade-in duration-200">
                              <div>
                                <span className="text-[8px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                  Manual Translation
                                </span>
                                <p className="text-xs text-muted-foreground italic font-semibold">
                                  {log.indonesianQuestion}
                                </p>
                              </div>
                              {log.autoTranslationQuestion && (
                                <div className="border-t border-dotted border-primary/10 dark:border-primary/20 pt-1">
                                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                    Google Translation
                                  </span>
                                  <p className="text-xs text-muted-foreground/80 italic">
                                    {log.autoTranslationQuestion}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Speaker B */}
                      <div className="flex flex-col items-end space-y-1 ml-auto max-w-[85%]">
                        <div className="flex items-center gap-1.5 mr-1">
                          <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wide">
                            User B
                          </span>
                        </div>
                        <div className="bg-emerald-500/[0.07] dark:bg-emerald-500/[0.12] border border-emerald-500/15 rounded-2xl rounded-tr-none px-4 py-3 text-left">
                          <p className="text-sm font-semibold text-foreground leading-relaxed">
                            {log.englishAnswer}
                          </p>
                          {isRevealed && (
                            <div className="mt-2.5 pt-2 border-t border-emerald-500/10 dark:border-emerald-500/20 space-y-2 animate-in fade-in duration-200">
                              <div>
                                <span className="text-[8px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                  Manual Translation
                                </span>
                                <p className="text-xs text-muted-foreground italic font-semibold">
                                  {log.indonesianAnswer}
                                </p>
                              </div>
                              {log.autoTranslationAnswer && (
                                <div className="border-t border-dotted border-emerald-500/10 dark:border-emerald-500/20 pt-1">
                                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                    Google Translation
                                  </span>
                                  <p className="text-xs text-muted-foreground/80 italic">
                                    {log.autoTranslationAnswer}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>

    </div>
  )
}
