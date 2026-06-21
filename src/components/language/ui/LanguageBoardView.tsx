"use client"

import React from "react"
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
} from "lucide-react"
import { GridCardSkeleton } from "@/components/ui/Skeletons"

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
  partOfSpeech: string
  setPartOfSpeech: (pos: string) => void
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
  partOfSpeech,
  setPartOfSpeech,
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
  return (
    <>
      {/* 1. Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-3 animate-in fade-in duration-200">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Vocabulary</span>
            <h4 className="text-3xl font-black text-foreground">
              {isLoading ? (
                <span className="inline-block w-12 h-8 bg-muted/20 animate-pulse rounded-md mt-0.5" />
              ) : (
                totalWords
              )}
            </h4>
            <p className="text-[10px] text-muted-foreground font-semibold">Words registered</p>
          </div>
          <div className="rounded-xl bg-violet-500/10 p-3 text-violet-500">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Memorized Words</span>
            <h4 className="text-3xl font-black text-foreground flex items-baseline gap-1">
              {isLoading ? (
                <span className="inline-block w-12 h-8 bg-muted/20 animate-pulse rounded-md mt-0.5" />
              ) : (
                <>
                  {memorizedCount}
                  <span className="text-sm font-bold text-muted-foreground">/ {totalWords}</span>
                </>
              )}
            </h4>
            <p className="text-[10px] text-muted-foreground font-semibold">{memorizedPercentage}% of total</p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Writing Practices</span>
            <h4 className="text-3xl font-black text-foreground">
              {isLoading ? (
                <span className="inline-block w-12 h-8 bg-muted/20 animate-pulse rounded-md mt-0.5" />
              ) : (
                writingCount
              )}
            </h4>
            <p className="text-[10px] text-muted-foreground font-semibold">Sentences constructed</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
            <PencilLine className="h-6 w-6" />
          </div>
        </div>
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

          {/* Memorized status filter selector */}
          <div className="flex gap-1.5 p-0.5 bg-secondary/20 border border-border/30 rounded-xl select-none shrink-0">
            <button
              onClick={() => setMemorizedFilter("all")}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                memorizedFilter === "all"
                  ? "bg-background text-foreground shadow-sm border border-border/20 font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({totalWords})
            </button>
            <button
              onClick={() => setMemorizedFilter("memorized")}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                memorizedFilter === "memorized"
                  ? "bg-background text-foreground shadow-sm border border-border/20 font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Memorized ({memorizedCount})
            </button>
            <button
              onClick={() => setMemorizedFilter("unmemorized")}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                memorizedFilter === "unmemorized"
                  ? "bg-background text-foreground shadow-sm border border-border/20 font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Learning ({totalWords - memorizedCount})
            </button>
          </div>

          {/* Quick reveal study assistant */}
          <div className="flex items-center gap-1.5 bg-secondary/40 border border-border/80 p-1 rounded-xl shrink-0 select-none">
            <button
              onClick={revealAllTranslations}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
              title="Reveal all translations for study review"
            >
              <Eye className="h-3.5 w-3.5" /> Reveal All
            </button>
            <button
              onClick={hideAllTranslations}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
              title="Hide all translations for quiz mode"
            >
              <EyeOff className="h-3.5 w-3.5" /> Hide All
            </button>
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
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Word Input */}
            <div className="space-y-1.5">
              <label htmlFor="vocabWord" className="text-xs font-bold text-muted-foreground">
                Word *
              </label>
              <input
                id="vocabWord"
                type="text"
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="e.g. Ephemeral"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
              />
            </div>

            {/* Part of Speech Selection */}
            <div className="space-y-1.5">
              <label htmlFor="vocabPos" className="text-xs font-bold text-muted-foreground">
                Part of Speech *
              </label>
              <select
                id="vocabPos"
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-sidebar-primary"
              >
                <option value="noun">Noun (Kata Benda)</option>
                <option value="verb">Verb (Kata Kerja)</option>
                <option value="adjective">Adjective (Kata Sifat)</option>
                <option value="adverb">Adverb (Kata Keterangan)</option>
                <option value="other">Other (Lainnya)</option>
              </select>
            </div>

            {/* Translation */}
            <div className="space-y-1.5">
              <label htmlFor="vocabTrans" className="text-xs font-bold text-muted-foreground">
                Translation *
              </label>
              <input
                id="vocabTrans"
                type="text"
                required
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="e.g. Temporary, brief"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
              />
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
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 text-sm font-semibold text-destructive">
          <AlertCircle className="h-6 w-6" />
          <span>Error loading vocabulary logs. Please check database.</span>
        </div>
      ) : filteredVocab.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground bg-card/10 select-none animate-in fade-in duration-200">
          No vocabulary matches the search filters. Click &quot;Add Vocabulary&quot; to record new words.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-250">
          {filteredVocab.map((vocab) => {
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
                                <div className="truncate">
                                  <span className="text-muted-foreground mr-1">V1:</span>
                                  <span className="font-bold text-white">{vocab.v1}</span>
                                </div>
                                <div className="text-muted-foreground truncate">
                                  {vocab.v1Translation}
                                </div>
                                
                                <div className="truncate">
                                  <span className="text-muted-foreground mr-1">V2:</span>
                                  <span className="font-bold text-white">{vocab.v2}</span>
                                </div>
                                <div className="text-muted-foreground truncate">
                                  {vocab.v2Translation}
                                </div>

                                <div className="truncate">
                                  <span className="text-muted-foreground mr-1">V3:</span>
                                  <span className="font-bold text-white">{vocab.v3}</span>
                                </div>
                                <div className="text-muted-foreground truncate">
                                  {vocab.v3Translation}
                                </div>

                                <div className="truncate">
                                  <span className="text-muted-foreground mr-1">V-ing:</span>
                                  <span className="font-bold text-white">{vocab.vIng}</span>
                                </div>
                                <div className="text-muted-foreground truncate">
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
      )}
    </>
  )
}
