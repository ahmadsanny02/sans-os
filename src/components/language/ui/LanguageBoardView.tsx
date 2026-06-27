"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import { VocabularyLog } from "@/hooks/useLanguage"
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
import { ErrorState } from "@/components/ui/ErrorState"

interface LanguageBoardViewProps {
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
  // Local state for direction filter ("all" | "en-id" | "id-en")
  const [dirFilter, setDirFilter] = useState<"all" | "en-id" | "id-en">("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
      const sorted = [...list].sort((a, b) => 
        a.word.localeCompare(b.word, undefined, { sensitivity: "base" })
      )
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
                  ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                  : "border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filter & Actions</span>
              {(dirFilter !== "all" || memorizedFilter !== "all") && (
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              )}
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 z-50 w-72 rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
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
          className="inline-flex items-center gap-1.5 rounded-lg bg-sidebar-primary px-3.5 py-2 text-xs font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/90 hover:scale-[1.02] self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? "Cancel Add" : "Add Vocabulary"}
        </button>
      </div>

      {/* 3. Add Vocabulary Form Card */}
      {showAddForm && (
        <form
          onSubmit={handleAddVocabulary}
          className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm backdrop-blur-md space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
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
                      ? "bg-violet-500/10 text-violet-400 border-violet-500/30"
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
                      ? "bg-violet-500/10 text-violet-400 border-violet-500/30"
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
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
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
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
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
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={vocabCreatePending}
              className="rounded-lg bg-sidebar-primary px-3.5 py-1.5 text-xs font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary/95 flex items-center gap-1"
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
                  <span className="text-[10px] font-extrabold text-muted-foreground px-2 py-0.5 rounded bg-secondary/50 border border-border/50 select-none">
                    {count} words
                  </span>
                </div>

                {/* Alphabet Groups */}
                <div className="space-y-8">
                  {grouped.map(({ letter, words }) => (
                    <div key={letter} className="space-y-3">
                      {/* Group Letter Badge */}
                      <div className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold tracking-wider text-muted-foreground uppercase bg-secondary/30 dark:bg-zinc-800/50 border border-border/80 rounded-lg select-none shadow-sm">
                        {letter}
                      </div>

                      {/* Group Border Container */}
                      <div className="rounded-2xl border border-border bg-card/10 dark:bg-card/5 p-5 shadow-sm">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {words.map((vocab) => {
                            const isRevealed = !!revealedTranslationIds[vocab.id]

                            return (
                              <div
                                key={vocab.id}
                                className={`group relative rounded-xl border p-5 shadow-sm transition-all duration-300 flex flex-col justify-between ${
                                  vocab.memorized
                                    ? "border-border/50 bg-secondary/15 opacity-75"
                                    : "border-border bg-card/45 dark:bg-card/15 hover:border-sidebar-primary/30"
                                }`}
                              >
                                {/* Header row */}
                                <div>
                                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-extrabold text-muted-foreground/50 tracking-wider">
                                        VOCAB
                                      </span>
                                      {vocab.partOfSpeech && vocab.partOfSpeech !== "n/a" && (
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                                          vocab.partOfSpeech === "verb"
                                            ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                                            : vocab.partOfSpeech === "noun"
                                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                            : vocab.partOfSpeech === "adjective"
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : vocab.partOfSpeech === "adverb"
                                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                            : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                                        }`}>
                                          {vocab.partOfSpeech}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {/* Memorized Checklist Toggle */}
                                      <button
                                        onClick={() => handleToggleMemorized(vocab.id, vocab.memorized)}
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 cursor-pointer ${
                                          vocab.memorized
                                            ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                                            : "border-border hover:border-sidebar-primary/50 hover:bg-sidebar-primary/10"
                                        }`}
                                        aria-label="Toggle word memorized"
                                        title={vocab.memorized ? "Mark as unmemorized" : "Mark as memorized"}
                                      >
                                        {vocab.memorized && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                      </button>

                                      <button
                                        onClick={() => handleDeleteVocabulary(vocab.id, vocab.word)}
                                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                                        aria-label={`Delete word ${vocab.word}`}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Word */}
                                  <div className="space-y-2 mt-3 flex-1">
                                    <h4 className={`text-xl font-bold tracking-tight text-foreground leading-none ${vocab.memorized ? "text-muted-foreground" : ""}`}>
                                      {vocab.word}
                                    </h4>
                                  </div>

                                  {/* Translation clicking review block */}
                                  <div className="my-4.5">
                                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1.5 select-none flex items-center gap-1">
                                      <Lightbulb className="h-3 w-3 text-violet-500" /> Translation
                                    </div>

                                    <div
                                      onClick={() => toggleRevealTranslation(vocab.id)}
                                      className={`relative min-h-[48px] flex rounded-lg border transition-all p-3 select-none cursor-pointer ${
                                        isRevealed
                                          ? "bg-secondary/40 border-border/60 text-foreground items-start justify-start"
                                          : "bg-secondary/10 border-dashed border-border/40 text-muted-foreground backdrop-blur-[2px] items-center justify-center"
                                      }`}
                                    >
                                      {isRevealed ? (
                                        <div className="flex flex-col gap-2 w-full text-left">
                                          <div>
                                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block select-none">
                                              Manual
                                            </span>
                                            <span className="text-xs font-bold text-foreground leading-normal">{vocab.translation}</span>
                                          </div>
                                          {vocab.autoTranslation && (
                                            <div className="border-t border-border/40 pt-1.5 mt-1">
                                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block select-none">
                                                Google Translate
                                              </span>
                                              <span className="text-xs font-medium text-muted-foreground leading-normal italic">{vocab.autoTranslation}</span>
                                            </div>
                                          )}
                                          {vocab.partOfSpeech.trim().toLowerCase() === "verb" && vocab.v1 && (
                                            <div className="border-t border-border/40 pt-1.5 mt-2 space-y-1.5">
                                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-violet-400 block select-none">
                                                Verb Conjugations
                                              </span>
                                              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] rounded-lg bg-zinc-950/40 p-2 border border-white/5 font-mono">
                                                <div className="break-words whitespace-normal">
                                                  <span className="text-muted-foreground mr-1">V1:</span>
                                                  <span className="font-bold text-white">{vocab.v1}</span>
                                                </div>
                                                <div className="text-muted-foreground break-words whitespace-normal">
                                                  {vocab.v1Translation}
                                                </div>
                                                
                                                <div className="break-words whitespace-normal">
                                                  <span className="text-muted-foreground mr-1">V2:</span>
                                                  <span className="font-bold text-white">{vocab.v2}</span>
                                                </div>
                                                <div className="text-muted-foreground break-words whitespace-normal">
                                                  {vocab.v2Translation}
                                                </div>

                                                <div className="break-words whitespace-normal">
                                                  <span className="text-muted-foreground mr-1">V3:</span>
                                                  <span className="font-bold text-white">{vocab.v3}</span>
                                                </div>
                                                <div className="text-muted-foreground break-words whitespace-normal">
                                                  {vocab.v3Translation}
                                                </div>

                                                <div className="break-words whitespace-normal">
                                                  <span className="text-muted-foreground mr-1">V-ing:</span>
                                                  <span className="font-bold text-white">{vocab.vIng}</span>
                                                </div>
                                                <div className="text-muted-foreground break-words whitespace-normal">
                                                  {vocab.vIngTranslation}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider select-none text-muted-foreground/60 group-hover:text-muted-foreground/95 transition-colors">
                                          <Eye className="h-3.5 w-3.5" /> Click to reveal
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
