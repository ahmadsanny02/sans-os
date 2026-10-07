import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query"

export interface ProjectSubTask {
  id: string
  userId: string
  taskId: string
  name: string
  status: string
  completed: boolean
  createdAt: string
}

export interface ProjectTask {
  id: string
  userId: string
  projectId: string
  name: string
  status: string
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
  subCategory?: string | null
  status: string
  priority: string
  deadline: string | null
  createdAt: string
  tasks: ProjectTask[]
}

export interface CreateProjectInput {
  name: string
  description?: string
  status?: string
  priority?: string
  deadline?: string
  category?: string
  subCategory?: string | null
}

export interface CreateTaskInput {
  projectId: string
  name: string
  status?: string
  priority?: string
  deadline?: string
}

export interface CreateSubTaskInput {
  taskId: string
  name: string
  status?: string
}

export interface UpdateProjectInput {
  id: string
  name?: string
  description?: string | null
  status?: string
  priority?: string
  deadline?: string | null
  category?: string
  subCategory?: string | null
}

export interface UpdateTaskInput {
  id: string
  name?: string
  status?: string
  completed?: boolean
  priority?: string
  deadline?: string | null
}

export interface UpdateSubTaskInput {
  id: string
  name?: string
  status?: string
  completed?: boolean
}

// 1. Fetch user projects (includes nested tasks)
async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects")
  if (!res.ok) {
    throw new Error("Failed to fetch projects")
  }
  return res.json()
}

export function useProjectsQuery(): UseQueryResult<Project[], Error> {
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
  subCategory?: string | null
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

export function useCreateProjectMutation(): UseMutationResult<Project, Error, CreateProjectInput> {
  const queryClient = useQueryClient()
  return useMutation<Project, Error, CreateProjectInput>({
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

export function useDeleteProjectMutation(): UseMutationResult<{ success: boolean }, Error, string, { previous: Project[] | undefined }> {
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
  status?: string
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

export function useCreateTaskMutation(): UseMutationResult<ProjectTask, Error, CreateTaskInput> {
  const queryClient = useQueryClient()
  return useMutation<ProjectTask, Error, CreateTaskInput>({
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

export function useDeleteTaskMutation(): UseMutationResult<{ success: boolean }, Error, string, { previous: Project[] | undefined }> {
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
  const res = await fetch("/api/projects/tasks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to toggle task status")
  }
  return res.json()
}

export function useToggleTaskMutation(): UseMutationResult<ProjectTask, Error, { id: string; completed: boolean }, { previous: Project[] | undefined }> {
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
              t.id === variables.id
                ? {
                    ...t,
                    completed: variables.completed,
                    status: variables.completed ? "Completed" : (t.status === "Completed" ? "In Progress" : (t.status || "Planning")),
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

// 7. Create new subtask
async function createSubTask(body: {
  taskId: string
  name: string
  status?: string
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

export function useCreateSubTaskMutation(): UseMutationResult<ProjectSubTask, Error, CreateSubTaskInput> {
  const queryClient = useQueryClient()
  return useMutation<ProjectSubTask, Error, CreateSubTaskInput>({
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

export function useDeleteSubTaskMutation(): UseMutationResult<{ success: boolean }, Error, string, { previous: Project[] | undefined }> {
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
  const res = await fetch("/api/projects/tasks/subtasks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to toggle subtask status")
  }
  return res.json()
}

export function useToggleSubTaskMutation(): UseMutationResult<ProjectSubTask, Error, { id: string; completed: boolean }, { previous: Project[] | undefined }> {
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
                st.id === variables.id
                  ? {
                      ...st,
                      completed: variables.completed,
                      status: variables.completed ? "Completed" : (st.status === "Completed" ? "In Progress" : (st.status || "Planning")),
                    }
                  : st
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
async function updateProject(body: UpdateProjectInput): Promise<Project> {
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

export function useUpdateProjectMutation(): UseMutationResult<Project, Error, UpdateProjectInput, { previous: Project[] | undefined }> {
  const queryClient = useQueryClient()
  return useMutation<Project, Error, {
    id: string
    name?: string
    description?: string | null
    status?: string
    priority?: string
    deadline?: string | null
    category?: string
    subCategory?: string | null
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
                  subCategory: variables.subCategory !== undefined ? variables.subCategory : p.subCategory,
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
async function updateTask(body: UpdateTaskInput): Promise<ProjectTask> {
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

export function useUpdateTaskMutation(): UseMutationResult<ProjectTask, Error, UpdateTaskInput, { previous: Project[] | undefined }> {
  const queryClient = useQueryClient()
  return useMutation<ProjectTask, Error, UpdateTaskInput, { previous: Project[] | undefined }>({
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
                    status: variables.status !== undefined ? variables.status : (variables.completed !== undefined ? (variables.completed ? "Completed" : (t.status === "Completed" ? "In Progress" : t.status)) : t.status),
                    completed: variables.completed !== undefined ? variables.completed : (variables.status !== undefined ? variables.status === "Completed" : t.completed),
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

// 12. Update subtask
async function updateSubTask(body: UpdateSubTaskInput): Promise<ProjectSubTask> {
  const res = await fetch("/api/projects/tasks/subtasks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error("Failed to update subtask")
  }
  return res.json()
}

export function useUpdateSubTaskMutation(): UseMutationResult<ProjectSubTask, Error, UpdateSubTaskInput, { previous: Project[] | undefined }> {
  const queryClient = useQueryClient()
  return useMutation<ProjectSubTask, Error, UpdateSubTaskInput, { previous: Project[] | undefined }>({
    mutationFn: updateSubTask,
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
                st.id === variables.id
                  ? {
                      ...st,
                      name: variables.name !== undefined ? variables.name : st.name,
                      status: variables.status !== undefined ? variables.status : (variables.completed !== undefined ? (variables.completed ? "Completed" : (st.status === "Completed" ? "In Progress" : st.status)) : st.status),
                      completed: variables.completed !== undefined ? variables.completed : (variables.status !== undefined ? variables.status === "Completed" : st.completed),
                    }
                  : st
              ),
            })),
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


