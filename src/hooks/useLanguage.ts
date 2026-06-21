import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

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
  createdAt: string
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
  createdAt: string
}

export interface DialogueLog {
  id: string
  userId: string
  vocabId: string
  vocabWord: string
  englishQuestion: string
  indonesianQuestion: string
  englishAnswer: string
  indonesianAnswer: string
  autoTranslationQuestion: string | null
  autoTranslationAnswer: string | null
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

export function useVocabularyQuery() {
  return useQuery<VocabularyLog[]>({
    queryKey: ["vocabulary"],
    queryFn: fetchVocabulary,
  })
}

// 2. Create vocabulary log
async function createVocabulary(body: {
  word: string
  partOfSpeech?: string
  definition?: string
  translation: string
  exampleSentence?: string
  masteryLevel?: number
}): Promise<VocabularyLog> {
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

export function useCreateVocabularyMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    VocabularyLog,
    Error,
    {
      word: string
      partOfSpeech?: string
      definition?: string
      translation: string
      exampleSentence?: string
      masteryLevel?: number
    }
  >({
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
async function updateVocabulary(body: {
  id: string
  masteryLevel?: number
  memorized?: boolean
}): Promise<VocabularyLog> {
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

export function useUpdateVocabularyMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    VocabularyLog,
    Error,
    { id: string; masteryLevel?: number; memorized?: boolean },
    { previous: VocabularyLog[] | undefined }
  >({
    mutationFn: updateVocabulary,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["vocabulary"] })
      const previous = queryClient.getQueryData<VocabularyLog[]>(["vocabulary"])
      if (previous) {
        queryClient.setQueryData<VocabularyLog[]>(
          ["vocabulary"],
          previous.map((item) =>
            item.id === variables.id ? { ...item, ...variables } : item
          )
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

export function useDeleteVocabularyMutation() {
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

export function useWritingQuery() {
  return useQuery<WritingLog[]>({
    queryKey: ["writingLogs"],
    queryFn: fetchWritingLogs,
  })
}

// 6. Create writing log
async function createWritingLog(body: {
  vocabId?: string | null
  vocabWord?: string | null
  sentenceType?: "Positive" | "Negative" | "Interrogative" | null
  englishSentence: string
  indonesianTranslation: string
}): Promise<WritingLog> {
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

export function useCreateWritingMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    WritingLog,
    Error,
    {
      vocabId?: string | null
      vocabWord?: string | null
      sentenceType?: "Positive" | "Negative" | "Interrogative" | null
      englishSentence: string
      indonesianTranslation: string
    }
  >({
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

export function useDeleteWritingMutation() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string, { previous: WritingLog[] | undefined }>({
    mutationFn: deleteWritingLog,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["writingLogs"] })
      const previous = queryClient.getQueryData<WritingLog[]>(["writingLogs"])
      if (previous) {
        queryClient.setQueryData<WritingLog[]>(
          ["writingLogs"],
          previous.filter((l) => l.id !== id)
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

export function useDialogueQuery() {
  return useQuery<DialogueLog[]>({
    queryKey: ["dialogues"],
    queryFn: fetchDialogues,
  })
}

// 9. Create dialogue
async function createDialogue(body: {
  vocabId: string
  vocabWord: string
  englishQuestion: string
  indonesianQuestion: string
  englishAnswer: string
  indonesianAnswer: string
}): Promise<DialogueLog> {
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

export function useCreateDialogueMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    DialogueLog,
    Error,
    {
      vocabId: string
      vocabWord: string
      englishQuestion: string
      indonesianQuestion: string
      englishAnswer: string
      indonesianAnswer: string
    }
  >({
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

export function useDeleteDialogueMutation() {
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
