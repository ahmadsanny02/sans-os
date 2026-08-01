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
  LearningMaterial,
  LearningTask,
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

  // Form states - Material
  const [matTitle, setMatTitle] = useState("")
  const [matNotes, setMatNotes] = useState("")
  const [matLink, setMatLink] = useState("")

  // Form states - Task
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDueDate, setTaskDueDate] = useState("")

  // Edit Material State
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null)
  const [showEditMaterialModal, setShowEditMaterialModal] = useState(false)
  const [editMatTitle, setEditMatTitle] = useState("")
  const [editMatNotes, setEditMatNotes] = useState("")
  const [editMatLink, setEditMatLink] = useState("")

  // Edit Task State
  const [editingTask, setEditingTask] = useState<LearningTask | null>(null)
  const [showEditTaskModal, setShowEditTaskModal] = useState(false)
  const [editTaskTitle, setEditTaskTitle] = useState("")
  const [editTaskDueDate, setEditTaskDueDate] = useState("")

  const handleOpenEdit = () => {
    if (!subject) return
    setSubjectName(subject.name)
    setSubjectDesc(subject.description || "")
    setSubjectStatus(subject.status)
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
        color: "primary",
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

  const handleOpenEditMaterial = (mat: LearningMaterial) => {
    setEditingMaterial(mat)
    setEditMatTitle(mat.title)
    setEditMatNotes(mat.notes || "")
    setEditMatLink(mat.linkUrl || "")
    setShowEditMaterialModal(true)
  }

  const handleSaveEditMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMaterial || !editMatTitle.trim()) return

    try {
      await updateMaterialMutation.mutateAsync({
        id: editingMaterial.id,
        title: editMatTitle.trim(),
        notes: editMatNotes.trim() || null,
        linkUrl: editMatLink.trim() || null,
      })
      showSuccessToast("Material updated successfully")
      setShowEditMaterialModal(false)
      setEditingMaterial(null)
    } catch {
      showErrorToast("Failed to update material")
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

  const handleOpenEditTask = (task: LearningTask) => {
    setEditingTask(task)
    setEditTaskTitle(task.title)
    setEditTaskDueDate(
      task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
    )
    setShowEditTaskModal(true)
  }

  const handleSaveEditTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask || !editTaskTitle.trim()) return

    try {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        title: editTaskTitle.trim(),
        dueDate: editTaskDueDate || null,
      })
      showSuccessToast("Task updated successfully")
      setShowEditTaskModal(false)
      setEditingTask(null)
    } catch {
      showErrorToast("Failed to update task")
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
    // Material Edit States & Handlers
    showEditMaterialModal,
    setShowEditMaterialModal,
    editMatTitle,
    setEditMatTitle,
    editMatNotes,
    setEditMatNotes,
    editMatLink,
    setEditMatLink,
    handleOpenEditMaterial,
    handleSaveEditMaterial,
    // Task Edit States & Handlers
    showEditTaskModal,
    setShowEditTaskModal,
    editTaskTitle,
    setEditTaskTitle,
    editTaskDueDate,
    setEditTaskDueDate,
    handleOpenEditTask,
    handleSaveEditTask,
  }
}
