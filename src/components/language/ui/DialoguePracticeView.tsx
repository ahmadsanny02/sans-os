"use client"

import React, { useRef, useEffect } from "react"
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
  dialogueFormError: string | null
  revealedDialogueTranslationIds: Record<string, boolean>
  handleSelectDialogueVocab: (id: string, word: string) => void
  handleAddDialogue: (e: React.FormEvent) => Promise<void>
  handleDeleteDialogue: (id: string, wordStr: string) => Promise<void>
  toggleDialogueTranslation: (id: string) => void
  revealAllDialogueTranslations: () => void
  hideAllDialogueTranslations: () => void
  filteredDialogueVocabList: VocabularyLog[]
  filteredDialogues: DialogueLog[]
  dialogueCreatePending: boolean
  dialogueDeletePending: boolean
}

export function DialoguePracticeView({
  vocabList,
  isLoading,
  isError,
  showDialogueForm,
  setShowDialogueForm,
  searchQueryDialogue,
  setSearchQueryDialogue,
  selectedDialogueVocabId,
  setSelectedDialogueVocabId,
  searchDialogueVocabQuery,
  setSearchDialogueVocabQuery,
  showDialogueVocabDropdown,
  setShowDialogueVocabDropdown,
  dialogueEngQ,
  setDialogueEngQ,
  dialogueTransQ,
  setDialogueTransQ,
  dialogueEngA,
  setDialogueEngA,
  dialogueTransA,
  setDialogueTransA,
  dialogueFormError,
  revealedDialogueTranslationIds,
  handleSelectDialogueVocab,
  handleAddDialogue,
  handleDeleteDialogue,
  toggleDialogueTranslation,
  revealAllDialogueTranslations,
  hideAllDialogueTranslations,
  filteredDialogueVocabList,
  filteredDialogues,
  dialogueCreatePending,
}: DialoguePracticeViewProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-5 select-none">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQueryDialogue}
              onChange={(e) => setSearchQueryDialogue(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-border bg-card/60 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-sidebar-primary"
            />
          </div>

          {/* Study Reveal Actions */}
          <div className="flex items-center gap-1.5 bg-secondary/40 border border-border/80 p-1 rounded-xl shrink-0 self-start sm:self-auto select-none">
            <button
              onClick={revealAllDialogueTranslations}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
              title="Reveal all dialogue translations"
            >
              <Eye className="h-3.5 w-3.5" /> Reveal All
            </button>
            <button
              onClick={hideAllDialogueTranslations}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
              title="Hide all dialogue translations"
            >
              <EyeOff className="h-3.5 w-3.5" /> Hide All
            </button>
          </div>
        </div>

        {/* Toggle Dialogue Form Button */}
        <button
          onClick={() => setShowDialogueForm(!showDialogueForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-sidebar-primary px-3.5 py-2 text-xs font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/90 hover:scale-[1.02] self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          {showDialogueForm ? "Cancel Add" : "Add Dialogue"}
        </button>
      </div>

      {/* 2. Dialogue Form Card (Only visible if showDialogueForm is true) */}
      {showDialogueForm && (
        <div className="rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm backdrop-blur-md animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-violet-500" />
            <h3 className="text-lg font-bold text-foreground">Add Conversation</h3>
          </div>

          <form onSubmit={handleAddDialogue} className="space-y-4">
            {/* Searchable autocomplete select */}
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
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-all focus:border-sidebar-primary focus:ring-2 focus:ring-sidebar-primary/10"
                    />
                    {selectedDialogueVocabId && (
                      <span 
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" 
                        title="Vocabulary Word Selected" 
                      />
                    )}
                  </div>

                  {showDialogueVocabDropdown && (
                    <div className="absolute z-30 w-full mt-1.5 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in slide-in-from-top-1 duration-150">
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
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between ${
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

            {/* English & Translation inputs wrapper */}
            <div className="grid gap-6 sm:grid-cols-2">
              
              {/* USER A: Question Form Inputs */}
              <div className="space-y-3 border-l-2 border-violet-500 pl-3.5 py-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center text-[10px] font-bold">
                    Q
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-500">
                    User A (Question)
                  </span>
                </div>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={dialogueEngQ}
                    onChange={(e) => setDialogueEngQ(e.target.value)}
                    placeholder="English question (e.g., What are you doing?)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-sidebar-primary"
                  />
                  <input
                    type="text"
                    required
                    value={dialogueTransQ}
                    onChange={(e) => setDialogueTransQ(e.target.value)}
                    placeholder="Indonesian translation (e.g., Apa yang sedang kamu lakukan?)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-sidebar-primary"
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
                    value={dialogueEngA}
                    onChange={(e) => setDialogueEngA(e.target.value)}
                    placeholder="English answer (e.g., I am reading a book.)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-sidebar-primary"
                  />
                  <input
                    type="text"
                    required
                    value={dialogueTransA}
                    onChange={(e) => setDialogueTransA(e.target.value)}
                    placeholder="Indonesian translation (e.g., Saya sedang membaca buku.)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none transition-all focus:border-sidebar-primary"
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
                className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={dialogueCreatePending || !selectedDialogueVocabId || vocabList.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sidebar-primary px-3.5 py-1.5 text-xs font-semibold text-sidebar-primary-foreground shadow-sm transition-all hover:bg-sidebar-primary/95 disabled:opacity-50"
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
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <GridCardSkeleton key={idx} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 text-sm font-semibold text-destructive">
            <AlertCircle className="h-6 w-6" />
            <span>Error loading dialogue logs. Please reload the page.</span>
          </div>
        ) : filteredDialogues.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground bg-card/10 select-none animate-in fade-in duration-200">
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
                <Sparkles className="mx-auto h-8 w-8 text-violet-500/60 mb-2 animate-pulse" />
                <p className="font-bold">No conversation practices yet</p>
                <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs mx-auto">
                  Click &quot;Add Dialogue&quot; above and write a Q&A conversation practice to get started.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            {filteredDialogues.map((log) => {
              const isRevealed = !!revealedDialogueTranslationIds[log.id]
              return (
                <div
                  key={log.id}
                  className="group rounded-2xl border border-border bg-card/45 dark:bg-card/20 p-5 shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-md relative"
                >
                  {/* Log Header Actions */}
                  <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        {log.vocabWord}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleDialogueTranslation(log.id)}
                        title={isRevealed ? "Hide translations" : "Reveal translations"}
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                      >
                        {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteDialogue(log.id, log.vocabWord)}
                        title="Delete dialogue log"
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Chat Bubble Conversational Script */}
                  <div className="space-y-4">
                    
                    {/* Speaker A (User A, Q) Bubble - Left Aligned */}
                    <div className="flex flex-col items-start space-y-1 max-w-[85%]">
                      <div className="flex items-center gap-1.5 ml-1">
                        <span className="text-[10px] font-extrabold text-violet-500 uppercase tracking-wide">
                          User A
                        </span>
                      </div>
                      <div className="bg-violet-500/[0.07] dark:bg-violet-500/[0.12] border border-violet-500/15 rounded-2xl rounded-tl-none px-4 py-3 text-left">
                        <p className="text-sm font-semibold text-foreground leading-relaxed">
                          {log.englishQuestion}
                        </p>
                        {isRevealed && (
                          <div className="mt-2.5 pt-2 border-t border-violet-500/10 dark:border-violet-500/20 space-y-2 animate-in fade-in duration-200">
                            <div>
                              <span className="text-[8px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-0.5">
                                Manual Translation
                              </span>
                              <p className="text-xs text-muted-foreground italic font-semibold">
                                {log.indonesianQuestion}
                              </p>
                            </div>
                            {log.autoTranslationQuestion && (
                              <div className="border-t border-dotted border-violet-500/10 dark:border-violet-500/20 pt-1">
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

                    {/* Speaker B (User B, A) Bubble - Right Aligned */}
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
        )}
      </div>

    </div>
  )
}
