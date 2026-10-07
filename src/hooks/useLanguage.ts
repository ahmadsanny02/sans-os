import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query"

export interface VocabularyLog {
  id: string
  userId: string
  word: string
  partOfSpeech: string
  definition: string
  translation: string
  exampleSentence: string | null
  masteryLevel: number
  memorized: boolean
  autoTranslation: string | null
  v1: string | null
  v2: string | null
  v3: string | null
  vIng: string | null
  v1Translation: string | null
  v2Translation: string | null
  v3Translation: string | null
  vIngTranslation: string | null
  langDirection: string
  createdAt: string
  memorizedAt: string | null
}

export interface CreateVocabularyInput {
  word: string
  partOfSpeech?: string
  definition?: string
  translation: string
  exampleSentence?: string
  masteryLevel?: number
  langDirection?: string
}

export interface UpdateVocabularyInput {
  id: string
  masteryLevel?: number
  memorized?: boolean
  translation?: string
}

export interface WritingLog {
  id: string
  userId: string
  vocabId: string | null
  vocabWord: string | null
  sentenceType: "Positive" | "Negative" | "Interrogative" | null
  englishSentence: string
  indonesianTranslation: string
  autoTranslation: string | null
  formulaId: string | null
  formula: string | null
  createdAt: string
}

export interface GroupedWritingLog {
  id: string
  vocabId: string | null
  vocabWord: string | null
  formulaId: string | null
  formula: string | null
  createdAt: string
  positive?: WritingLog
  negative?: WritingLog
  interrogative?: WritingLog
  allIds: string[]
}


export interface DialogueLog {
  id: string
  userId: string
  vocabId: string | null
  vocabWord: string | null
  englishQuestion: string
  indonesianQuestion: string
  englishAnswer: string
  indonesianAnswer: string
  autoTranslationQuestion: string | null
  autoTranslationAnswer: string | null
  formulaId: string | null
  formula: string | null
  createdAt: string
}

// 1. Fetch vocabulary list
async function fetchVocabulary(): Promise<VocabularyLog[]> {
  const res = await fetch("/api/language")
  if (!res.ok) {
    throw new Error("Failed to fetch vocabulary logs")
  }
  return res.json()
}

export function useVocabularyQuery(): UseQueryResult<VocabularyLog[], Error> {
  return useQuery<VocabularyLog[]>({
    queryKey: ["vocabulary"],
    queryFn: fetchVocabulary,
  })
}

// 2. Create vocabulary log
async function createVocabulary(body: CreateVocabularyInput): Promise<VocabularyLog> {
  const res = await fetch("/api/language", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to create vocabulary log")
  }
  return res.json()
}

export function useCreateVocabularyMutation(): UseMutationResult<
  VocabularyLog,
  Error,
  CreateVocabularyInput
> {
  const queryClient = useQueryClient()
  return useMutation<VocabularyLog, Error, CreateVocabularyInput>({
    mutationFn: createVocabulary,
    onSuccess: (newVocab) => {
      queryClient.setQueryData<VocabularyLog[]>(["vocabulary"], (old) => {
        if (!old) return [newVocab]
        return [...old.filter((v) => v.id !== newVocab.id), newVocab]
      })
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] })
    },
  })
}

// 3. Update word mastery level or memorized state
async function updateVocabulary(body: UpdateVocabularyInput): Promise<VocabularyLog> {
  const res = await fetch("/api/language", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to update vocabulary log")
  }
  return res.json()
}

export function useUpdateVocabularyMutation(): UseMutationResult<
  VocabularyLog,
  Error,
  UpdateVocabularyInput,
  { previous: VocabularyLog[] | undefined }
> {
  const queryClient = useQueryClient()
  return useMutation<
    VocabularyLog,
    Error,
    UpdateVocabularyInput,
    { previous: VocabularyLog[] | undefined }
  >({
    mutationFn: updateVocabulary,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["vocabulary"] })
      const previous = queryClient.getQueryData<VocabularyLog[]>(["vocabulary"])
      if (previous) {
        queryClient.setQueryData<VocabularyLog[]>(
          ["vocabulary"],
          previous.map((item) => {
            if (item.id === variables.id) {
              const updatedItem = { ...item, ...variables }
              if (
                variables.memorized === true &&
                item.autoTranslation &&
                item.translation.trim().toLowerCase() !== item.autoTranslation.trim().toLowerCase()
              ) {
                updatedItem.translation = item.autoTranslation
              }
              return updatedItem
            }
            return item
          })
        )
      }
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["vocabulary"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] })
    },
  })
}

// 4. Delete vocabulary log
async function deleteVocabulary(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/language?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete vocabulary log")
  }
  return res.json()
}

export function useDeleteVocabularyMutation(): UseMutationResult<
  { success: boolean },
  Error,
  string,
  { previous: VocabularyLog[] | undefined }
> {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string, { previous: VocabularyLog[] | undefined }>({
    mutationFn: deleteVocabulary,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["vocabulary"] })
      const previous = queryClient.getQueryData<VocabularyLog[]>(["vocabulary"])
      if (previous) {
        queryClient.setQueryData<VocabularyLog[]>(
          ["vocabulary"],
          previous.filter((v) => v.id !== id)
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["vocabulary"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] })
    },
  })
}

// 5. Fetch writing logs list
async function fetchWritingLogs(): Promise<WritingLog[]> {
  const res = await fetch("/api/language/writing")
  if (!res.ok) {
    throw new Error("Failed to fetch writing logs")
  }
  return res.json()
}

export interface CreateWritingInput {
  vocabId?: string | null
  vocabWord?: string | null
  sentenceType?: "Positive" | "Negative" | "Interrogative" | null
  englishSentence: string
  indonesianTranslation: string
  formulaId?: string | null
  formula?: string | null
}

export function useWritingQuery(): UseQueryResult<WritingLog[], Error> {
  return useQuery<WritingLog[]>({
    queryKey: ["writingLogs"],
    queryFn: fetchWritingLogs,
  })
}

// 6. Create writing log
async function createWritingLog(body: CreateWritingInput): Promise<WritingLog> {
  const res = await fetch("/api/language/writing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create writing log")
  }
  return res.json()
}

export function useCreateWritingMutation(): UseMutationResult<
  WritingLog,
  Error,
  CreateWritingInput
> {
  const queryClient = useQueryClient()
  return useMutation<WritingLog, Error, CreateWritingInput>({
    mutationFn: createWritingLog,
    onSuccess: (newLog) => {
      queryClient.setQueryData<WritingLog[]>(["writingLogs"], (old) => {
        if (!old) return [newLog]
        return [...old.filter((l) => l.id !== newLog.id), newLog]
      })
      queryClient.invalidateQueries({ queryKey: ["writingLogs"] })
    },
  })
}

// 7. Delete writing log
async function deleteWritingLog(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/language/writing?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete writing log")
  }
  return res.json()
}

export function useDeleteWritingMutation(): UseMutationResult<
  { success: boolean },
  Error,
  string,
  { previous: WritingLog[] | undefined }
> {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string, { previous: WritingLog[] | undefined }>({
    mutationFn: deleteWritingLog,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["writingLogs"] })
      const previous = queryClient.getQueryData<WritingLog[]>(["writingLogs"])
      if (previous) {
        const ids = id.split(",")
        queryClient.setQueryData<WritingLog[]>(
          ["writingLogs"],
          previous.filter((l) => !ids.includes(l.id))
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["writingLogs"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["writingLogs"] })
    },
  })
}

// 8. Fetch dialogues list
async function fetchDialogues(): Promise<DialogueLog[]> {
  const res = await fetch("/api/language/dialogue")
  if (!res.ok) {
    throw new Error("Failed to fetch dialogues")
  }
  return res.json()
}

export interface CreateDialogueInput {
  vocabId: string | null
  vocabWord: string | null
  englishQuestion: string
  indonesianQuestion: string
  englishAnswer: string
  indonesianAnswer: string
  formulaId?: string | null
  formula?: string | null
}

export function useDialogueQuery(): UseQueryResult<DialogueLog[], Error> {
  return useQuery<DialogueLog[]>({
    queryKey: ["dialogues"],
    queryFn: fetchDialogues,
  })
}

// 9. Create dialogue
async function createDialogue(body: CreateDialogueInput): Promise<DialogueLog> {
  const res = await fetch("/api/language/dialogue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to create dialogue log")
  }
  return res.json()
}

export function useCreateDialogueMutation(): UseMutationResult<
  DialogueLog,
  Error,
  CreateDialogueInput
> {
  const queryClient = useQueryClient()
  return useMutation<DialogueLog, Error, CreateDialogueInput>({
    mutationFn: createDialogue,
    onSuccess: (newLog) => {
      queryClient.setQueryData<DialogueLog[]>(["dialogues"], (old) => {
        if (!old) return [newLog]
        return [...old.filter((l) => l.id !== newLog.id), newLog]
      })
      queryClient.invalidateQueries({ queryKey: ["dialogues"] })
    },
  })
}

// 10. Delete dialogue
async function deleteDialogue(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/language/dialogue?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete dialogue")
  }
  return res.json()
}

export function useDeleteDialogueMutation(): UseMutationResult<
  { success: boolean },
  Error,
  string,
  { previous: DialogueLog[] | undefined }
> {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string, { previous: DialogueLog[] | undefined }>({
    mutationFn: deleteDialogue,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["dialogues"] })
      const previous = queryClient.getQueryData<DialogueLog[]>(["dialogues"])
      if (previous) {
        queryClient.setQueryData<DialogueLog[]>(
          ["dialogues"],
          previous.filter((d) => d.id !== id)
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["dialogues"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dialogues"] })
    },
  })
}

// ==================== FORMULA MANAGEMENT HOOKS ====================

export interface Formula {
  id: string
  userId: string
  name: string
  description: string | null
  formula: string
  createdAt: string
}

async function fetchFormulas(): Promise<Formula[]> {
  const res = await fetch("/api/language/formulas")
  if (!res.ok) {
    throw new Error("Failed to fetch formulas")
  }
  return res.json()
}

export interface CreateFormulaInput {
  name: string
  formula: string
  description?: string
}

export interface UpdateFormulaInput {
  id: string
  name: string
  formula: string
  description?: string | null
}

export function useFormulasQuery(): UseQueryResult<Formula[], Error> {
  return useQuery<Formula[]>({
    queryKey: ["formulas"],
    queryFn: fetchFormulas,
  })
}

async function createFormula(body: CreateFormulaInput): Promise<Formula> {
  const res = await fetch("/api/language/formulas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to create formula")
  }
  return res.json()
}

export function useCreateFormulaMutation(): UseMutationResult<
  Formula,
  Error,
  CreateFormulaInput
> {
  const queryClient = useQueryClient()
  return useMutation<Formula, Error, CreateFormulaInput>({
    mutationFn: createFormula,
    onSuccess: (newFormula) => {
      queryClient.setQueryData<Formula[]>(["formulas"], (old) => {
        if (!old) return [newFormula]
        return [...old, newFormula]
      })
      queryClient.invalidateQueries({ queryKey: ["formulas"] })
    },
  })
}

async function updateFormula(body: UpdateFormulaInput): Promise<Formula> {
  const res = await fetch("/api/language/formulas", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to update formula")
  }
  return res.json()
}

export function useUpdateFormulaMutation(): UseMutationResult<
  Formula,
  Error,
  UpdateFormulaInput
> {
  const queryClient = useQueryClient()
  return useMutation<Formula, Error, UpdateFormulaInput>({
    mutationFn: updateFormula,
    onSuccess: (updatedFormula) => {
      queryClient.setQueryData<Formula[]>(["formulas"], (old) => {
        if (!old) return [updatedFormula]
        return old.map((f) => (f.id === updatedFormula.id ? updatedFormula : f))
      })
      queryClient.invalidateQueries({ queryKey: ["formulas"] })
    },
  })
}

async function deleteFormula(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/language/formulas?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete formula")
  }
  return res.json()
}

export function useDeleteFormulaMutation(): UseMutationResult<
  { success: boolean },
  Error,
  string,
  { previous: Formula[] | undefined }
> {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string, { previous: Formula[] | undefined }>({
    mutationFn: deleteFormula,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["formulas"] })
      const previous = queryClient.getQueryData<Formula[]>(["formulas"])
      if (previous) {
        queryClient.setQueryData<Formula[]>(
          ["formulas"],
          previous.filter((f) => f.id !== id)
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["formulas"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["formulas"] })
    },
  })
}

// --- DICTIONARY ---

export interface DictionaryWord {
  word: string
}

export interface WordDetails {
  word: string
  partOfSpeech: string
  definition: string
  translation: string
  alternativeTranslations: { partOfSpeech: string; translations: string[] }[]
}

async function fetchDictionaryByLetter(letter: string): Promise<DictionaryWord[]> {
  const res = await fetch(`/api/language/dictionary?letter=${letter.toLowerCase()}`)
  if (!res.ok) throw new Error("Failed to fetch words by letter")
  return res.json()
}

export function useDictionaryByLetterQuery(
  letter: string,
  enabled: boolean
): UseQueryResult<DictionaryWord[], Error> {
  return useQuery<DictionaryWord[]>({
    queryKey: ["dictionary", "letter", letter.toLowerCase()],
    queryFn: () => fetchDictionaryByLetter(letter),
    enabled,
    staleTime: 10 * 60 * 1000,
  })
}

async function fetchDictionarySearch(q: string): Promise<DictionaryWord[]> {
  const res = await fetch(`/api/language/dictionary?q=${encodeURIComponent(q.trim())}`)
  if (!res.ok) throw new Error("Failed to search dictionary words")
  return res.json()
}

export function useDictionarySearchQuery(
  q: string,
  enabled: boolean
): UseQueryResult<DictionaryWord[], Error> {
  return useQuery<DictionaryWord[]>({
    queryKey: ["dictionary", "search", q.trim()],
    queryFn: () => fetchDictionarySearch(q),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

async function fetchDictionaryWordDetails(word: string): Promise<WordDetails> {
  const res = await fetch(`/api/language/dictionary?word=${encodeURIComponent(word)}`)
  if (!res.ok) throw new Error("Failed to load details for word")
  return res.json()
}

export function useDictionaryWordDetailsQuery(
  word: string | null,
  enabled: boolean
): UseQueryResult<WordDetails, Error> {
  return useQuery<WordDetails>({
    queryKey: ["dictionary", "details", word],
    queryFn: () => fetchDictionaryWordDetails(word || ""),
    enabled: enabled && !!word,
    staleTime: 30 * 60 * 1000,
  })
}

