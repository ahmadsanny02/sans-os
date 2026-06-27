"use client"

import React, { useState } from "react"
import {
  useVocabularyQuery,
  useCreateVocabularyMutation,
  useUpdateVocabularyMutation,
  useDeleteVocabularyMutation,
  useWritingQuery,
  useCreateWritingMutation,
  useDeleteWritingMutation,
  useDialogueQuery,
  useCreateDialogueMutation,
  useDeleteDialogueMutation,
} from "@/hooks/useLanguage"
import { confirmDestructive, showError, showSuccessToast } from "@/lib/sweetalert"

export function useLanguagePage() {
  const { data: vocabList = [], isLoading: vocabIsLoading, isError: vocabIsError } = useVocabularyQuery()
  const { data: writingList = [], isLoading: writingIsLoading, isError: writingIsError } = useWritingQuery()
  const { data: dialogueList = [], isLoading: dialogueIsLoading, isError: dialogueIsError } = useDialogueQuery()

  const createVocabMutation = useCreateVocabularyMutation()
  const updateVocabularyMutation = useUpdateVocabularyMutation()
  const deleteVocabMutation = useDeleteVocabularyMutation()

  const createWritingMutation = useCreateWritingMutation()
  const deleteWritingMutation = useDeleteWritingMutation()

  const createDialogueMutation = useCreateDialogueMutation()
  const deleteDialogueMutation = useDeleteDialogueMutation()

  // Tab switching state
  const [activeTab, setActiveTab] = useState<"vocab" | "writing" | "dialogue">("vocab")

  // ==========================================
  // Vocabulary States
  // ==========================================
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [memorizedFilter, setMemorizedFilter] = useState<"all" | "memorized" | "unmemorized">("all")
  const [revealedTranslationIds, setRevealedTranslationIds] = useState<Record<string, boolean>>({})

  // Vocab form fields
  const [word, setWord] = useState("")
  const [translation, setTranslation] = useState("")
  const [langDirection, setLangDirection] = useState("en-id")
  const [formError, setFormError] = useState<string | null>(null)

  // ==========================================
  // Writing Practice States
  // ==========================================
  const [showWritingForm, setShowWritingForm] = useState(false)
  const [practiceMode, setPracticeMode] = useState<"free" | "vocab">("free")
  const [activeHistoryTab, setActiveHistoryTab] = useState<"vocab" | "free">("vocab")
  const [searchQueryWriting, setSearchQueryWriting] = useState("")

  // Autocomplete search vocab for writing
  const [selectedVocabId, setSelectedVocabId] = useState("")
  const [searchVocabQuery, setSearchVocabQuery] = useState("")
  const [showVocabDropdown, setShowVocabDropdown] = useState(false)

  // Free writing form
  const [freeEnglish, setFreeEnglish] = useState("")
  const [freeTranslation, setFreeTranslation] = useState("")

  // Vocab-based writing forms
  const [vocabEngPos, setVocabEngPos] = useState("")
  const [vocabTransPos, setVocabTransPos] = useState("")
  const [vocabEngNeg, setVocabEngNeg] = useState("")
  const [vocabTransNeg, setVocabTransNeg] = useState("")
  const [vocabEngInt, setVocabEngInt] = useState("")
  const [vocabTransInt, setVocabTransInt] = useState("")

  const [writingFormError, setWritingFormError] = useState<string | null>(null)

  // ==========================================
  // Dialogue Practice States
  // ==========================================
  const [showDialogueForm, setShowDialogueForm] = useState(false)
  const [searchQueryDialogue, setSearchQueryDialogue] = useState("")
  const [selectedDialogueVocabId, setSelectedDialogueVocabId] = useState("")
  const [searchDialogueVocabQuery, setSearchDialogueVocabQuery] = useState("")
  const [showDialogueVocabDropdown, setShowDialogueVocabDropdown] = useState(false)

  // Dialogue Q&A fields
  const [dialogueEngQ, setDialogueEngQ] = useState("")
  const [dialogueTransQ, setDialogueTransQ] = useState("")
  const [dialogueEngA, setDialogueEngA] = useState("")
  const [dialogueTransA, setDialogueTransA] = useState("")
  const [dialogueFormError, setDialogueFormError] = useState<string | null>(null)

  // Study reveal aids
  const [revealedDialogueTranslationIds, setRevealedDialogueTranslationIds] = useState<Record<string, boolean>>({})

  // ==========================================
  // Vocabulary Handlers
  // ==========================================
  const handleAddVocabulary = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setFormError(null)

    const trimmedWord = word.trim()
    const trimmedTranslation = translation.trim()

    if (!trimmedWord || !trimmedTranslation) {
      setFormError("Please fill out all required fields.")
      return
    }

    // Client-side uniqueness check (case-insensitive & trimmed)
    const normalizedWord = trimmedWord.toLowerCase()
    const isDuplicate = vocabList.some(
      (v) => v.word.trim().toLowerCase() === normalizedWord
    )

    if (isDuplicate) {
      setFormError("This vocabulary word is already registered.")
      return
    }

    try {
      await createVocabMutation.mutateAsync({
        word: trimmedWord,
        definition: "n/a",
        translation: trimmedTranslation,
        masteryLevel: 3,
        langDirection: langDirection,
      })
      setWord("")
      setTranslation("")
      setLangDirection("en-id")
      setShowAddForm(false)
      showSuccessToast("Vocabulary added successfully")
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to add vocabulary log."
      setFormError(errMsg)
    }
  }

  const handleDeleteVocabulary = async (id: string, wordStr: string): Promise<void> => {
    const isConfirmed = await confirmDestructive(
      "Delete Vocabulary",
      `Are you sure you want to delete the word "${wordStr}"?`
    )
    if (!isConfirmed) return
    try {
      await deleteVocabMutation.mutateAsync(id)
      showSuccessToast("Vocabulary deleted successfully")
    } catch {
      showError("Delete Error", "Failed to delete vocabulary log.")
    }
  }

  const handleToggleMemorized = (id: string, currentMemorized: boolean): void => {
    updateVocabularyMutation.mutate({ id, memorized: !currentMemorized })
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

  // Vocab metrics
  const totalWords = vocabList.length
  const memorizedCount = vocabList.filter((v) => v.memorized).length
  const memorizedPercentage = totalWords > 0 ? Math.round((memorizedCount / totalWords) * 100) : 0

  // Filtered vocab list
  const filteredVocab = vocabList.filter((v) => {
    const matchesQuery =
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.translation.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesMemorized =
      memorizedFilter === "all" ||
      (memorizedFilter === "memorized" && v.memorized) ||
      (memorizedFilter === "unmemorized" && !v.memorized)

    return matchesQuery && matchesMemorized
  })

  // ==========================================
  // Writing Handlers
  // ==========================================
  const handleAddWriting = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setWritingFormError(null)

    if (practiceMode === "free") {
      if (!freeEnglish.trim() || !freeTranslation.trim()) {
        setWritingFormError("Please fill out both English sentence and translation.")
        return
      }

      try {
        await createWritingMutation.mutateAsync({
          vocabId: null,
          vocabWord: null,
          sentenceType: null,
          englishSentence: freeEnglish.trim(),
          indonesianTranslation: freeTranslation.trim(),
        })
        setFreeEnglish("")
        setFreeTranslation("")
        setShowWritingForm(false)
        showSuccessToast("Free writing log added successfully")
      } catch {
        setWritingFormError("Failed to add writing log.")
      }
    } else {
      if (!selectedVocabId) {
        setWritingFormError("Please select a vocabulary word.")
        return
      }

      if (
        !vocabEngPos.trim() || !vocabTransPos.trim() ||
        !vocabEngNeg.trim() || !vocabTransNeg.trim() ||
        !vocabEngInt.trim() || !vocabTransInt.trim()
      ) {
        setWritingFormError("Please write sentences and translations for all three types (Positive, Negative, and Interrogative).")
        return
      }

      const selectedVocabObj = vocabList.find((v) => v.id === selectedVocabId)
      if (!selectedVocabObj) {
        setWritingFormError("Selected vocabulary word not found.")
        return
      }

      try {
        await Promise.all([
          createWritingMutation.mutateAsync({
            vocabId: selectedVocabObj.id,
            vocabWord: selectedVocabObj.word,
            sentenceType: "Positive",
            englishSentence: vocabEngPos.trim(),
            indonesianTranslation: vocabTransPos.trim(),
          }),
          createWritingMutation.mutateAsync({
            vocabId: selectedVocabObj.id,
            vocabWord: selectedVocabObj.word,
            sentenceType: "Negative",
            englishSentence: vocabEngNeg.trim(),
            indonesianTranslation: vocabTransNeg.trim(),
          }),
          createWritingMutation.mutateAsync({
            vocabId: selectedVocabObj.id,
            vocabWord: selectedVocabObj.word,
            sentenceType: "Interrogative",
            englishSentence: vocabEngInt.trim(),
            indonesianTranslation: vocabTransInt.trim(),
          }),
        ])

        setVocabEngPos("")
        setVocabTransPos("")
        setVocabEngNeg("")
        setVocabTransNeg("")
        setVocabEngInt("")
        setVocabTransInt("")
        setWritingFormError(null)
        setShowWritingForm(false)
        showSuccessToast("Vocab practice sentences added successfully")
      } catch {
        setWritingFormError("Failed to save some or all sentences. Please try again.")
      }
    }
  }

  const handleDeleteWriting = async (id: string): Promise<void> => {
    const isConfirmed = await confirmDestructive(
      "Delete Writing Log",
      "Are you sure you want to delete this writing practice log?"
    )
    if (!isConfirmed) return

    try {
      await deleteWritingMutation.mutateAsync(id)
      showSuccessToast("Writing log deleted successfully")
    } catch {
      showError("Delete Error", "Failed to delete writing log.")
    }
  }

  const handleSelectVocab = (id: string, word: string) => {
    setSelectedVocabId(id)
    setSearchVocabQuery(word)
    setShowVocabDropdown(false)
    setWritingFormError(null)
  }

  // Auto-complete filtered list
  const filteredVocabList = vocabList.filter(
    (v) =>
      v.word.toLowerCase().includes(searchVocabQuery.toLowerCase()) ||
      v.translation.toLowerCase().includes(searchVocabQuery.toLowerCase())
  )

  // Separated writing logs lists
  const vocabWritingLogs = writingList.filter((log) => log.vocabId !== null)
  const freeWritingLogs = writingList.filter((log) => log.vocabId === null)

  // Search filter matching on active history list
  const activeHistoryList = activeHistoryTab === "vocab" ? vocabWritingLogs : freeWritingLogs
  const filteredHistory = activeHistoryList.filter((log) => {
    const matchesSearch =
      log.englishSentence.toLowerCase().includes(searchQueryWriting.toLowerCase()) ||
      log.indonesianTranslation.toLowerCase().includes(searchQueryWriting.toLowerCase()) ||
      (log.vocabWord && log.vocabWord.toLowerCase().includes(searchQueryWriting.toLowerCase()))
    return matchesSearch
  })

  // ==========================================
  // Dialogue Handlers
  // ==========================================
  const handleSelectDialogueVocab = (id: string, word: string) => {
    setSelectedDialogueVocabId(id)
    setSearchDialogueVocabQuery(word)
    setShowDialogueVocabDropdown(false)
    setDialogueFormError(null)
  }

  const handleAddDialogue = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setDialogueFormError(null)

    if (!selectedDialogueVocabId) {
      setDialogueFormError("Please select a vocabulary word.")
      return
    }

    if (
      !dialogueEngQ.trim() || !dialogueTransQ.trim() ||
      !dialogueEngA.trim() || !dialogueTransA.trim()
    ) {
      setDialogueFormError("Please fill out all Question and Answer fields.")
      return
    }

    const selectedVocab = vocabList.find((v) => v.id === selectedDialogueVocabId)
    if (!selectedVocab) {
      setDialogueFormError("Selected vocabulary word not found.")
      return
    }

    try {
      await createDialogueMutation.mutateAsync({
        vocabId: selectedVocab.id,
        vocabWord: selectedVocab.word,
        englishQuestion: dialogueEngQ.trim(),
        indonesianQuestion: dialogueTransQ.trim(),
        englishAnswer: dialogueEngA.trim(),
        indonesianAnswer: dialogueTransA.trim(),
      })

      // Reset form
      setSelectedDialogueVocabId("")
      setSearchDialogueVocabQuery("")
      setDialogueEngQ("")
      setDialogueTransQ("")
      setDialogueEngA("")
      setDialogueTransA("")
      setShowDialogueForm(false)
      showSuccessToast("Dialogue added successfully")
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to add dialogue."
      setDialogueFormError(errMsg)
    }
  }

  const handleDeleteDialogue = async (id: string, wordStr: string): Promise<void> => {
    const isConfirmed = await confirmDestructive(
      "Delete Dialogue",
      `Are you sure you want to delete the dialogue practicing "${wordStr}"?`
    )
    if (!isConfirmed) return

    try {
      await deleteDialogueMutation.mutateAsync(id)
      showSuccessToast("Dialogue deleted successfully")
    } catch {
      showError("Delete Error", "Failed to delete dialogue.")
    }
  }

  const toggleDialogueTranslation = (id: string) => {
    setRevealedDialogueTranslationIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const revealAllDialogueTranslations = () => {
    const allIds: Record<string, boolean> = {}
    dialogueList.forEach((d) => {
      allIds[d.id] = true
    })
    setRevealedDialogueTranslationIds(allIds)
  }

  const hideAllDialogueTranslations = () => {
    setRevealedDialogueTranslationIds({})
  }

  // Dialogue filter and autocomplete lists
  const filteredDialogueVocabList = vocabList.filter(
    (v) =>
      v.word.toLowerCase().includes(searchDialogueVocabQuery.toLowerCase()) ||
      v.translation.toLowerCase().includes(searchDialogueVocabQuery.toLowerCase())
  )

  const filteredDialogues = dialogueList.filter((log) => {
    const matchesSearch =
      log.vocabWord.toLowerCase().includes(searchQueryDialogue.toLowerCase()) ||
      log.englishQuestion.toLowerCase().includes(searchQueryDialogue.toLowerCase()) ||
      log.indonesianQuestion.toLowerCase().includes(searchQueryDialogue.toLowerCase()) ||
      log.englishAnswer.toLowerCase().includes(searchQueryDialogue.toLowerCase()) ||
      log.indonesianAnswer.toLowerCase().includes(searchQueryDialogue.toLowerCase())
    return matchesSearch
  })

  return {
    activeTab,
    setActiveTab,

    // Vocabulary States
    vocabList,
    vocabIsLoading,
    vocabIsError,
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
    vocabCreatePending: createVocabMutation.isPending,
    vocabDeletePending: deleteVocabMutation.isPending,
    langDirection,
    setLangDirection,

    // Writing Practice States
    showWritingForm,
    setShowWritingForm,
    writingList,
    writingIsLoading,
    writingIsError,
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
    freeEnglish,
    setFreeEnglish,
    freeTranslation,
    setFreeTranslation,
    vocabEngPos,
    setVocabEngPos,
    vocabTransPos,
    setVocabTransPos,
    vocabEngNeg,
    setVocabEngNeg,
    vocabTransNeg,
    setVocabTransNeg,
    vocabEngInt,
    setVocabEngInt,
    vocabTransInt,
    setVocabTransInt,
    writingFormError,
    handleAddWriting,
    handleDeleteWriting,
    handleSelectVocab,
    filteredVocabList,
    vocabWritingLogs,
    freeWritingLogs,
    filteredHistory,
    writingCreatePending: createWritingMutation.isPending,
    writingDeletePending: deleteWritingMutation.isPending,

    // Dialogue States & Handlers
    dialogueList,
    dialogueIsLoading,
    dialogueIsError,
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
    dialogueCreatePending: createDialogueMutation.isPending,
    dialogueDeletePending: deleteDialogueMutation.isPending,
  }
}

export type UseLanguagePageReturn = ReturnType<typeof useLanguagePage>
