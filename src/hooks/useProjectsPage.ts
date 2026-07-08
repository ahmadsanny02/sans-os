"use client"

import React, { useState } from "react"
import {
  useProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useToggleTaskMutation,
  useCreateSubTaskMutation,
  useDeleteSubTaskMutation,
  useToggleSubTaskMutation,
  useUpdateProjectMutation,
  useUpdateTaskMutation,
} from "@/hooks/useProjects"
import { format, isPast, isToday } from "date-fns"
import { confirmDestructive, showError, showSuccessToast } from "@/lib/sweetalert"

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "No deadline"
  try {
    const d = new Date(dateStr)
    return format(d, "MMM d, yyyy")
  } catch {
    return "Invalid date"
  }
}

export function isOverdue(dateStr: string | null | undefined, completed: boolean = false): boolean {
  if (!dateStr || completed) return false
  try {
    const d = new Date(dateStr)
    return isPast(d) && !isToday(d)
  } catch {
    return false
  }
}

export function useProjectsPage() {
  const { data: projectsList = [], isLoading, isError } = useProjectsQuery()
  const createProjectMutation = useCreateProjectMutation()
  const deleteProjectMutation = useDeleteProjectMutation()
  const createTaskMutation = useCreateTaskMutation()
  const deleteTaskMutation = useDeleteTaskMutation()
  const toggleTaskMutation = useToggleTaskMutation()
  const createSubTaskMutation = useCreateSubTaskMutation()
  const deleteSubTaskMutation = useDeleteSubTaskMutation()
  const toggleSubTaskMutation = useToggleSubTaskMutation()
  const updateProjectMutation = useUpdateProjectMutation()
  const updateTaskMutation = useUpdateTaskMutation()

  // Selected project ID
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  // Forms states
  const [showAddProject, setShowAddProject] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectDesc, setProjectDesc] = useState("")
  const [projectPriority, setProjectPriority] = useState("Medium")
  const [projectStatus, setProjectStatus] = useState("Planning")
  const [projectDeadline, setProjectDeadline] = useState("")
  const [projectError, setProjectError] = useState<string | null>(null)

  // Task form states
  const [taskName, setTaskName] = useState("")
  const [taskPriority, setTaskPriority] = useState("Medium")
  const [taskDeadline, setTaskDeadline] = useState("")
  const [taskError, setTaskError] = useState<string | null>(null)

  // Sub-task states (we use a map to keep track of active sub-task input per task)
  const [subTaskInputs, setSubTaskInputs] = useState<Record<string, string>>({})
  const [subTaskErrors, setSubTaskErrors] = useState<Record<string, string>>({})

  // Filter project query list
  const activeProject = projectsList.find((p) => p.id === selectedProjectId) || null

  const handleAddProject = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setProjectError(null)
    if (!projectName.trim()) return

    try {
      const newProj = await createProjectMutation.mutateAsync({
        name: projectName,
        description: projectDesc,
        priority: projectPriority,
        status: projectStatus,
        deadline: projectDeadline || undefined,
      })
      setProjectName("")
      setProjectDesc("")
      setProjectPriority("Medium")
      setProjectStatus("Planning")
      setProjectDeadline("")
      setShowAddProject(false)
      setSelectedProjectId(newProj.id)
      showSuccessToast("Project created successfully")
    } catch {
      setProjectError("Failed to create project.")
    }
  }

  const handleDeleteProject = async (id: string, e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    const confirmed = await confirmDestructive(
      "Delete Project?",
      "Are you sure you want to delete this project? All associated tasks will be permanently removed."
    )
    if (!confirmed) return
    try {
      await deleteProjectMutation.mutateAsync(id)
      if (selectedProjectId === id) {
        setSelectedProjectId(null)
      }
      showSuccessToast("Project deleted successfully")
    } catch {
      await showError("Deletion Failed", "Failed to delete project.")
    }
  }

  const handleAddTask = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setTaskError(null)
    if (!selectedProjectId || !taskName.trim()) return

    try {
      await createTaskMutation.mutateAsync({
        projectId: selectedProjectId,
        name: taskName,
        priority: taskPriority,
        deadline: taskDeadline || undefined,
      })
      setTaskName("")
      setTaskPriority("Medium")
      setTaskDeadline("")
      showSuccessToast("Task added to project")
    } catch {
      setTaskError("Failed to add task.")
    }
  }

  const handleDeleteTask = async (id: string): Promise<void> => {
    const confirmed = await confirmDestructive(
      "Delete Task?",
      "Are you sure you want to delete this task?"
    )
    if (!confirmed) return
    try {
      await deleteTaskMutation.mutateAsync(id)
      showSuccessToast("Task deleted successfully")
    } catch {
      await showError("Deletion Failed", "Failed to delete task.")
    }
  }

  const handleToggleTask = (id: string, completed: boolean): void => {
    toggleTaskMutation.mutate({ id, completed: !completed })
  }

  // --- Sub Task Handlers ---
  const handleAddSubTask = async (e: React.FormEvent, taskId: string): Promise<void> => {
    e.preventDefault()
    const name = subTaskInputs[taskId]
    if (!name?.trim()) return

    try {
      await createSubTaskMutation.mutateAsync({
        taskId,
        name: name.trim(),
      })
      setSubTaskInputs((prev) => ({ ...prev, [taskId]: "" }))
      setSubTaskErrors((prev) => ({ ...prev, [taskId]: "" }))
      showSuccessToast("Sub-task added")
    } catch {
      setSubTaskErrors((prev) => ({ ...prev, [taskId]: "Failed to add sub-task." }))
    }
  }

  const handleDeleteSubTask = async (id: string): Promise<void> => {
    const confirmed = await confirmDestructive(
      "Delete Sub-task?",
      "Are you sure you want to delete this sub-task?"
    )
    if (!confirmed) return
    try {
      await deleteSubTaskMutation.mutateAsync(id)
    } catch {
      await showError("Deletion Failed", "Failed to delete sub-task.")
    }
  }

  const handleToggleSubTask = (id: string, completed: boolean): void => {
    toggleSubTaskMutation.mutate({ id, completed: !completed })
  }

  const handleUpdateProjectStatus = async (id: string, status: string): Promise<void> => {
    try {
      await updateProjectMutation.mutateAsync({ id, status })
      showSuccessToast("Project status updated successfully")
    } catch {
      await showError("Update Failed", "Failed to update project status.")
    }
  }

  const handleUpdateProjectPriority = async (id: string, priority: string): Promise<void> => {
    try {
      await updateProjectMutation.mutateAsync({ id, priority })
      showSuccessToast("Project priority updated successfully")
    } catch {
      await showError("Update Failed", "Failed to update project priority.")
    }
  }

  const handleUpdateProjectDeadline = async (id: string, deadline: string): Promise<void> => {
    try {
      await updateProjectMutation.mutateAsync({ id, deadline: deadline || null })
      showSuccessToast("Project deadline updated successfully")
    } catch {
      await showError("Update Failed", "Failed to update project deadline.")
    }
  }

  const handleUpdateTaskPriority = async (id: string, priority: string): Promise<void> => {
    try {
      await updateTaskMutation.mutateAsync({ id, priority })
      showSuccessToast("Task priority updated successfully")
    } catch {
      await showError("Update Failed", "Failed to update task priority.")
    }
  }

  const handleUpdateProjectName = async (id: string, name: string): Promise<void> => {
    if (!name.trim()) return
    try {
      await updateProjectMutation.mutateAsync({ id, name: name.trim() })
      showSuccessToast("Project name updated successfully")
    } catch {
      await showError("Update Failed", "Failed to update project name.")
    }
  }

  const handleUpdateProjectDesc = async (id: string, description: string | null): Promise<void> => {
    try {
      await updateProjectMutation.mutateAsync({ id, description: description ? description.trim() : null })
      showSuccessToast("Project description updated successfully")
    } catch {
      await showError("Update Failed", "Failed to update project description.")
    }
  }

  const handleUpdateTaskName = async (id: string, name: string): Promise<void> => {
    if (!name.trim()) return
    try {
      await updateTaskMutation.mutateAsync({ id, name: name.trim() })
      showSuccessToast("Task name updated successfully")
    } catch {
      await showError("Update Failed", "Failed to update task name.")
    }
  }

  return {
    projectsList,
    isLoading,
    isError,
    selectedProjectId,
    setSelectedProjectId,
    showAddProject,
    setShowAddProject,
    projectName,
    setProjectName,
    projectDesc,
    setProjectDesc,
    projectPriority,
    setProjectPriority,
    projectStatus,
    setProjectStatus,
    projectDeadline,
    setProjectDeadline,
    projectError,
    taskName,
    setTaskName,
    taskPriority,
    setTaskPriority,
    taskDeadline,
    setTaskDeadline,
    taskError,
    activeProject,
    handleAddProject,
    handleDeleteProject,
    handleAddTask,
    handleDeleteTask,
    handleToggleTask,
    handleUpdateProjectStatus,
    handleUpdateProjectPriority,
    handleUpdateTaskPriority,
    handleUpdateProjectDeadline,
    handleUpdateProjectName,
    handleUpdateProjectDesc,
    handleUpdateTaskName,
    
    // Subtask helpers
    subTaskInputs,
    setSubTaskInputs,
    subTaskErrors,
    handleAddSubTask,
    handleDeleteSubTask,
    handleToggleSubTask,

    isPendingProjectCreate: createProjectMutation.isPending,
    isPendingProjectDelete: deleteProjectMutation.isPending,
    isPendingTaskCreate: createTaskMutation.isPending,
    isPendingTaskDelete: deleteTaskMutation.isPending,
    isPendingTaskToggle: toggleTaskMutation.isPending,
    isPendingSubTaskCreate: createSubTaskMutation.isPending,
    isPendingSubTaskDelete: deleteSubTaskMutation.isPending,
    isPendingSubTaskToggle: toggleSubTaskMutation.isPending,
    isPendingProjectUpdate: updateProjectMutation.isPending,
    isPendingTaskUpdate: updateTaskMutation.isPending,
  }
}

export type UseProjectsPageReturn = ReturnType<typeof useProjectsPage>
