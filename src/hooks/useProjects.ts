import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface ProjectTask {
  id: string
  userId: string
  projectId: string
  name: string
  completed: boolean
  priority: string
  deadline: string | null
  createdAt: string
}

export interface Project {
  id: string
  userId: string
  name: string
  description: string | null
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
  }>({
    mutationFn: createProject,
    onSuccess: () => {
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
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteProject,
    onSuccess: () => {
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
    onSuccess: () => {
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
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteTask,
    onSuccess: () => {
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
  return useMutation<ProjectTask, Error, { id: string; completed: boolean }>({
    mutationFn: toggleTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}
