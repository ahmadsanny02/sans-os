"use client"

import React, { useState, useEffect } from "react"
import {
  useCreateVocabularyMutation,
  VocabularyLog,
  useDictionaryByLetterQuery,
  useDictionarySearchQuery,
  useDictionaryWordDetailsQuery,
  DictionaryWord,
  WordDetails,
} from "@/hooks/useLanguage"
import { showError, showSuccessToast } from "@/lib/sweetalert"
import { Search, Loader2, BookOpen, Plus, Check, ChevronDown, Sparkles, BookMarked } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface DictionaryViewProps {
  vocabList: VocabularyLog[]
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

// Custom debounce hook for search query
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function DictionaryView({ vocabList }: DictionaryViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const debouncedSearchQuery = useDebounce(searchQuery, 400)
  const [collapsedLetters, setCollapsedLetters] = useState<Record<string, boolean>>({})
  const [expandedWord, setExpandedWord] = useState<string | null>(null)

  const createVocabMutation = useCreateVocabularyMutation()

  // Fetch search results using react-query
  const isSearchActive = debouncedSearchQuery.trim().length > 0
  const { data: searchWords = [], isFetching: isSearching } = useDictionarySearchQuery(
    debouncedSearchQuery,
    isSearchActive
  )

  const toggleLetterCollapse = (letter: string) => {
    const isCollapsed = collapsedLetters[letter] !== false
    setCollapsedLetters((prev) => ({
      ...prev,
      [letter]: !isCollapsed,
    }))
  }

  // Save dictionary word to logs
  const handleSaveToLogs = async (wordObj: WordDetails) => {
    const isDuplicate = vocabList.some(
      (v) => v.word.trim().toLowerCase() === wordObj.word.trim().toLowerCase()
    )

    if (isDuplicate) {
      showError("Duplicate", "This word is already registered in your logs.")
      return
    }

    try {
      await createVocabMutation.mutateAsync({
        word: wordObj.word,
        partOfSpeech: wordObj.partOfSpeech || "noun",
        definition: wordObj.definition || "No definition available",
        translation: wordObj.translation,
        langDirection: "en-id", // Dictionary is EN -> ID
        masteryLevel: 3,
      })
      showSuccessToast(`Saved "${wordObj.word}" to logs`)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to save word"
      showError("Error", errMsg)
    }
  }

  const makeGroupedAlphabetical = (list: DictionaryWord[]) => {
    const groups: Record<string, DictionaryWord[]> = {}
    const sorted = [...list].sort((a, b) =>
      a.word.toLowerCase().localeCompare(b.word.toLowerCase())
    )
    sorted.forEach((item) => {
      const firstLetter = item.word.trim().charAt(0).toUpperCase()
      const letter = /^[A-Z]$/i.test(firstLetter) ? firstLetter : "#"
      if (!groups[letter]) {
        groups[letter] = []
      }
      groups[letter].push(item)
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

  const activeGroups = isSearchActive
    ? makeGroupedAlphabetical(searchWords)
    : ALPHABET.map((letter) => ({
        letter,
        words: null, // Signals child components to load dynamically
      }))

  return (
    <div className="space-y-6">
      {/* Search and Quick Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search word in dictionary..."
            className="w-full rounded-xl border border-border/60 bg-card/40 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
          <Sparkles className="h-4 w-4 text-primary" />
          Powered by Datamuse & Free Dictionary API
        </div>
      </div>

      {/* Words Grid / List */}
      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs font-semibold text-muted-foreground">Searching dictionary words...</span>
        </div>
      ) : isSearchActive && searchWords.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/60 rounded-3xl space-y-2 bg-secondary/5 animate-in fade-in duration-200">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No words found</h3>
          <p className="text-xs text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          {activeGroups.map(({ letter, words: searchGroupWords }) => {
            const isCollapsed = collapsedLetters[letter] !== false

            return (
              <LetterSection
                key={letter}
                letter={letter}
                searchQuery={debouncedSearchQuery}
                searchGroupWords={searchGroupWords}
                isCollapsed={isCollapsed}
                toggleCollapse={() => toggleLetterCollapse(letter)}
                vocabList={vocabList}
                expandedWord={expandedWord}
                setExpandedWord={setExpandedWord}
                createVocabMutation={createVocabMutation}
                handleSaveToLogs={handleSaveToLogs}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

interface LetterSectionProps {
  letter: string
  searchQuery: string
  searchGroupWords: DictionaryWord[] | null
  isCollapsed: boolean
  toggleCollapse: () => void
  vocabList: VocabularyLog[]
  expandedWord: string | null
  setExpandedWord: (w: string | null) => void
  createVocabMutation: ReturnType<typeof useCreateVocabularyMutation>
  handleSaveToLogs: (wordObj: WordDetails) => Promise<void>
}

function LetterSection({
  letter,
  searchQuery,
  searchGroupWords,
  isCollapsed,
  toggleCollapse,
  vocabList,
  expandedWord,
  setExpandedWord,
  createVocabMutation,
  handleSaveToLogs,
}: LetterSectionProps) {
  const isSearchActive = searchQuery.trim().length > 0
  
  // Use React Query hook to load words for letter dynamically
  const { data: letterWords = [], isLoading } = useDictionaryByLetterQuery(
    letter,
    !isCollapsed && !isSearchActive
  )

  const groupWords = isSearchActive ? (searchGroupWords || []) : letterWords
  const hasFetched = isSearchActive ? true : (letterWords.length > 0 || !isLoading)

  const getLetterSubText = () => {
    if (isLoading && !isSearchActive) return "Loading..."
    const count = groupWords.length
    if (isSearchActive) {
      return `${count} ${count === 1 ? "Word" : "Words"} found`
    }
    return `${count} ${count === 1 ? "Word" : "Words"} loaded`
  }

  // Hide empty letter blocks during search
  if (isSearchActive && groupWords.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Collapsible Accordion Header */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="w-full flex items-center justify-between p-3 bg-secondary/20 hover:bg-secondary/45 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60 border border-border/40 rounded-xl transition-all duration-200 select-none cursor-pointer text-left shadow-sm active:scale-[0.995]"
      >
        <div className="flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center text-xs font-extrabold bg-primary text-primary-foreground rounded-lg shadow-glass shadow-glow uppercase select-none">
            {letter}
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {getLetterSubText()}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
            isCollapsed ? "" : "rotate-180 text-primary"
          }`}
        />
      </button>

      {/* Collapsible Grid Border Container */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border/40 bg-secondary/10 p-5 shadow-sm mt-1">
              {isLoading && !isSearchActive ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2.5">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  <span className="text-xs font-semibold text-muted-foreground">Loading words starting with {letter}...</span>
                </div>
              ) : hasFetched && groupWords.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border/40 rounded-xl space-y-1.5 bg-secondary/5">
                  <BookOpen className="h-6 w-6 text-muted-foreground/30 mx-auto" />
                  <h4 className="text-xs font-bold text-foreground">No words found</h4>
                  <p className="text-[10px] text-muted-foreground">No dictionary definitions match this letter.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {groupWords.map((item) => (
                    <WordCard
                      key={item.word}
                      item={item}
                      vocabList={vocabList}
                      expandedWord={expandedWord}
                      setExpandedWord={setExpandedWord}
                      createVocabMutation={createVocabMutation}
                      handleSaveToLogs={handleSaveToLogs}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function WordCard({
  item,
  vocabList,
  expandedWord,
  setExpandedWord,
  createVocabMutation,
  handleSaveToLogs,
}: {
  item: DictionaryWord
  vocabList: VocabularyLog[]
  expandedWord: string | null
  setExpandedWord: (w: string | null) => void
  createVocabMutation: ReturnType<typeof useCreateVocabularyMutation>
  handleSaveToLogs: (wordObj: WordDetails) => Promise<void>
}) {
  const isExpanded = expandedWord === item.word

  // Use React Query to lazy-load details when expanded
  const { data: details, isLoading } = useDictionaryWordDetailsQuery(
    item.word,
    isExpanded
  )

  const isAlreadySaved = vocabList.some(
    (v) => v.word.trim().toLowerCase() === item.word.trim().toLowerCase()
  )

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isExpanded
          ? "border-primary/45 bg-secondary/15 shadow-glass col-span-full sm:col-span-full lg:col-span-full"
          : "border-border/60 bg-card/40 hover:bg-card/75 hover:border-primary/20 hover:shadow-sm"
      }`}
    >
      {/* Main Header / Clickable Toggle */}
      <div
        onClick={() => setExpandedWord(isExpanded ? null : item.word)}
        className="p-5 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shadow-inner">
            {item.word.charAt(0)}
          </div>
          <span className="text-md font-bold text-foreground capitalize tracking-tight">
            {item.word}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isAlreadySaved && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookMarked className="h-3 w-3" /> Saved
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
              isExpanded ? "rotate-180 text-primary" : ""
            }`}
          />
        </div>
      </div>

      {/* Expanded Detail Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-t border-border/40 bg-card/20"
          >
            <div className="p-5 space-y-5">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 gap-2">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  <span className="text-xs font-semibold text-muted-foreground">Fetching meanings and translations...</span>
                </div>
              ) : details ? (
                <div className="space-y-4">
                  {/* Indonesian Translation */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block">
                      Indonesian Meaning
                    </span>

                    <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-primary block select-none mb-0.5">
                        Translation
                      </span>
                      <span className="text-base font-extrabold text-foreground">
                        {details.translation}
                      </span>
                    </div>
                  </div>

                  {/* Part of speech & Definition */}
                  {(details.partOfSpeech || details.definition) && (
                    <div className="space-y-2 border-t border-border/30 pt-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block">
                        Dictionary Definition
                      </span>
                      <div className="flex flex-wrap items-baseline gap-2">
                        {details.partOfSpeech && (
                          <span className="inline-block px-2 py-0.5 rounded bg-secondary text-[10px] font-bold text-muted-foreground capitalize">
                            {details.partOfSpeech}
                          </span>
                        )}
                        {details.definition && (
                          <span className="text-xs text-foreground leading-relaxed">
                            {details.definition}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Alternative Translations */}
                  {details.alternativeTranslations && details.alternativeTranslations.length > 0 && (
                    <div className="space-y-2 border-t border-border/30 pt-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block">
                        Alternative Translations
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {details.alternativeTranslations.map((alt, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-secondary/30 px-2.5 py-1 rounded-lg text-xs">
                            <span className="font-bold text-[9px] uppercase text-muted-foreground select-none">
                              {alt.partOfSpeech}:
                            </span>
                            <span className="text-foreground font-semibold">
                              {alt.translations.join(", ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Row */}
                  <div className="flex justify-end border-t border-border/30 pt-4 mt-2">
                    {isAlreadySaved ? (
                      <button
                        type="button"
                        disabled
                        className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1.5 text-xs font-bold flex items-center gap-1 shadow-sm select-none"
                      >
                        <Check className="h-4.5 w-4.5 stroke-[3]" /> Saved to Logs
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSaveToLogs(details)}
                        disabled={createVocabMutation.isPending}
                        className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-[1.02] shadow-sm select-none cursor-pointer"
                      >
                        {createVocabMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-4.5 w-4.5 stroke-[2.5]" /> Save to Logs
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs font-semibold text-destructive">
                  Failed to load details.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
