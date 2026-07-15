import { useState } from "react"
import {
  useLearningSubjectsQuery,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  useCreateLearningTaskMutation,
  useUpdateLearningTaskMutation,
  useDeleteLearningTaskMutation,
} from "./useLearning"
import { confirmDestructive, showSuccessToast, showErrorToast } from "@/lib/sweetalert"

export function useLearningSubjectPage(subjectId: string) {
  const { data: subjects = [], isLoading, isError } = useLearningSubjectsQuery()
  
  const subject = subjects.find((s) => s.id === subjectId) || null

  // Mutations
  const updateSubjectMutation = useUpdateSubjectMutation()
  const deleteSubjectMutation = useDeleteSubjectMutation()

  const createMaterialMutation = useCreateMaterialMutation()
  const updateMaterialMutation = useUpdateMaterialMutation()
  const deleteMaterialMutation = useDeleteMaterialMutation()

  const createTaskMutation = useCreateLearningTaskMutation()
  const updateTaskMutation = useUpdateLearningTaskMutation()
  const deleteTaskMutation = useDeleteLearningTaskMutation()

  // Form states - Subject edit
  const [showEditModal, setShowEditModal] = useState(false)
  const [subjectName, setSubjectName] = useState("")
  const [subjectDesc, setSubjectDesc] = useState("")
  const [subjectStatus, setSubjectStatus] = useState<"Planned" | "Learning" | "Completed">("Learning")
  const [subjectColor, setSubjectColor] = useState("#8b5cf6")

  // Form states - Material
  const [matTitle, setMatTitle] = useState("")
  const [matNotes, setMatNotes] = useState("")
  const [matLink, setMatLink] = useState("")

  // Form states - Task
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDueDate, setTaskDueDate] = useState("")

  const handleOpenEdit = () => {
    if (!subject) return
    setSubjectName(subject.name)
    setSubjectDesc(subject.description || "")
    setSubjectStatus(subject.status)
    setSubjectColor(subject.color)
    setShowEditModal(true)
  }

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectName.trim()) return

    try {
      await updateSubjectMutation.mutateAsync({
        id: subjectId,
        name: subjectName.trim(),
        description: subjectDesc.trim() || null,
        status: subjectStatus,
        color: subjectColor,
      })
      showSuccessToast("Subject updated successfully")
      setShowEditModal(false)
    } catch {
      showErrorToast("Failed to update subject")
    }
  }

  const handleDeleteSubject = async (): Promise<boolean> => {
    if (!subject) return false
    const isConfirmed = await confirmDestructive(
      "Delete Learning Subject",
      `Are you sure you want to delete "${subject.name}" and all of its materials and tasks?`
    )

    if (isConfirmed) {
      try {
        await deleteSubjectMutation.mutateAsync(subjectId)
        showSuccessToast("Subject deleted successfully")
        return true
      } catch {
        showErrorToast("Failed to delete subject")
      }
    }
    return false
  }

  // Material Actions
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!matTitle.trim()) return

    try {
      await createMaterialMutation.mutateAsync({
        subjectId,
        title: matTitle.trim(),
        notes: matNotes.trim() || null,
        linkUrl: matLink.trim() || null,
      })
      setMatTitle("")
      setMatNotes("")
      setMatLink("")
      showSuccessToast("Material added successfully")
    } catch {
      showErrorToast("Failed to add material")
    }
  }

  const handleToggleMaterialStatus = async (id: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === "Completed"
        ? "Not Started"
        : currentStatus === "In Progress"
        ? "Completed"
        : "In Progress"

    try {
      await updateMaterialMutation.mutateAsync({
        id,
        status: nextStatus as "Not Started" | "In Progress" | "Completed",
      })
    } catch {
      showErrorToast("Failed to update status")
    }
  }

  const handleDeleteMaterial = async (id: string) => {
    const isConfirmed = await confirmDestructive(
      "Delete Material",
      "Are you sure you want to delete this learning material?"
    )

    if (isConfirmed) {
      try {
        await deleteMaterialMutation.mutateAsync(id)
        showSuccessToast("Material deleted successfully")
      } catch {
        showErrorToast("Failed to delete material")
      }
    }
  }

  // Task Actions
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    try {
      await createTaskMutation.mutateAsync({
        subjectId,
        title: taskTitle.trim(),
        dueDate: taskDueDate || null,
      })
      setTaskTitle("")
      setTaskDueDate("")
      showSuccessToast("Task added successfully")
    } catch {
      showErrorToast("Failed to add task")
    }
  }

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      await updateTaskMutation.mutateAsync({
        id,
        completed: !completed,
      })
    } catch {
      showErrorToast("Failed to update task status")
    }
  }

  const handleDeleteTask = async (id: string) => {
    const isConfirmed = await confirmDestructive(
      "Delete Task",
      "Are you sure you want to delete this task?"
    )

    if (isConfirmed) {
      try {
        await deleteTaskMutation.mutateAsync(id)
        showSuccessToast("Task deleted successfully")
      } catch {
        showErrorToast("Failed to delete task")
      }
    }
  }

  return {
    subject,
    isLoading,
    isError,
    // Subject Actions
    showEditModal,
    setShowEditModal,
    handleOpenEdit,
    handleSaveSubject,
    handleDeleteSubject,
    // Subject Form States
    subjectName,
    setSubjectName,
    subjectDesc,
    setSubjectDesc,
    subjectStatus,
    setSubjectStatus,
    subjectColor,
    setSubjectColor,
    // Material states & handlers
    matTitle,
    setMatTitle,
    matNotes,
    setMatNotes,
    matLink,
    setMatLink,
    handleAddMaterial,
    handleToggleMaterialStatus,
    handleDeleteMaterial,
    // Task states & handlers
    taskTitle,
    setTaskTitle,
    taskDueDate,
    setTaskDueDate,
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
  }
}
