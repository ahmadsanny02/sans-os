"use client"

import React, { useState } from "react"
import {
  useVocabularyQuery,
  useCreateVocabularyMutation,
  useUpdateMasteryMutation,
  useDeleteVocabularyMutation,
  VocabularyLog,
} from "@/hooks/useLanguage"
import {
  Plus,
  Trash2,
  Star,
  Loader2,
  Search,
  BookOpen,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Lightbulb,
} from "lucide-react"
import { GridCardSkeleton } from "@/components/ui/Skeletons"

// Part of Speech tag styling themes
const POS_THEMES: Record<string, { bg: string; text: string; border: string }> = {
  Noun: { bg: "bg-blue-500/10", text: "text-blue-500 dark:text-blue-400", border: "border-blue-500/20" },
  Verb: { bg: "bg-emerald-500/10", text: "text-emerald-500 dark:text-emerald-400", border: "border-emerald-500/20" },
  Adjective: { bg: "bg-amber-500/10", text: "text-amber-500 dark:text-amber-400", border: "border-amber-500/20" },
  Adverb: { bg: "bg-purple-500/10", text: "text-purple-500 dark:text-purple-400", border: "border-purple-500/20" },
  Preposition: { bg: "bg-pink-500/10", text: "text-pink-500 dark:text-pink-400", border: "border-pink-500/20" },
  Conjunction: { bg: "bg-teal-500/10", text: "text-teal-500 dark:text-teal-400", border: "border-teal-500/20" },
  Pronoun: { bg: "bg-indigo-500/10", text: "text-indigo-500 dark:text-indigo-400", border: "border-indigo-500/20" },
  Interjection: { bg: "bg-rose-500/10", text: "text-rose-500 dark:text-rose-400", border: "border-rose-500/20" },
  Default: { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400", border: "border-slate-500/20" },
}

export function LanguageBoard() {
  const { data: vocabList = [], isLoading, isError } = useVocabularyQuery()
  const createVocabMutation = useCreateVocabularyMutation()
  const updateMasteryMutation = useUpdateMasteryMutation()
  const deleteVocabMutation = useDeleteVocabularyMutation()

  // State controls
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPOSFilter, setSelectedPOSFilter] = useState("All")

  // Click to reveal translations state mapping
  const [revealedTranslationIds, setRevealedTranslationIds] = useState<Record<string, boolean>>({})

  // Form fields state
  const [word, setWord] = useState("")
  const [pos, setPos] = useState("Noun")
  const [definition, setDefinition] = useState("")
  const [translation, setTranslation] = useState("")
  const [exampleSentence, setExampleSentence] = useState("")
  const [mastery, setMastery] = useState(3)
  const [formError, setFormError] = useState<string | null>(null)

  const handleAddVocabulary = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setFormError(null)

    if (!word.trim() || !definition.trim() || !translation.trim()) {
      setFormError("Please fill out all required fields.")
      return
    }

    try {
      await createVocabMutation.mutateAsync({
        word: word.trim(),
        partOfSpeech: pos,
        definition: definition.trim(),
        translation: translation.trim(),
        exampleSentence: exampleSentence.trim() || undefined,
        masteryLevel: mastery,
      })
      setWord("")
      setDefinition("")
      setTranslation("")
      setExampleSentence("")
      setMastery(3)
      setShowAddForm(false)
    } catch {
      setFormError("Failed to add vocabulary log.")
    }
  }

  const handleDeleteVocabulary = async (id: string, wordStr: string): Promise<void> => {
    if (!confirm(`Are you sure you want to delete the word "${wordStr}"?`)) return
    try {
      await deleteVocabMutation.mutateAsync(id)
    } catch {
      alert("Failed to delete vocabulary log.")
    }
  }

  const handleStarClick = (id: string, level: number): void => {
    updateMasteryMutation.mutate({ id, masteryLevel: level })
  }

  const toggleRevealTranslation = (id: string): void => {
    setRevealedTranslationIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const revealAllTranslations = (): void => {
    const allIds: Record<string, boolean> = {}
    vocabList.forEach((v) => {
      allIds[v.id] = true
    })
    setRevealedTranslationIds(allIds)
  }

  const hideAllTranslations = (): void => {
    setRevealedTranslationIds({})
  }

  // Calculate statistics metrics
  const totalWords = vocabList.length
  const averageMastery = totalWords > 0
    ? Number((vocabList.reduce((acc, curr) => acc + curr.masteryLevel, 0) / totalWords).toFixed(1))
    : 0
  const strongWordsCount = vocabList.filter((v) => v.masteryLevel >= 4).length

  // Filter list
  const filteredVocab = vocabList.filter((v) => {
    const matchesQuery =
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.definition.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPOS = selectedPOSFilter === "All" || v.partOfSpeech === selectedPOSFilter

    return matchesQuery && matchesPOS
  })

  // List of POS categories for filter badges
  const POS_CATEGORIES = ["All", "Noun", "Verb", "Adjective", "Adverb", "Preposition", "Conjunction", "Pronoun", "Interjection"]



  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Vocabulary</span>
            <h4 className="text-3xl font-black text-foreground">{isLoading ? "..." : totalWords}</h4>
          </div>
          <div className="rounded-xl bg-violet-500/10 p-3 text-violet-500">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Average Mastery</span>
            <h4 className="text-3xl font-black text-foreground flex items-baseline gap-1">
              {isLoading ? "..." : averageMastery}
              <span className="text-sm font-bold text-muted-foreground">/ 5.0</span>
            </h4>
          </div>
          <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
            <Star className="h-6 w-6 fill-amber-500" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm flex items-center justify-between backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mastered Words (4+)</span>
            <h4 className="text-3xl font-black text-foreground">{isLoading ? "..." : strongWordsCount}</h4>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 2. Search, POS Filter badge, & Toggle Add */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-5">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          {/* Search text input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search word, meaning, or translation..."
              className="w-full rounded-xl border border-border bg-card/60 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
            />
          </div>

          {/* Quick reveal study assistant */}
          <div className="flex items-center gap-1.5 bg-secondary/40 border border-border/80 p-1 rounded-xl shrink-0 self-start sm:self-auto select-none">
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
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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

            {/* POS select */}
            <div className="space-y-1.5">
              <label htmlFor="vocabPOS" className="text-xs font-bold text-muted-foreground">
                Part of Speech *
              </label>
              <select
                id="vocabPOS"
                value={pos}
                onChange={(e) => setPos(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
              >
                {POS_CATEGORIES.slice(1).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Mastery Selection */}
            <div className="space-y-1.5">
              <label htmlFor="vocabMastery" className="text-xs font-bold text-muted-foreground">
                Initial Mastery *
              </label>
              <select
                id="vocabMastery"
                value={mastery}
                onChange={(e) => setMastery(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
              >
                <option value="1">1 - Learning (New word)</option>
                <option value="2">2 - Familiar (Need study)</option>
                <option value="3">3 - Confident (Moderate)</option>
                <option value="4">4 - Good (High recall)</option>
                <option value="5">5 - Strong (Mastered)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Definition */}
            <div className="space-y-1.5">
              <label htmlFor="vocabDef" className="text-xs font-bold text-muted-foreground">
                Meaning / Definition *
              </label>
              <input
                id="vocabDef"
                type="text"
                required
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder="e.g. Lasting for a very short time"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
              />
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
                placeholder="e.g. Sementara, singkat"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
              />
            </div>
          </div>

          {/* Example Sentence */}
          <div className="space-y-1.5">
            <label htmlFor="vocabExample" className="text-xs font-bold text-muted-foreground">
              Example Sentence
            </label>
            <input
              id="vocabExample"
              type="text"
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              placeholder="e.g. Fashions are ephemeral, but style is eternal."
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary"
            />
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
              disabled={createVocabMutation.isPending}
              className="rounded-lg bg-sidebar-primary px-3.5 py-1.5 text-xs font-semibold text-sidebar-primary-foreground hover:bg-sidebar-primary/95 flex items-center gap-1"
            >
              {createVocabMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Save Word"
              )}
            </button>
          </div>
        </form>
      )}

      {/* 4. POS Categories horizontal tabs scroll filter */}
      <div className="overflow-x-auto pb-2 border-b border-border/30">
        <div className="flex gap-2 min-w-max">
          {POS_CATEGORIES.map((p) => {
            const isActive = selectedPOSFilter === p
            return (
              <button
                key={p}
                onClick={() => setSelectedPOSFilter(p)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary font-bold shadow-sm"
                    : "bg-secondary/20 hover:bg-secondary/50 border-border text-muted-foreground"
                }`}
              >
                {p}
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. Vocabulary Cards Grid */}
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
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground bg-card/10 select-none">
          No vocabulary matches the search filters. Click &quot;Add Vocabulary&quot; to record new words.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVocab.map((vocab: VocabularyLog) => {
            const posTheme = POS_THEMES[vocab.partOfSpeech] || POS_THEMES.Default
            const isRevealed = !!revealedTranslationIds[vocab.id]

            return (
              <div
                key={vocab.id}
                className="group relative rounded-xl border border-border bg-card/45 dark:bg-card/15 p-5 shadow-sm hover:border-sidebar-primary/30 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Header row */}
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${posTheme.bg} ${posTheme.text} ${posTheme.border}`}>
                      {vocab.partOfSpeech}
                    </span>
                    <button
                      onClick={() => handleDeleteVocabulary(vocab.id, vocab.word)}
                      disabled={deleteVocabMutation.isPending}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                      aria-label={`Delete word ${vocab.word}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Word and Definition */}
                  <div className="space-y-2 mt-3 flex-1">
                    <h4 className="text-xl font-bold tracking-tight text-foreground leading-none">
                      {vocab.word}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      {vocab.definition}
                    </p>
                  </div>

                  {/* Translation clicking review block */}
                  <div className="my-4.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1.5 select-none flex items-center gap-1">
                      <Lightbulb className="h-3 w-3 text-violet-500" /> Translation
                    </div>

                    <div
                      onClick={() => toggleRevealTranslation(vocab.id)}
                      className={`relative min-h-[42px] flex items-center justify-center rounded-lg border text-xs font-bold transition-all p-2 select-none cursor-pointer ${
                        isRevealed
                          ? "bg-secondary/40 border-border/60 text-foreground"
                          : "bg-secondary/10 border-dashed border-border/40 text-muted-foreground backdrop-blur-[2px]"
                      }`}
                    >
                      {isRevealed ? (
                        <span className="text-center font-bold tracking-normal">{vocab.translation}</span>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider select-none text-muted-foreground/60 group-hover:text-muted-foreground/95 transition-colors">
                          <Eye className="h-3.5 w-3.5" /> Click to reveal
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Example Sentence */}
                  {vocab.exampleSentence && (
                    <div className="border-l-2 border-border/80 pl-3 py-1 my-3 bg-secondary/10 rounded-r-md">
                      <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                        &ldquo;{vocab.exampleSentence}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer interactive Mastery Selector */}
                <div className="border-t border-border/40 pt-3 flex flex-col gap-1 select-none">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">Mastery Level</span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[1, 2, 3, 4, 5].map((level) => {
                      const isGold = level <= vocab.masteryLevel
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleStarClick(vocab.id, level)}
                          className="p-0.5 rounded transition-transform active:scale-95"
                          aria-label={`Rate mastery level ${level}`}
                        >
                          <Star className={`h-4.5 w-4.5 ${
                            isGold
                              ? "text-amber-500 fill-amber-500 hover:scale-110"
                              : "text-muted/60 hover:text-amber-500/50"
                          } transition-all`} />
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
