"use client"

import React, { useState, useMemo, useCallback } from "react"
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
  WritingLog,
  GroupedWritingLog,
} from "@/hooks/useLanguage"
import { confirmDestructive, showError, showSuccessToast } from "@/lib/sweetalert"

function groupVocabWritingLogs(logs: WritingLog[]): GroupedWritingLog[] {
  const sorted = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const groups: GroupedWritingLog[] = []

  sorted.forEach((log) => {
    if (log.sentenceType === null) return

    const logTime = new Date(log.createdAt).getTime()
    const matchingGroup = groups.find((g) => {
      // Group by formula if both have formula
      if (log.formula && g.formula === log.formula) {
        const groupTime = new Date(g.createdAt).getTime()
        return Math.abs(groupTime - logTime) < 60000
      }
      // Group by vocabId if both have vocabId and no formula
      if (!log.formula && !g.formula && log.vocabId && g.vocabId === log.vocabId) {
        const groupTime = new Date(g.createdAt).getTime()
        return Math.abs(groupTime - logTime) < 60000
      }
      return false
    })

    if (matchingGroup) {
      matchingGroup.allIds.push(log.id)
      if (log.sentenceType === "Positive") {
        matchingGroup.positive = log
      } else if (log.sentenceType === "Negative") {
        matchingGroup.negative = log
      } else if (log.sentenceType === "Interrogative") {
        matchingGroup.interrogative = log
      }
      if (new Date(log.createdAt).getTime() > new Date(matchingGroup.createdAt).getTime()) {
        matchingGroup.createdAt = log.createdAt
      }
    } else {
      groups.push({
        id: (log.formula || log.vocabId || "unknown") + "_" + log.createdAt,
        vocabId: log.vocabId,
        vocabWord: log.vocabWord,
        formula: log.formula,
        createdAt: log.createdAt,
        positive: log.sentenceType === "Positive" ? log : undefined,
        negative: log.sentenceType === "Negative" ? log : undefined,
        interrogative: log.sentenceType === "Interrogative" ? log : undefined,
        allIds: [log.id],
      })
    }
  })

  return groups
}

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
  const [activeTab, setActiveTab] = useState<"vocab" | "writing" | "dialogue" | "dictionary">("vocab")

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
  const [practiceMode, setPracticeMode] = useState<"free" | "vocab" | "formula">("free")
  const [activeHistoryTab, setActiveHistoryTab] = useState<"vocab" | "free" | "formula">("vocab")
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
  const [vocabFormula, setVocabFormula] = useState("")

  const [writingFormError, setWritingFormError] = useState<string | null>(null)

  // ==========================================
  // Dialogue Practice States
  // ==========================================
  const [showDialogueForm, setShowDialogueForm] = useState(false)
  const [dialoguePracticeMode, setDialoguePracticeMode] = useState<"vocab" | "formula">("vocab")
  const [dialogueActiveHistoryTab, setDialogueActiveHistoryTab] = useState<"vocab" | "formula">("vocab")
  const [searchQueryDialogue, setSearchQueryDialogue] = useState("")
  const [selectedDialogueVocabId, setSelectedDialogueVocabId] = useState("")
  const [searchDialogueVocabQuery, setSearchDialogueVocabQuery] = useState("")
  const [showDialogueVocabDropdown, setShowDialogueVocabDropdown] = useState(false)

  // Dialogue Q&A fields
  const [dialogueEngQ, setDialogueEngQ] = useState("")
  const [dialogueTransQ, setDialogueTransQ] = useState("")
  const [dialogueEngA, setDialogueEngA] = useState("")
  const [dialogueTransA, setDialogueTransA] = useState("")
  const [dialogueFormula, setDialogueFormula] = useState("")
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

  const handleDeleteVocabulary = useCallback(async (id: string, wordStr: string): Promise<void> => {
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
  }, [deleteVocabMutation])

  const handleToggleMemorized = useCallback((id: string, currentMemorized: boolean): void => {
    updateVocabularyMutation.mutate({ id, memorized: !currentMemorized })
  }, [updateVocabularyMutation])

  const toggleRevealTranslation = useCallback((id: string): void => {
    setRevealedTranslationIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

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
  const { totalWords, memorizedCount, memorizedPercentage } = useMemo(() => {
    const total = vocabList.length
    const memorized = vocabList.filter((v) => v.memorized).length
    const percentage = total > 0 ? Math.round((memorized / total) * 100) : 0
    return { totalWords: total, memorizedCount: memorized, memorizedPercentage: percentage }
  }, [vocabList])

  // Filtered vocab list
  const filteredVocab = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return vocabList.filter((v) => {
      const matchesQuery =
        v.word.toLowerCase().includes(q) ||
        v.translation.toLowerCase().includes(q)
      
      const matchesMemorized =
        memorizedFilter === "all" ||
        (memorizedFilter === "memorized" && v.memorized) ||
        (memorizedFilter === "unmemorized" && !v.memorized)

      return matchesQuery && matchesMemorized
    })
  }, [vocabList, searchQuery, memorizedFilter])

  // ==========================================
  // Writing Handlers
  // ==========================================
  const handleAddWriting = async (
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
      vocabFormula?: string
    }
  ): Promise<void> => {
    e.preventDefault()
    setWritingFormError(null)

    const activeFreeEnglish = formData?.freeEnglish ?? freeEnglish
    const activeFreeTranslation = formData?.freeTranslation ?? freeTranslation
    const activeVocabEngPos = formData?.vocabEngPos ?? vocabEngPos
    const activeVocabTransPos = formData?.vocabTransPos ?? vocabTransPos
    const activeVocabEngNeg = formData?.vocabEngNeg ?? vocabEngNeg
    const activeVocabTransNeg = formData?.vocabTransNeg ?? vocabTransNeg
    const activeVocabEngInt = formData?.vocabEngInt ?? vocabEngInt
    const activeVocabTransInt = formData?.vocabTransInt ?? vocabTransInt
    const activeVocabFormula = formData?.vocabFormula ?? vocabFormula

    if (practiceMode === "free") {
      if (!activeFreeEnglish.trim() || !activeFreeTranslation.trim()) {
        setWritingFormError("Please fill out both English sentence and translation.")
        return
      }

      try {
        await createWritingMutation.mutateAsync({
          vocabId: null,
          vocabWord: null,
          sentenceType: null,
          englishSentence: activeFreeEnglish.trim(),
          indonesianTranslation: activeFreeTranslation.trim(),
        })
        setFreeEnglish("")
        setFreeTranslation("")
        setShowWritingForm(false)
        showSuccessToast("Free writing log added successfully")
      } catch {
        setWritingFormError("Failed to add writing log.")
      }
    } else if (practiceMode === "vocab") {
      if (!selectedVocabId) {
        setWritingFormError("Please select a vocabulary word.")
        return
      }

      if (
        !activeVocabEngPos.trim() || !activeVocabTransPos.trim() ||
        !activeVocabEngNeg.trim() || !activeVocabTransNeg.trim() ||
        !activeVocabEngInt.trim() || !activeVocabTransInt.trim()
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
            englishSentence: activeVocabEngPos.trim(),
            indonesianTranslation: activeVocabTransPos.trim(),
          }),
          createWritingMutation.mutateAsync({
            vocabId: selectedVocabObj.id,
            vocabWord: selectedVocabObj.word,
            sentenceType: "Negative",
            englishSentence: activeVocabEngNeg.trim(),
            indonesianTranslation: activeVocabTransNeg.trim(),
          }),
          createWritingMutation.mutateAsync({
            vocabId: selectedVocabObj.id,
            vocabWord: selectedVocabObj.word,
            sentenceType: "Interrogative",
            englishSentence: activeVocabEngInt.trim(),
            indonesianTranslation: activeVocabTransInt.trim(),
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
    } else {
      // practiceMode === "formula"
      if (!activeVocabFormula.trim()) {
        setWritingFormError("Please write the formula / rumus.")
        return
      }

      if (
        !activeVocabEngPos.trim() || !activeVocabTransPos.trim() ||
        !activeVocabEngNeg.trim() || !activeVocabTransNeg.trim() ||
        !activeVocabEngInt.trim() || !activeVocabTransInt.trim()
      ) {
        setWritingFormError("Please write sentences and translations for all three types (Positive, Negative, and Interrogative).")
        return
      }

      const selectedVocabObj = selectedVocabId
        ? vocabList.find((v) => v.id === selectedVocabId)
        : null

      try {
        await Promise.all([
          createWritingMutation.mutateAsync({
            vocabId: selectedVocabObj?.id || null,
            vocabWord: selectedVocabObj?.word || null,
            sentenceType: "Positive",
            englishSentence: activeVocabEngPos.trim(),
            indonesianTranslation: activeVocabTransPos.trim(),
            formula: activeVocabFormula.trim(),
          }),
          createWritingMutation.mutateAsync({
            vocabId: selectedVocabObj?.id || null,
            vocabWord: selectedVocabObj?.word || null,
            sentenceType: "Negative",
            englishSentence: activeVocabEngNeg.trim(),
            indonesianTranslation: activeVocabTransNeg.trim(),
            formula: activeVocabFormula.trim(),
          }),
          createWritingMutation.mutateAsync({
            vocabId: selectedVocabObj?.id || null,
            vocabWord: selectedVocabObj?.word || null,
            sentenceType: "Interrogative",
            englishSentence: activeVocabEngInt.trim(),
            indonesianTranslation: activeVocabTransInt.trim(),
            formula: activeVocabFormula.trim(),
          }),
        ])

        setVocabFormula("")
        setSelectedVocabId("")
        setSearchVocabQuery("")
        setVocabEngPos("")
        setVocabTransPos("")
        setVocabEngNeg("")
        setVocabTransNeg("")
        setVocabEngInt("")
        setVocabTransInt("")
        setWritingFormError(null)
        setShowWritingForm(false)
        showSuccessToast("Formula practice sentences added successfully")
      } catch {
        setWritingFormError("Failed to save some or all sentences. Please try again.")
      }
    }
  }

  const handleDeleteWriting = async (id: string): Promise<void> => {
    const isConfirmed = await confirmDestructive(
      "Delete Writing Log",
      "Are you sure you want to delete this writing practice?"
    )
    if (!isConfirmed) return

    try {
      await deleteWritingMutation.mutateAsync(id)
      showSuccessToast("Writing practice deleted successfully")
    } catch {
      showError("Delete Error", "Failed to delete writing practice.")
    }
  }

  const handleSelectVocab = (id: string, word: string) => {
    setSelectedVocabId(id)
    setSearchVocabQuery(word)
    setShowVocabDropdown(false)
    setWritingFormError(null)
  }

  // Auto-complete filtered list
  const filteredVocabList = useMemo(() => {
    const q = searchVocabQuery.toLowerCase()
    return vocabList.filter(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        v.translation.toLowerCase().includes(q)
    )
  }, [vocabList, searchVocabQuery])

  // Separated writing logs lists
  const { vocabWritingLogs, formulaWritingLogs, freeWritingLogs } = useMemo(() => {
    return {
      vocabWritingLogs: writingList.filter((log) => log.sentenceType !== null && !log.formula),
      formulaWritingLogs: writingList.filter((log) => log.sentenceType !== null && log.formula),
      freeWritingLogs: writingList.filter((log) => log.sentenceType === null),
    }
  }, [writingList])

  const groupedVocabLogs = useMemo(() => {
    return groupVocabWritingLogs(vocabWritingLogs)
  }, [vocabWritingLogs])

  const groupedFormulaLogs = useMemo(() => {
    return groupVocabWritingLogs(formulaWritingLogs)
  }, [formulaWritingLogs])

  // Search filter matching on active history list
  const filteredGroupedHistory = useMemo(() => {
    const q = searchQueryWriting.toLowerCase()
    return groupedVocabLogs.filter((group) => {
      return (
        (group.vocabWord && group.vocabWord.toLowerCase().includes(q)) ||
        (group.positive && (
          group.positive.englishSentence.toLowerCase().includes(q) ||
          group.positive.indonesianTranslation.toLowerCase().includes(q)
        )) ||
        (group.negative && (
          group.negative.englishSentence.toLowerCase().includes(q) ||
          group.negative.indonesianTranslation.toLowerCase().includes(q)
        )) ||
        (group.interrogative && (
          group.interrogative.englishSentence.toLowerCase().includes(q) ||
          group.interrogative.indonesianTranslation.toLowerCase().includes(q)
        ))
      )
    })
  }, [groupedVocabLogs, searchQueryWriting])

  const filteredFormulaHistory = useMemo(() => {
    const q = searchQueryWriting.toLowerCase()
    return groupedFormulaLogs.filter((group) => {
      return (
        (group.formula && group.formula.toLowerCase().includes(q)) ||
        (group.vocabWord && group.vocabWord.toLowerCase().includes(q)) ||
        (group.positive && (
          group.positive.englishSentence.toLowerCase().includes(q) ||
          group.positive.indonesianTranslation.toLowerCase().includes(q)
        )) ||
        (group.negative && (
          group.negative.englishSentence.toLowerCase().includes(q) ||
          group.negative.indonesianTranslation.toLowerCase().includes(q)
        )) ||
        (group.interrogative && (
          group.interrogative.englishSentence.toLowerCase().includes(q) ||
          group.interrogative.indonesianTranslation.toLowerCase().includes(q)
        ))
      )
    })
  }, [groupedFormulaLogs, searchQueryWriting])

  const filteredFreeHistory = useMemo(() => {
    const q = searchQueryWriting.toLowerCase()
    return freeWritingLogs.filter((log) => {
      const matchesSearch =
        log.englishSentence.toLowerCase().includes(q) ||
        log.indonesianTranslation.toLowerCase().includes(q)
      return matchesSearch
    })
  }, [freeWritingLogs, searchQueryWriting])

  // ==========================================
  // Dialogue Handlers
  // ==========================================
  const handleSelectDialogueVocab = (id: string, word: string) => {
    setSelectedDialogueVocabId(id)
    setSearchDialogueVocabQuery(word)
    setShowDialogueVocabDropdown(false)
    setDialogueFormError(null)
  }

  const handleAddDialogue = async (
    e: React.FormEvent,
    formData?: {
      dialogueEngQ?: string
      dialogueTransQ?: string
      dialogueEngA?: string
      dialogueTransA?: string
      dialogueFormula?: string
    }
  ): Promise<void> => {
    e.preventDefault()
    setDialogueFormError(null)

    const activeDialogueEngQ = formData?.dialogueEngQ ?? dialogueEngQ
    const activeDialogueTransQ = formData?.dialogueTransQ ?? dialogueTransQ
    const activeDialogueEngA = formData?.dialogueEngA ?? dialogueEngA
    const activeDialogueTransA = formData?.dialogueTransA ?? dialogueTransA
    const activeDialogueFormula = formData?.dialogueFormula ?? dialogueFormula

    if (
      !activeDialogueEngQ.trim() || !activeDialogueTransQ.trim() ||
      !activeDialogueEngA.trim() || !activeDialogueTransA.trim()
    ) {
      setDialogueFormError("Please fill out all Question and Answer fields.")
      return
    }

    if (dialoguePracticeMode === "vocab") {
      if (!selectedDialogueVocabId) {
        setDialogueFormError("Please select a vocabulary word.")
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
          englishQuestion: activeDialogueEngQ.trim(),
          indonesianQuestion: activeDialogueTransQ.trim(),
          englishAnswer: activeDialogueEngA.trim(),
          indonesianAnswer: activeDialogueTransA.trim(),
          formula: null,
        })

        // Reset form
        setSelectedDialogueVocabId("")
        setSearchDialogueVocabQuery("")
        setDialogueEngQ("")
        setDialogueTransQ("")
        setDialogueEngA("")
        setDialogueTransA("")
        setDialogueFormula("")
        setShowDialogueForm(false)
        showSuccessToast("Dialogue added successfully")
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Failed to add dialogue."
        setDialogueFormError(errMsg)
      }
    } else {
      // dialoguePracticeMode === "formula"
      if (!activeDialogueFormula.trim()) {
        setDialogueFormError("Please enter the formula / rumus.")
        return
      }

      const selectedVocab = selectedDialogueVocabId
        ? vocabList.find((v) => v.id === selectedDialogueVocabId)
        : null

      try {
        await createDialogueMutation.mutateAsync({
          vocabId: selectedVocab?.id || null,
          vocabWord: selectedVocab?.word || null,
          englishQuestion: activeDialogueEngQ.trim(),
          indonesianQuestion: activeDialogueTransQ.trim(),
          englishAnswer: activeDialogueEngA.trim(),
          indonesianAnswer: activeDialogueTransA.trim(),
          formula: activeDialogueFormula.trim(),
        })

        // Reset form
        setSelectedDialogueVocabId("")
        setSearchDialogueVocabQuery("")
        setDialogueEngQ("")
        setDialogueTransQ("")
        setDialogueEngA("")
        setDialogueTransA("")
        setDialogueFormula("")
        setShowDialogueForm(false)
        showSuccessToast("Dialogue added successfully")
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Failed to add dialogue."
        setDialogueFormError(errMsg)
      }
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
  const filteredDialogueVocabList = useMemo(() => {
    const q = searchDialogueVocabQuery.toLowerCase()
    return vocabList.filter(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        v.translation.toLowerCase().includes(q)
    )
  }, [vocabList, searchDialogueVocabQuery])

  const { vocabDialogueLogs, formulaDialogueLogs } = useMemo(() => {
    return {
      vocabDialogueLogs: dialogueList.filter((log) => !log.formula),
      formulaDialogueLogs: dialogueList.filter((log) => !!log.formula),
    }
  }, [dialogueList])

  const filteredVocabDialogueHistory = useMemo(() => {
    const q = searchQueryDialogue.toLowerCase()
    return vocabDialogueLogs.filter((log) => {
      const matchesSearch =
        (log.vocabWord && log.vocabWord.toLowerCase().includes(q)) ||
        log.englishQuestion.toLowerCase().includes(q) ||
        log.indonesianQuestion.toLowerCase().includes(q) ||
        log.englishAnswer.toLowerCase().includes(q) ||
        log.indonesianAnswer.toLowerCase().includes(q)
      return matchesSearch
    })
  }, [vocabDialogueLogs, searchQueryDialogue])

  const filteredFormulaDialogueHistory = useMemo(() => {
    const q = searchQueryDialogue.toLowerCase()
    return formulaDialogueLogs.filter((log) => {
      const matchesSearch =
        (log.formula && log.formula.toLowerCase().includes(q)) ||
        (log.vocabWord && log.vocabWord.toLowerCase().includes(q)) ||
        log.englishQuestion.toLowerCase().includes(q) ||
        log.indonesianQuestion.toLowerCase().includes(q) ||
        log.englishAnswer.toLowerCase().includes(q) ||
        log.indonesianAnswer.toLowerCase().includes(q)
      return matchesSearch
    })
  }, [formulaDialogueLogs, searchQueryDialogue])

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
    vocabFormula,
    setVocabFormula,
    writingFormError,
    handleAddWriting,
    handleDeleteWriting,
    handleSelectVocab,
    filteredVocabList,
    vocabWritingLogs: groupedVocabLogs,
    formulaWritingLogs: groupedFormulaLogs,
    freeWritingLogs,
    filteredGroupedHistory,
    filteredFormulaHistory,
    filteredFreeHistory,
    writingCreatePending: createWritingMutation.isPending,
    writingDeletePending: deleteWritingMutation.isPending,

    // Dialogue States & Handlers
    dialogueList,
    dialogueIsLoading,
    dialogueIsError,
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
    dialogueEngQ,
    setDialogueEngQ,
    dialogueTransQ,
    setDialogueTransQ,
    dialogueEngA,
    setDialogueEngA,
    dialogueTransA,
    setDialogueTransA,
    dialogueFormula,
    setDialogueFormula,
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
    dialogueCreatePending: createDialogueMutation.isPending,
    dialogueDeletePending: deleteDialogueMutation.isPending,
  }
}

export type UseLanguagePageReturn = ReturnType<typeof useLanguagePage>
