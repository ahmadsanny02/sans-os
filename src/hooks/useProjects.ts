import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface ProjectSubTask {
  id: string
  userId: string
  taskId: string
  name: string
  completed: boolean
  createdAt: string
}

export interface ProjectTask {
  id: string
  userId: string
  projectId: string
  name: string
  completed: boolean
  priority: string
  deadline: string | null
  createdAt: string
  subTasks: ProjectSubTask[]
}

export interface Project {
  id: string
  userId: string
  name: string
  description: string | null
  category: string
  status: string
  priority: string
  deadline: string | null
  createdAt: string
  tasks: ProjectTask[]
}

// 1. Fetch user projects (includes nested tasks)
async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects")
  if (!res.ok) {
    throw new Error("Failed to fetch projects")
  }
  return res.json()
}

export function useProjectsQuery() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  })
}

// 2. Create new project
async function createProject(body: {
  name: string
  description?: string
  status?: string
  priority?: string
  deadline?: string
  category?: string
}): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create project")
  }
  return res.json()
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation<Project, Error, {
    name: string
    description?: string
    status?: string
    priority?: string
    deadline?: string
    category?: string
  }>({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      queryClient.setQueryData<Project[]>(["projects"], (old) => {
        if (!old) return [{ ...newProject, tasks: [] }]
        return [...old.filter((p) => p.id !== newProject.id), { ...newProject, tasks: [] }]
      })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

// 3. Delete project
async function deleteProject(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/projects?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete project")
  }
  return res.json()
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string, { previous: Project[] | undefined }>({
    mutationFn: deleteProject,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] })
      const previous = queryClient.getQueryData<Project[]>(["projects"])
      if (previous) {
        queryClient.setQueryData<Project[]>(
          ["projects"],
          previous.filter((p) => p.id !== id)
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

// 4. Create new project task
async function createTask(body: {
  projectId: string
  name: string
  priority?: string
  deadline?: string
}): Promise<ProjectTask> {
  const res = await fetch("/api/projects/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create task")
  }
  return res.json()
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation<ProjectTask, Error, {
    projectId: string
    name: string
    priority?: string
    deadline?: string
  }>({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      queryClient.setQueryData<Project[]>(["projects"], (old) => {
        if (!old) return []
        return old.map((p) => {
          if (p.id === newTask.projectId) {
            return {
              ...p,
              tasks: [...p.tasks.filter((t) => t.id !== newTask.id), newTask],
            }
          }
          return p
        })
      })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

// 5. Delete task
async function deleteTask(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/projects/tasks?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete task")
  }
  return res.json()
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string, { previous: Project[] | undefined }>({
    mutationFn: deleteTask,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] })
      const previous = queryClient.getQueryData<Project[]>(["projects"])
      if (previous) {
        queryClient.setQueryData<Project[]>(
          ["projects"],
          previous.map((p) => ({
            ...p,
            tasks: p.tasks.filter((t) => t.id !== id),
          }))
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

// 6. Toggle task completed status
async function toggleTask(body: { id: string; completed: boolean }): Promise<ProjectTask> {
  const res = await fetch("/api/projects/tasks/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to toggle task status")
  }
  return res.json()
}

export function useToggleTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation<ProjectTask, Error, { id: string; completed: boolean }, { previous: Project[] | undefined }>({
    mutationFn: toggleTask,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] })
      const previous = queryClient.getQueryData<Project[]>(["projects"])
      if (previous) {
        queryClient.setQueryData<Project[]>(
          ["projects"],
          previous.map((p) => ({
            ...p,
            tasks: p.tasks.map((t) =>
              t.id === variables.id ? { ...t, completed: variables.completed } : t
            ),
          }))
        )
      }
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

// 7. Create new subtask
async function createSubTask(body: {
  taskId: string
  name: string
}): Promise<ProjectSubTask> {
  const res = await fetch("/api/projects/tasks/subtasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to create subtask")
  }
  return res.json()
}

export function useCreateSubTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation<ProjectSubTask, Error, { taskId: string; name: string }>({
    mutationFn: createSubTask,
    onSuccess: (newSubTask) => {
      queryClient.setQueryData<Project[]>(["projects"], (old) => {
        if (!old) return []
        return old.map((p) => ({
          ...p,
          tasks: p.tasks.map((t) => {
            if (t.id === newSubTask.taskId) {
              return {
                ...t,
                subTasks: [...(t.subTasks || []), newSubTask]
              }
            }
            return t
          })
        }))
      })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    }
  })
}

// 8. Delete subtask
async function deleteSubTask(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/projects/tasks/subtasks?id=${id}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    throw new Error("Failed to delete subtask")
  }
  return res.json()
}

export function useDeleteSubTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, string, { previous: Project[] | undefined }>({
    mutationFn: deleteSubTask,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] })
      const previous = queryClient.getQueryData<Project[]>(["projects"])
      if (previous) {
        queryClient.setQueryData<Project[]>(
          ["projects"],
          previous.map((p) => ({
            ...p,
            tasks: p.tasks.map((t) => ({
              ...t,
              subTasks: (t.subTasks || []).filter((st) => st.id !== id)
            }))
          }))
        )
      }
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    }
  })
}

// 9. Toggle subtask
async function toggleSubTask(body: { id: string; completed: boolean }): Promise<ProjectSubTask> {
  const res = await fetch("/api/projects/tasks/subtasks/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to toggle subtask status")
  }
  return res.json()
}

export function useToggleSubTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation<ProjectSubTask, Error, { id: string; completed: boolean }, { previous: Project[] | undefined }>({
    mutationFn: toggleSubTask,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] })
      const previous = queryClient.getQueryData<Project[]>(["projects"])
      if (previous) {
        queryClient.setQueryData<Project[]>(
          ["projects"],
          previous.map((p) => ({
            ...p,
            tasks: p.tasks.map((t) => ({
              ...t,
              subTasks: (t.subTasks || []).map((st) => 
                st.id === variables.id ? { ...st, completed: variables.completed } : st
              )
            }))
          }))
        )
      }
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    }
  })
}

// 10. Update project
async function updateProject(body: {
  id: string
  name?: string
  description?: string | null
  status?: string
  priority?: string
  deadline?: string | null
  category?: string
}): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to update project")
  }
  return res.json()
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation<Project, Error, {
    id: string
    name?: string
    description?: string | null
    status?: string
    priority?: string
    deadline?: string | null
    category?: string
  }, { previous: Project[] | undefined }>({
    mutationFn: updateProject,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] })
      const previous = queryClient.getQueryData<Project[]>(["projects"])
      if (previous) {
        queryClient.setQueryData<Project[]>(
          ["projects"],
          previous.map((p) =>
            p.id === variables.id
              ? {
                  ...p,
                  name: variables.name !== undefined ? variables.name : p.name,
                  description: variables.description !== undefined ? variables.description : p.description,
                  status: variables.status !== undefined ? variables.status : p.status,
                  priority: variables.priority !== undefined ? variables.priority : p.priority,
                  deadline: variables.deadline !== undefined ? variables.deadline : p.deadline,
                  category: variables.category !== undefined ? variables.category : p.category,
                }
              : p
          )
        )
      }
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

// 11. Update task
async function updateTask(body: {
  id: string
  name?: string
  completed?: boolean
  priority?: string
  deadline?: string | null
}): Promise<ProjectTask> {
  const res = await fetch("/api/projects/tasks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to update task")
  }
  return res.json()
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation<ProjectTask, Error, {
    id: string
    name?: string
    completed?: boolean
    priority?: string
    deadline?: string | null
  }, { previous: Project[] | undefined }>({
    mutationFn: updateTask,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] })
      const previous = queryClient.getQueryData<Project[]>(["projects"])
      if (previous) {
        queryClient.setQueryData<Project[]>(
          ["projects"],
          previous.map((p) => ({
            ...p,
            tasks: p.tasks.map((t) =>
              t.id === variables.id
                ? {
                    ...t,
                    name: variables.name !== undefined ? variables.name : t.name,
                    completed: variables.completed !== undefined ? variables.completed : t.completed,
                    priority: variables.priority !== undefined ? variables.priority : t.priority,
                    deadline: variables.deadline !== undefined ? variables.deadline : t.deadline,
                  }
                : t
            ),
          }))
        )
      }
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["projects"], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

