"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import { VocabularyLog } from "@/hooks/useLanguage"
import { DictionaryView } from "./DictionaryView"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Loader2,
  Search,
  BookOpen,
  AlertCircle,
  Eye,
  EyeOff,
  Lightbulb,
  Check,
  CheckCircle2,
  PencilLine,
  Filter,
  ChevronDown,
} from "lucide-react"
import { GridCardSkeleton } from "@/components/ui/Skeletons"
import { StatCard } from "@/components/ui/StatCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { Badge } from "@/components/ui/Badge"
import { ErrorState } from "@/components/ui/ErrorState"
const capitalizeFirstLetter = (str: string | null | undefined): string => {
  if (!str) return ""
  const trimmed = str.trim()
  if (trimmed.length === 0) return ""
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

interface LanguageBoardViewProps {
  vocabList: VocabularyLog[]
  isLoading: boolean
  isError: boolean
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  memorizedFilter: "all" | "memorized" | "unmemorized"
  setMemorizedFilter: (filter: "all" | "memorized" | "unmemorized") => void
  revealedTranslationIds: Record<string, boolean>
  word: string
  setWord: (w: string) => void
  translation: string
  setTranslation: (t: string) => void
  langDirection: string
  setLangDirection: (dir: string) => void
  formError: string | null
  handleAddVocabulary: (e: React.FormEvent) => Promise<void>
  handleDeleteVocabulary: (id: string, wordStr: string) => Promise<void>
  handleToggleMemorized: (id: string, currentMemorized: boolean) => void
  toggleRevealTranslation: (id: string) => void
  revealAllTranslations: () => void
  hideAllTranslations: () => void
  totalWords: number
  memorizedCount: number
  memorizedPercentage: number
  filteredVocab: VocabularyLog[]
  vocabCreatePending: boolean
  writingCount: number
}

export function LanguageBoardView({
  vocabList,
  isLoading,
  isError,
  showAddForm,
  setShowAddForm,
  searchQuery,
  setSearchQuery,
  memorizedFilter,
  setMemorizedFilter,
  revealedTranslationIds,
  word,
  setWord,
  translation,
  setTranslation,
  langDirection,
  setLangDirection,
  formError,
  handleAddVocabulary,
  handleDeleteVocabulary,
  handleToggleMemorized,
  toggleRevealTranslation,
  revealAllTranslations,
  hideAllTranslations,
  totalWords,
  memorizedCount,
  memorizedPercentage,
  filteredVocab,
  vocabCreatePending,
  writingCount,
}: LanguageBoardViewProps) {
  const [dirFilter, setDirFilter] = useState<"all" | "en-id" | "id-en">("all")
  const [addMode, setAddMode] = useState<"dictionary" | "manual">("dictionary")
  const [collapsedLetters, setCollapsedLetters] = useState<Record<string, boolean>>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleLetterCollapse = (key: string) => {
    setCollapsedLetters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Group and sort vocabularies by direction first, then alphabetically
  const vocabByDirection = useMemo(() => {
    const directions = {
      "en-id": [] as VocabularyLog[],
      "id-en": [] as VocabularyLog[],
    }

    filteredVocab.forEach((vocab) => {
      const dir = (vocab.langDirection === "id-en" ? "id-en" : "en-id") as "en-id" | "id-en"
      directions[dir].push(vocab)
    })

    const makeGroupedAlphabetical = (list: VocabularyLog[]) => {
      const groups: Record<string, VocabularyLog[]> = {}
      const sorted = [...list].sort((a, b) => {
        const comp = a.word.toLowerCase().localeCompare(b.word.toLowerCase())
        if (comp !== 0) return comp
        return a.word.localeCompare(b.word)
      })
      sorted.forEach((vocab) => {
        const firstLetter = vocab.word.trim().charAt(0).toUpperCase()
        const letter = /^[A-Z]$/i.test(firstLetter) ? firstLetter : "#"
        if (!groups[letter]) {
          groups[letter] = []
        }
        groups[letter].push(vocab)
      })

      return Object.keys(groups)
        .sort((a, b) => {
          if (a === "#") return 1
          if (b === "#") return -1
          return a.localeCompare(b)
        })
        .map((letter) => ({
          letter,
          words: groups[letter],
        }))
    }

    const result = []

    if (dirFilter === "all" || dirFilter === "en-id") {
      result.push({
        direction: "en-id",
        label: "English ➔ Indonesian (EN ➔ ID)",
        grouped: makeGroupedAlphabetical(directions["en-id"]),
        count: directions["en-id"].length,
      })
    }

    if (dirFilter === "all" || dirFilter === "id-en") {
      result.push({
        direction: "id-en",
        label: "Indonesian ➔ English (ID ➔ EN)",
        grouped: makeGroupedAlphabetical(directions["id-en"]),
        count: directions["id-en"].length,
      })
    }

    return result
  }, [filteredVocab, dirFilter])

  const renderedCount = useMemo(() => {
    return vocabByDirection.reduce((acc, curr) => acc + curr.count, 0)
  }, [vocabByDirection])

  return (
    <>
      {/* 1. Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-3 animate-in fade-in duration-200">
        <StatCard
          title="Total Vocabulary"
          value={totalWords}
          icon={<BookOpen className="h-6 w-6" />}
          iconBgClass="bg-violet-500/10"
          iconTextClass="text-violet-500"
          isLoading={isLoading}
          description="Words registered"
        />

        <StatCard
          title="Memorized Words"
          value={
            <>
              {memorizedCount}
              <span className="text-sm font-bold text-muted-foreground">/ {totalWords}</span>
            </>
          }
          icon={<CheckCircle2 className="h-6 w-6" />}
          iconBgClass="bg-emerald-500/10"
          iconTextClass="text-emerald-500"
          isLoading={isLoading}
          description={`${memorizedPercentage}% of total`}
        />

        <StatCard
          title="Writing Practices"
          value={writingCount}
          icon={<PencilLine className="h-6 w-6" />}
          iconBgClass="bg-amber-500/10"
          iconTextClass="text-amber-500"
          isLoading={isLoading}
          description="Sentences constructed"
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-5 animate-in fade-in duration-200">
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-4xl">
          {/* Search text input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search word, meaning, or translation..."
              className="w-full rounded-xl border border-border bg-card/60 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
            />
          </div>

          {/* Filter Popover Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              type="button"
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all select-none cursor-pointer ${
                isFilterOpen || dirFilter !== "all" || memorizedFilter !== "all"
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filter & Actions</span>
              {(dirFilter !== "all" || memorizedFilter !== "all") && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute left-0 mt-2 z-50 w-72 rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* 1. Language Direction Group */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block select-none">
                    Language Direction
                  </span>
                  <div className="space-y-0.5">
                    {(
                      [
                        { id: "all", label: "All Directions" },
                        { id: "en-id", label: "English ➔ Indonesian" },
                        { id: "id-en", label: "Indonesian ➔ English" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDirFilter(opt.id)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-secondary/40 text-left cursor-pointer ${
                          dirFilter === opt.id ? "text-violet-400 bg-violet-500/5 font-bold" : "text-foreground"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {dirFilter === opt.id && <Check className="h-3.5 w-3.5 text-violet-400 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border/40" />

                {/* 2. Memorization Status Group */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block select-none">
                    Status
                  </span>
                  <div className="space-y-0.5">
                    {(
                      [
                        { id: "all", label: "All Words" },
                        { id: "memorized", label: "Memorized / Hafal" },
                        { id: "unmemorized", label: "Learning / Belajar" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMemorizedFilter(opt.id)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-secondary/40 text-left cursor-pointer ${
                          memorizedFilter === opt.id ? "text-violet-400 bg-violet-500/5 font-bold" : "text-foreground"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {memorizedFilter === opt.id && <Check className="h-3.5 w-3.5 text-violet-400 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border/40" />

                {/* 3. Study Assistant Actions Group */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block select-none">
                    Study Assistant
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        revealAllTranslations()
                        setIsFilterOpen(false)
                      }}
                      className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-border hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> Reveal All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        hideAllTranslations()
                        setIsFilterOpen(false)
                      }}
                      className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-border hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Hide All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-sidebar-primary px-4 py-2.5 text-xs font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/90 hover:scale-[1.02] active:scale-95 self-start md:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? "Cancel Add" : "Add Vocabulary"}
        </button>
      </div>

      {/* 3. Add Vocabulary Form Card / Dictionary Panel */}
      {showAddForm && (
        <div className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm backdrop-blur-md space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 select-none">
              <Plus className="h-4.5 w-4.5 text-violet-500" /> Add New Vocabulary
            </h3>
            {/* Sub-tabs for Add Mode */}
            <div className="flex gap-1 p-0.5 bg-secondary/60 border border-border/30 rounded-xl select-none text-[10px] w-fit self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setAddMode("dictionary")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  addMode === "dictionary"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Search Dictionary
              </button>
              <button
                type="button"
                onClick={() => setAddMode("manual")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  addMode === "manual"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Add Manually
              </button>
            </div>
          </div>

          {addMode === "dictionary" ? (
            <DictionaryView vocabList={vocabList} />
          ) : (
            <form onSubmit={handleAddVocabulary} className="space-y-4 pt-2">
              <div className="space-y-4">
                {/* Language Direction Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                    Language Direction / Arah Bahasa
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setLangDirection("en-id")}
                      className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-xl border transition-all active:scale-[0.99] cursor-pointer ${
                        langDirection === "en-id"
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "border-border text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      English ➔ Indonesian (EN ➔ ID)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLangDirection("id-en")}
                      className={`flex-1 py-2 px-3 text-xs font-extrabold rounded-xl border transition-all active:scale-[0.99] cursor-pointer ${
                        langDirection === "id-en"
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "border-border text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      Indonesian ➔ English (ID ➔ EN)
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Word Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="vocabWord" className="text-xs font-bold text-muted-foreground">
                      {langDirection === "id-en" ? "Word (Indonesian) *" : "Word (English) *"}
                    </label>
                    <input
                      id="vocabWord"
                      type="text"
                      required
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      placeholder={langDirection === "id-en" ? "e.g. Belajar" : "e.g. Ephemeral"}
                      className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10 shadow-sm"
                    />
                  </div>

                  {/* Translation */}
                  <div className="space-y-1.5">
                    <label htmlFor="vocabTrans" className="text-xs font-bold text-muted-foreground">
                      {langDirection === "id-en" ? "Translation (English) *" : "Translation (Indonesian) *"}
                    </label>
                    <input
                      id="vocabTrans"
                      type="text"
                      required
                      value={translation}
                      onChange={(e) => setTranslation(e.target.value)}
                      placeholder={langDirection === "id-en" ? "e.g. Study, learn" : "e.g. Temporary, brief"}
                      className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {formError && (
                <p className="text-xs text-destructive flex items-center gap-1 font-semibold animate-in slide-in-from-top-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 border-t border-border/40 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:bg-secondary/60 hover:text-foreground hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={vocabCreatePending}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sidebar-primary px-4 py-2.5 text-xs font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/90 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {vocabCreatePending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Save Word"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 4. Vocabulary Cards Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <GridCardSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="Error loading vocabulary logs. Please check database." />
      ) : filteredVocab.length === 0 || renderedCount === 0 ? (
        <EmptyState
          title="No vocabulary matches the search filters."
          description="Click &quot;Add Vocabulary&quot; to record new words."
        />
      ) : (
        <div className="space-y-12 animate-in fade-in duration-250">
          {vocabByDirection.map(({ direction, label, grouped, count }) => {
            if (count === 0) return null

            return (
              <div key={direction} className="space-y-6">
                {/* Section Title Header */}
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${direction === "id-en" ? "bg-amber-500" : "bg-blue-500"}`} />
                  <h3 className="text-sm font-bold text-foreground tracking-wide uppercase select-none">
                    {label}
                  </h3>
                  <span className="text-[10px] font-extrabold text-muted-foreground px-2 py-0.5 rounded-full bg-secondary/50 border border-border/50 select-none">
                    {count} words
                  </span>
                </div>

                {/* Alphabet Groups */}
                <div className="space-y-8">
                  {grouped.map(({ letter, words }) => {
                    const groupKey = `${direction}-${letter}`
                    const isCollapsed = collapsedLetters[groupKey] === true

                    return (
                      <div key={letter} className="space-y-3">
                        {/* Collapsible Group Header / Separator */}
                        <button
                          type="button"
                          onClick={() => toggleLetterCollapse(groupKey)}
                          className="w-full flex items-center justify-between p-3 bg-secondary/20 hover:bg-secondary/45 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60 border border-border/80 rounded-xl transition-all duration-200 select-none cursor-pointer text-left shadow-sm active:scale-[0.995]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="inline-flex h-8 w-8 items-center justify-center text-xs font-extrabold bg-sidebar-primary text-sidebar-primary-foreground rounded-lg shadow-sm border border-white/5 uppercase select-none">
                              {letter}
                            </div>
                            <span className="text-xs font-bold text-muted-foreground">
                              {words.length} {words.length === 1 ? "Word" : "Words"} logged
                            </span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                              isCollapsed ? "" : "rotate-180 text-violet-500"
                            }`}
                          />
                        </button>

                        {/* Collapsible Group Border Container */}
                        <AnimatePresence initial={false}>
                          {!isCollapsed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="rounded-2xl border border-border bg-card/10 dark:bg-card/5 p-5 shadow-sm mt-1">
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                  {words.map((vocab) => {
                                    const isRevealed = !!revealedTranslationIds[vocab.id]

                                    return (
                                      <VocabCard
                                        key={vocab.id}
                                        vocab={vocab}
                                        isRevealed={isRevealed}
                                        handleToggleMemorized={handleToggleMemorized}
                                        handleDeleteVocabulary={handleDeleteVocabulary}
                                        toggleRevealTranslation={toggleRevealTranslation}
                                      />
                                    )
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

interface VocabCardProps {
  vocab: VocabularyLog
  isRevealed: boolean
  handleToggleMemorized: (id: string, currentMemorized: boolean) => void
  handleDeleteVocabulary: (id: string, wordStr: string) => Promise<void>
  toggleRevealTranslation: (id: string) => void
}

const VocabCard = React.memo(function VocabCard({
  vocab,
  isRevealed,
  handleToggleMemorized,
  handleDeleteVocabulary,
  toggleRevealTranslation,
}: VocabCardProps) {
  // Split translation by comma or semicolon to render as clean chips
  const meanings = vocab.translation
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean)

  return (
    <div
      className={`group relative rounded-2xl border p-5 shadow-sm transition-all duration-300 flex flex-col justify-between backdrop-blur-md ${
        vocab.memorized
          ? "border-border/40 bg-secondary/10 dark:bg-card/5 opacity-70"
          : "border-border bg-card/45 dark:bg-card/15 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 hover:translate-y-[-2px]"
      }`}
    >
      {/* Header row */}
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
          <div className="flex items-center gap-1.5">
            <Badge variant="primary">
              VOCAB
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {/* Memorized Checklist Toggle */}
            <button
              onClick={() => handleToggleMemorized(vocab.id, vocab.memorized)}
              className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-95 cursor-pointer ${
                vocab.memorized
                  ? "bg-primary border-primary text-primary-foreground shadow-glow"
                  : "border-border/80 hover:border-primary/50 hover:bg-primary/10 bg-card"
              }`}
              aria-label="Toggle word memorized"
              title={vocab.memorized ? "Mark as learning" : "Mark as memorized"}
            >
              {vocab.memorized && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            </button>

            <button
              onClick={() => handleDeleteVocabulary(vocab.id, vocab.word)}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 cursor-pointer"
              aria-label={`Delete word ${vocab.word}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Word */}
        <div className="space-y-2 mt-3.5 flex-1">
          <h4 className={`text-2xl font-black tracking-tight text-foreground leading-none ${vocab.memorized ? "text-muted-foreground" : ""}`}>
            {capitalizeFirstLetter(vocab.word)}
          </h4>
        </div>

        {/* Translation clicking review block */}
        <div className="my-4.5">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-2 select-none flex items-center gap-1">
            <Lightbulb className="h-3 w-3 text-violet-500" /> Translation
          </div>

          <div
            onClick={() => toggleRevealTranslation(vocab.id)}
            className={`relative min-h-[56px] flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all p-4 cursor-pointer select-none ${
              isRevealed
                ? "bg-secondary/20 dark:bg-zinc-950/20 border-border/50 text-foreground"
                : "bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/45 text-primary hover:scale-[1.01] active:scale-95 shadow-sm"
            }`}
          >
            {isRevealed ? (
              <div className="flex flex-wrap gap-1.5 justify-center w-full">
                {meanings.map((meaning, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-xl border bg-card/65 text-foreground border-border/60 shadow-sm transition-all hover:bg-card hover:scale-[1.02]"
                  >
                    {capitalizeFirstLetter(meaning)}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-colors">
                <Eye className="h-4 w-4 stroke-[2.5]" /> Click to reveal
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
