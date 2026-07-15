import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface LearningMaterial {
  id: string
  subjectId: string
  title: string
  status: "Not Started" | "In Progress" | "Completed"
  notes: string | null
  linkUrl: string | null
  createdAt: string
}

export interface LearningTask {
  id: string
  subjectId: string
  title: string
  completed: boolean
  dueDate: string | null
  createdAt: string
}

export interface LearningSubject {
  id: string
  userId: string
  name: string
  description: string | null
  status: "Planned" | "Learning" | "Completed"
  color: string
  createdAt: string
  materials: LearningMaterial[]
  tasks: LearningTask[]
}

// ==========================================
// 1. Learning Subjects Queries & Mutations
// ==========================================
async function fetchLearningSubjects(): Promise<LearningSubject[]> {
  const res = await fetch("/api/learning/subjects")
  if (!res.ok) {
    throw new Error("Failed to fetch learning subjects")
  }
  return res.json()
}

export function useLearningSubjectsQuery() {
  return useQuery<LearningSubject[]>({
    queryKey: ["learningSubjects"],
    queryFn: fetchLearningSubjects,
  })
}

// Create Subject
async function createSubject(body: {
  name: string
  description?: string | null
  status?: "Planned" | "Learning" | "Completed"
  color?: string
}): Promise<LearningSubject> {
  const res = await fetch("/api/learning/subjects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create learning subject")
  }
  const data = await res.json()
  return { ...data, materials: [], tasks: [] }
}

export function useCreateSubjectMutation() {
  const queryClient = useQueryClient()
  return useMutation<LearningSubject, Error, {
    name: string
    description?: string | null
    status?: "Planned" | "Learning" | "Completed"
    color?: string
  }>({
    mutationFn: createSubject,
    onSuccess: (newSubject) => {
      queryClient.setQueryData<LearningSubject[]>(["learningSubjects"], (old) => {
        if (!old) return [newSubject]
        return [newSubject, ...old]
      })
      queryClient.invalidateQueries({ queryKey: ["learningSubjects"] })
    },
  })
}

// Update Subject
async function updateSubject(body: {
  id: string
  name?: string
  description?: string | null
  status?: "Planned" | "Learning" | "Completed"
  color?: string
}): Promise<LearningSubject> {
  const res = await fetch("/api/learning/subjects", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to update learning subject")
  }
  return res.json()
}

export function useUpdateSubjectMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    LearningSubject,
    Error,
    {
      id: string
      name?: string
      description?: string | null
      status?: "Planned" | "Learning" | "Completed"
      color?: string
    },
    { previous: LearningSubject[] | undefined }
  >({
    mutationFn: updateSubject,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["learningSubjects"] })
      const previous = queryClient.getQueryData<LearningSubject[]>(["learningSubjects"])
      if (previous) {
        queryClient.setQueryData<LearningSubject[]>(
          ["learningSubjects"],
          previous.map((subj) =>
            subj.id === variables.id ? { ...subj, ...variables } : subj
          )
        )
      }
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["learningSubjects"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["learningSubjects"] })
    },
  })
}

// Delete Subject
async function deleteSubject(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/learning/subjects?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete learning subject")
  }
  return res.json()
}

export function useDeleteSubjectMutation() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string, { previous: LearningSubject[] | undefined }>({
    mutationFn: deleteSubject,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["learningSubjects"] })
      const previous = queryClient.getQueryData<LearningSubject[]>(["learningSubjects"])
      if (previous) {
        queryClient.setQueryData<LearningSubject[]>(
          ["learningSubjects"],
          previous.filter((subj) => subj.id !== id)
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["learningSubjects"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["learningSubjects"] })
    },
  })
}

// ==========================================
// 2. Learning Materials Mutations
// ==========================================
async function createMaterial(body: {
  subjectId: string
  title: string
  notes?: string | null
  linkUrl?: string | null
}): Promise<LearningMaterial> {
  const res = await fetch("/api/learning/materials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create learning material")
  }
  return res.json()
}

export function useCreateMaterialMutation() {
  const queryClient = useQueryClient()
  return useMutation<LearningMaterial, Error, {
    subjectId: string
    title: string
    notes?: string | null
    linkUrl?: string | null
  }>({
    mutationFn: createMaterial,
    onSuccess: (newMat) => {
      queryClient.setQueryData<LearningSubject[]>(["learningSubjects"], (old) => {
        if (!old) return old
        return old.map((subj) =>
          subj.id === newMat.subjectId
            ? { ...subj, materials: [newMat, ...subj.materials] }
            : subj
        )
      })
      queryClient.invalidateQueries({ queryKey: ["learningSubjects"] })
    },
  })
}

async function updateMaterial(body: {
  id: string
  title?: string
  status?: "Not Started" | "In Progress" | "Completed"
  notes?: string | null
  linkUrl?: string | null
}): Promise<LearningMaterial> {
  const res = await fetch("/api/learning/materials", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to update learning material")
  }
  return res.json()
}

export function useUpdateMaterialMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    LearningMaterial,
    Error,
    {
      id: string
      title?: string
      status?: "Not Started" | "In Progress" | "Completed"
      notes?: string | null
      linkUrl?: string | null
    },
    { previous: LearningSubject[] | undefined }
  >({
    mutationFn: updateMaterial,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["learningSubjects"] })
      const previous = queryClient.getQueryData<LearningSubject[]>(["learningSubjects"])
      if (previous) {
        queryClient.setQueryData<LearningSubject[]>(
          ["learningSubjects"],
          previous.map((subj) => ({
            ...subj,
            materials: subj.materials.map((mat) =>
              mat.id === variables.id ? { ...mat, ...variables } : mat
            ),
          }))
        )
      }
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["learningSubjects"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["learningSubjects"] })
    },
  })
}

async function deleteMaterial(id: string): Promise<LearningMaterial> {
  const res = await fetch(`/api/learning/materials?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete learning material")
  }
  return res.json()
}

export function useDeleteMaterialMutation() {
  const queryClient = useQueryClient()
  return useMutation<LearningMaterial, Error, string, { previous: LearningSubject[] | undefined }>({
    mutationFn: deleteMaterial,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["learningSubjects"] })
      const previous = queryClient.getQueryData<LearningSubject[]>(["learningSubjects"])
      if (previous) {
        queryClient.setQueryData<LearningSubject[]>(
          ["learningSubjects"],
          previous.map((subj) => ({
            ...subj,
            materials: subj.materials.filter((mat) => mat.id !== id),
          }))
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["learningSubjects"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["learningSubjects"] })
    },
  })
}

// ==========================================
// 3. Learning Tasks Mutations
// ==========================================
async function createLearningTask(body: {
  subjectId: string
  title: string
  dueDate?: string | null
}): Promise<LearningTask> {
  const res = await fetch("/api/learning/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create learning task")
  }
  return res.json()
}

export function useCreateLearningTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation<LearningTask, Error, {
    subjectId: string
    title: string
    dueDate?: string | null
  }>({
    mutationFn: createLearningTask,
    onSuccess: (newTask) => {
      queryClient.setQueryData<LearningSubject[]>(["learningSubjects"], (old) => {
        if (!old) return old
        return old.map((subj) =>
          subj.id === newTask.subjectId
            ? { ...subj, tasks: [newTask, ...subj.tasks] }
            : subj
        )
      })
      queryClient.invalidateQueries({ queryKey: ["learningSubjects"] })
    },
  })
}

async function updateLearningTask(body: {
  id: string
  title?: string
  completed?: boolean
  dueDate?: string | null
}): Promise<LearningTask> {
  const res = await fetch("/api/learning/tasks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to update learning task")
  }
  return res.json()
}

export function useUpdateLearningTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    LearningTask,
    Error,
    {
      id: string
      title?: string
      completed?: boolean
      dueDate?: string | null
    },
    { previous: LearningSubject[] | undefined }
  >({
    mutationFn: updateLearningTask,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["learningSubjects"] })
      const previous = queryClient.getQueryData<LearningSubject[]>(["learningSubjects"])
      if (previous) {
        queryClient.setQueryData<LearningSubject[]>(
          ["learningSubjects"],
          previous.map((subj) => ({
            ...subj,
            tasks: subj.tasks.map((task) =>
              task.id === variables.id ? { ...task, ...variables } : task
            ),
          }))
        )
      }
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["learningSubjects"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["learningSubjects"] })
    },
  })
}

async function deleteLearningTask(id: string): Promise<LearningTask> {
  const res = await fetch(`/api/learning/tasks?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete learning task")
  }
  return res.json()
}

export function useDeleteLearningTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation<LearningTask, Error, string, { previous: LearningSubject[] | undefined }>({
    mutationFn: deleteLearningTask,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["learningSubjects"] })
      const previous = queryClient.getQueryData<LearningSubject[]>(["learningSubjects"])
      if (previous) {
        queryClient.setQueryData<LearningSubject[]>(
          ["learningSubjects"],
          previous.map((subj) => ({
            ...subj,
            tasks: subj.tasks.filter((task) => task.id !== id),
          }))
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["learningSubjects"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["learningSubjects"] })
    },
  })
}
