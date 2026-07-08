import React, { useRef, useEffect, useState } from "react"
import { VocabularyLog, WritingLog, GroupedWritingLog } from "@/hooks/useLanguage"
import {
  Plus,
  Trash2,
  Loader2,
  Search,
  AlertCircle,
  PencilLine,
  Check,
  Minus,
  BookOpen,
} from "lucide-react"
import { GridCardSkeleton } from "@/components/ui/Skeletons"

interface WritingPracticeViewProps {
  showWritingForm: boolean
  setShowWritingForm: (show: boolean) => void
  vocabList: VocabularyLog[]
  writingList: WritingLog[]
  isLoading: boolean
  isError: boolean
  practiceMode: "free" | "vocab"
  setPracticeMode: (mode: "free" | "vocab") => void
  activeHistoryTab: "vocab" | "free"
  setActiveHistoryTab: (tab: "vocab" | "free") => void
  searchQueryWriting: string
  setSearchQueryWriting: (q: string) => void
  selectedVocabId: string
  setSelectedVocabId: (id: string) => void
  searchVocabQuery: string
  setSearchVocabQuery: (q: string) => void
  showVocabDropdown: boolean
  setShowVocabDropdown: (show: boolean) => void
  freeEnglish: string
  setFreeEnglish: (s: string) => void
  freeTranslation: string
  setFreeTranslation: (s: string) => void
  vocabEngPos: string
  setVocabEngPos: (s: string) => void
  vocabTransPos: string
  setVocabTransPos: (s: string) => void
  vocabEngNeg: string
  setVocabEngNeg: (s: string) => void
  vocabTransNeg: string
  setVocabTransNeg: (s: string) => void
  vocabEngInt: string
  setVocabEngInt: (s: string) => void
  vocabTransInt: string
  setVocabTransInt: (s: string) => void
  writingFormError: string | null
  handleAddWriting: (
    e: React.FormEvent,
    formData?: {
      freeEnglish?: string
      freeTranslation?: string
      vocabEngPos?: string
      vocabTransPos?: string
      vocabEngNeg?: string
      vocabTransNeg?: string
      vocabEngInt?: string
      vocabTransInt?: string
    }
  ) => Promise<void>
  handleDeleteWriting: (id: string) => Promise<void>
  handleSelectVocab: (id: string, word: string) => void
  filteredVocabList: VocabularyLog[]
  vocabWritingLogs: GroupedWritingLog[]
  freeWritingLogs: WritingLog[]
  filteredGroupedHistory: GroupedWritingLog[]
  filteredFreeHistory: WritingLog[]
  writingCreatePending: boolean
  writingDeletePending: boolean
}

export function WritingPracticeView({
  showWritingForm,
  setShowWritingForm,
  vocabList,
  isLoading,
  isError,
  practiceMode,
  setPracticeMode,
  activeHistoryTab,
  setActiveHistoryTab,
  searchQueryWriting,
  setSearchQueryWriting,
  selectedVocabId,
  setSelectedVocabId,
  searchVocabQuery,
  setSearchVocabQuery,
  showVocabDropdown,
  setShowVocabDropdown,
  writingFormError,
  handleAddWriting,
  handleDeleteWriting,
  handleSelectVocab,
  filteredVocabList,
  vocabWritingLogs,
  freeWritingLogs,
  filteredGroupedHistory,
  filteredFreeHistory,
  writingCreatePending,
  writingDeletePending,
}: WritingPracticeViewProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [localFreeEnglish, setLocalFreeEnglish] = useState("")
  const [localFreeTranslation, setLocalFreeTranslation] = useState("")
  const [localVocabEngPos, setLocalVocabEngPos] = useState("")
  const [localVocabTransPos, setLocalVocabTransPos] = useState("")
  const [localVocabEngNeg, setLocalVocabEngNeg] = useState("")
  const [localVocabTransNeg, setLocalVocabTransNeg] = useState("")
  const [localVocabEngInt, setLocalVocabEngInt] = useState("")
  const [localVocabTransInt, setLocalVocabTransInt] = useState("")

  // Reset local form values when form closes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!showWritingForm) {
      setLocalFreeEnglish("")
      setLocalFreeTranslation("")
      setLocalVocabEngPos("")
      setLocalVocabTransPos("")
      setLocalVocabEngNeg("")
      setLocalVocabTransNeg("")
      setLocalVocabEngInt("")
      setLocalVocabTransInt("")
    }
  }, [showWritingForm])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleAddWriting(e, {
      freeEnglish: localFreeEnglish,
      freeTranslation: localFreeTranslation,
      vocabEngPos: localVocabEngPos,
      vocabTransPos: localVocabTransPos,
      vocabEngNeg: localVocabEngNeg,
      vocabTransNeg: localVocabTransNeg,
      vocabEngInt: localVocabEngInt,
      vocabTransInt: localVocabTransInt,
    })
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowVocabDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setShowVocabDropdown])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header Row (Tabs, Search, and Toggle Form Button) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-5 select-none">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQueryWriting}
              onChange={(e) => setSearchQueryWriting(e.target.value)}
              placeholder={
                activeHistoryTab === "vocab"
                  ? "Search sentences or vocabulary word..."
                  : "Search free writing sentences..."
              }
              className="w-full rounded-xl border border-border/60 bg-card/40 pl-9 pr-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          
          {/* History Category Selector */}
          <div className="flex gap-1.5 p-0.5 bg-secondary/35 border border-border/30 rounded-xl select-none shrink-0 self-start sm:self-auto">
            <button
              onClick={() => {
                setActiveHistoryTab("vocab")
                setSearchQueryWriting("")
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeHistoryTab === "vocab"
                  ? "bg-primary text-primary-foreground shadow-glass shadow-glow font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" /> Vocab-Based ({vocabWritingLogs.length})
            </button>
            <button
              onClick={() => {
                setActiveHistoryTab("free")
                setSearchQueryWriting("")
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeHistoryTab === "free"
                  ? "bg-primary text-primary-foreground shadow-glass shadow-glow font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PencilLine className="h-3.5 w-3.5" /> Free Writing ({freeWritingLogs.length})
            </button>
          </div>
        </div>

        {/* Toggle Form Button */}
        <button
          onClick={() => setShowWritingForm(!showWritingForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:scale-[1.02] active:scale-95 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          {showWritingForm ? "Cancel Add" : "Add Writing"}
        </button>
      </div>

      {/* 2. Form Workspace (Only displays if showWritingForm is true) */}
      {showWritingForm && (
        <div className="bento-card p-5 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <PencilLine className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">New Writing Practice</h3>
          </div>

          {/* Practice Mode Selector Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/30 rounded-xl mb-5 border border-border/30 select-none max-w-sm">
            <button
              type="button"
              onClick={() => setPracticeMode("free")}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                practiceMode === "free"
                  ? "bg-primary text-primary-foreground shadow-glass shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Free Writing
            </button>
            <button
              type="button"
              onClick={() => {
                setPracticeMode("vocab")
                const activeObj = vocabList.find(v => v.id === selectedVocabId)
                if (activeObj) {
                  setSearchVocabQuery(activeObj.word)
                } else if (vocabList.length > 0) {
                  setSelectedVocabId(vocabList[0].id)
                  setSearchVocabQuery(vocabList[0].word)
                }
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                practiceMode === "vocab"
                  ? "bg-primary text-primary-foreground shadow-glass shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Vocab-Based
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Conditional Fields for Vocabulary Practice */}
            {practiceMode === "vocab" && (
              <div className="space-y-4 border-b border-border/40 pb-4 animate-in fade-in duration-200">
                {/* Searchable autocomplete select */}
                <div className="space-y-1.5 relative max-w-md" ref={dropdownRef}>
                  <label className="text-xs font-bold text-muted-foreground">
                    Search & Select Word *
                  </label>
                  {vocabList.length === 0 ? (
                    <div className="text-xs border border-destructive/25 bg-destructive/5 text-destructive rounded-lg p-2.5 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      No vocabulary found. Add vocabulary in the first tab first.
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchVocabQuery}
                          onFocus={() => setShowVocabDropdown(true)}
                          onChange={(e) => {
                            setSearchVocabQuery(e.target.value)
                            setSelectedVocabId("") // Clear selection while typing
                            setShowVocabDropdown(true)
                          }}
                          placeholder="Type to search vocabulary..."
                          className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                        {selectedVocabId && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Valid Word Selected" />
                        )}
                      </div>

                      {showVocabDropdown && (
                        <div className="absolute z-30 w-full mt-1.5 max-h-48 overflow-y-auto rounded-lg border border-border/40 bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in slide-in-from-top-1 duration-150">
                          {filteredVocabList.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-muted-foreground">
                              No matching vocabulary found
                            </div>
                          ) : (
                            filteredVocabList.map((v) => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => handleSelectVocab(v.id, v.word)}
                                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between cursor-pointer ${
                                  selectedVocabId === v.id ? "bg-accent/40 font-bold" : ""
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
            )}

            {/* FREE WRITING INPUTS */}
            {practiceMode === "free" ? (
              <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <label htmlFor="freeEnglish" className="text-xs font-bold text-muted-foreground">
                    English Sentence *
                  </label>
                  <textarea
                    id="freeEnglish"
                    rows={3}
                    required
                    value={localFreeEnglish}
                    onChange={(e) => setLocalFreeEnglish(e.target.value)}
                    placeholder="Type your English sentence practice here..."
                    className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="freeTranslation" className="text-xs font-bold text-muted-foreground">
                    Indonesian Translation *
                  </label>
                  <textarea
                    id="freeTranslation"
                    rows={3}
                    required
                    value={localFreeTranslation}
                    onChange={(e) => setLocalFreeTranslation(e.target.value)}
                    placeholder="Indonesian translation..."
                    className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none leading-relaxed"
                  />
                </div>
              </div>
            ) : (
              /* VOCAB BASED THREE-SENTENCE INPUTS */
              <div className="grid gap-4 sm:grid-cols-3 animate-in fade-in duration-200">
                
                {/* Positive (+) Sentence Pair */}
                <div className="space-y-2.5 border-l-2 border-emerald-500 pl-3">
                  <div className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-500">
                      1. Positive Sentence (+)
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      value={localVocabEngPos}
                      onChange={(e) => setLocalVocabEngPos(e.target.value)}
                      placeholder="English positive sentence..."
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                    <input
                      type="text"
                      required
                      value={localVocabTransPos}
                      onChange={(e) => setLocalVocabTransPos(e.target.value)}
                      placeholder="Indonesian translation..."
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* Negative (-) Sentence Pair */}
                <div className="space-y-2.5 border-l-2 border-rose-500 pl-3">
                  <div className="flex items-center gap-1">
                    <Minus className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-xs font-extrabold uppercase tracking-wide text-rose-500">
                      2. Negative Sentence (-)
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      value={localVocabEngNeg}
                      onChange={(e) => setLocalVocabEngNeg(e.target.value)}
                      placeholder="English negative sentence..."
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                    <input
                      type="text"
                      required
                      value={localVocabTransNeg}
                      onChange={(e) => setLocalVocabTransNeg(e.target.value)}
                      placeholder="Indonesian translation..."
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* Interrogative (?) Sentence Pair */}
                <div className="space-y-2.5 border-l-2 border-blue-500 pl-3">
                  <div className="flex items-center gap-1">
                    <span className="h-3.5 w-3.5 text-blue-500 font-extrabold text-xs">?</span>
                    <span className="text-xs font-extrabold uppercase tracking-wide text-blue-500">
                      3. Interrogative Sentence (?)
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      value={localVocabEngInt}
                      onChange={(e) => setLocalVocabEngInt(e.target.value)}
                      placeholder="English question sentence..."
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                    <input
                      type="text"
                      required
                      value={localVocabTransInt}
                      onChange={(e) => setLocalVocabTransInt(e.target.value)}
                      placeholder="Indonesian translation..."
                      className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

              </div>
            )}

            {writingFormError && (
              <p className="text-xs text-destructive flex items-center gap-1 font-semibold animate-in slide-in-from-top-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {writingFormError}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
              <button
                type="button"
                onClick={() => setShowWritingForm(false)}
                className="rounded-lg border border-border/40 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  writingCreatePending ||
                  (practiceMode === "vocab" && (!selectedVocabId || vocabList.length === 0))
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {writingCreatePending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Save Practice
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
            <span>Error loading writing logs. Please check database.</span>
          </div>
        ) : activeHistoryTab === "vocab" ? (
          // ==================== VOCAB-BASED HISTORY (GROUPED CARDS) ====================
          filteredGroupedHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/40 py-16 text-center text-sm text-muted-foreground bg-card/10 select-none animate-in fade-in duration-200">
              {searchQueryWriting
                ? "No sentences match your search query."
                : "No vocab-based sentences recorded yet. Click 'Add Writing' to practice!"}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-300">
              {filteredGroupedHistory.map((group) => {
                return (
                  <div
                    key={group.id}
                    className="group relative rounded-xl border border-border/60 bg-card/40 dark:bg-card/15 p-4 shadow-sm hover:border-primary/30 hover:bg-card/75 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Vocab Word & Delete */}
                      <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-sm">
                          Word: {group.vocabWord}
                        </span>

                        <button
                          onClick={() => handleDeleteWriting(group.allIds.join(","))}
                          disabled={writingDeletePending}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 cursor-pointer"
                          aria-label="Delete sentence group"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Positive Section */}
                      {group.positive && (
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                              Positive
                            </span>
                          </div>
                          <p className="text-sm font-semibold tracking-tight text-foreground leading-relaxed">
                            {group.positive.englishSentence}
                          </p>
                          <div className="text-xs text-muted-foreground/80 leading-relaxed italic space-y-0.5 pl-2 border-l border-emerald-500/30">
                            <p className="font-semibold text-muted-foreground/90">{group.positive.indonesianTranslation}</p>
                            {group.positive.autoTranslation && (
                              <p className="text-muted-foreground/50 text-[10px] not-italic">Google: {group.positive.autoTranslation}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Negative Section */}
                      {group.negative && (
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20">
                              Negative
                            </span>
                          </div>
                          <p className="text-sm font-semibold tracking-tight text-foreground leading-relaxed">
                            {group.negative.englishSentence}
                          </p>
                          <div className="text-xs text-muted-foreground/80 leading-relaxed italic space-y-0.5 pl-2 border-l border-rose-500/30">
                            <p className="font-semibold text-muted-foreground/90">{group.negative.indonesianTranslation}</p>
                            {group.negative.autoTranslation && (
                              <p className="text-muted-foreground/50 text-[10px] not-italic">Google: {group.negative.autoTranslation}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Interrogative Section */}
                      {group.interrogative && (
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
                              Interrogative
                            </span>
                          </div>
                          <p className="text-sm font-semibold tracking-tight text-foreground leading-relaxed">
                            {group.interrogative.englishSentence}
                          </p>
                          <div className="text-xs text-muted-foreground/80 leading-relaxed italic space-y-0.5 pl-2 border-l border-blue-500/30">
                            <p className="font-semibold text-muted-foreground/90">{group.interrogative.indonesianTranslation}</p>
                            {group.interrogative.autoTranslation && (
                              <p className="text-muted-foreground/50 text-[10px] not-italic">Google: {group.interrogative.autoTranslation}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="mt-3.5 text-[9px] font-semibold text-muted-foreground/60 text-right border-t border-border/20 pt-2 animate-in fade-in duration-200">
                      {new Date(group.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          // ==================== FREE WRITING HISTORY ====================
          filteredFreeHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/40 py-16 text-center text-sm text-muted-foreground bg-card/10 select-none animate-in fade-in duration-200">
              {searchQueryWriting
                ? "No sentences match your search query."
                : "No free writing logs recorded yet. Click 'Add Writing' to practice!"}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-300">
              {filteredFreeHistory.map((log) => {
                return (
                  <div
                    key={log.id}
                    className="group relative rounded-xl border border-border/60 bg-card/40 dark:bg-card/15 p-4 shadow-sm hover:border-primary/30 hover:bg-card/75 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {/* Top Badges Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-secondary/40 text-muted-foreground border border-border/55">
                          Free Writing
                        </span>

                        <button
                          onClick={() => handleDeleteWriting(log.id)}
                          disabled={writingDeletePending}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 cursor-pointer"
                          aria-label="Delete sentence log"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* English Sentence */}
                      <p className="text-sm font-semibold tracking-tight text-foreground leading-relaxed">
                        {log.englishSentence}
                      </p>

                      {/* Indonesian translation */}
                      <div className="pt-1.5 border-t border-dashed border-border/30 mt-2 space-y-2">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                            Manual Translation
                          </span>
                          <p className="text-xs text-muted-foreground leading-relaxed italic font-semibold">
                            {log.indonesianTranslation}
                          </p>
                        </div>
                        {log.autoTranslation && (
                          <div className="border-t border-dotted border-border/40 pt-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                              Google Translation
                            </span>
                            <p className="text-xs text-muted-foreground/80 leading-relaxed italic">
                              {log.autoTranslation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="mt-3 text-[9px] font-semibold text-muted-foreground/60 text-right">
                      {new Date(log.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
