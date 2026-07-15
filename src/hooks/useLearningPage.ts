import { useState, useMemo } from "react"
import {
  useLearningSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  useCreateLearningTaskMutation,
  useUpdateLearningTaskMutation,
  useDeleteLearningTaskMutation,
  LearningSubject,
} from "./useLearning"
import { confirmDestructive, showSuccessToast, showErrorToast } from "@/lib/sweetalert"

export function useLearningPage() {
  const { data: subjects = [], isLoading, isError } = useLearningSubjectsQuery()

  // Mutations
  const createSubjectMutation = useCreateSubjectMutation()
  const updateSubjectMutation = useUpdateSubjectMutation()
  const deleteSubjectMutation = useDeleteSubjectMutation()

  const createMaterialMutation = useCreateMaterialMutation()
  const updateMaterialMutation = useUpdateMaterialMutation()
  const deleteMaterialMutation = useDeleteMaterialMutation()

  const createTaskMutation = useCreateLearningTaskMutation()
  const updateTaskMutation = useUpdateLearningTaskMutation()
  const deleteTaskMutation = useDeleteLearningTaskMutation()

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")

  // Modals & Active Subject
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null)
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState<LearningSubject | null>(null)

  // Form states - Subject
  const [subjectName, setSubjectName] = useState("")
  const [subjectDesc, setSubjectDesc] = useState("")
  const [subjectStatus, setSubjectStatus] = useState<"Planned" | "Learning" | "Completed">("Learning")
  const [subjectColor, setSubjectColor] = useState("hsl(var(--primary))")

  // Form states - Material Add
  const [matTitle, setMatTitle] = useState("")
  const [matNotes, setMatNotes] = useState("")
  const [matLink, setMatLink] = useState("")

  // Form states - Task Add
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDueDate, setTaskDueDate] = useState("")

  // Filtered subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subj) => {
      const matchesSearch =
        subj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (subj.description && subj.description.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus =
        statusFilter === "All" || subj.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [subjects, searchQuery, statusFilter])

  // Active Subject Detail
  const activeSubject = useMemo(() => {
    return subjects.find((s) => s.id === activeSubjectId) || null
  }, [subjects, activeSubjectId])

  // Subject Actions
  const handleOpenAddSubject = () => {
    setEditingSubject(null)
    setSubjectName("")
    setSubjectDesc("")
    setSubjectStatus("Learning")
    setSubjectColor("hsl(var(--primary))")
    setShowAddSubjectModal(true)
  }

  const handleOpenEditSubject = (subj: LearningSubject, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSubject(subj)
    setSubjectName(subj.name)
    setSubjectDesc(subj.description || "")
    setSubjectStatus(subj.status)
    setSubjectColor(subj.color)
    setShowAddSubjectModal(true)
  }

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectName.trim()) return

    try {
      if (editingSubject) {
        await updateSubjectMutation.mutateAsync({
          id: editingSubject.id,
          name: subjectName.trim(),
          description: subjectDesc.trim() || null,
          status: subjectStatus,
          color: subjectColor,
        })
        showSuccessToast("Subject updated successfully")
      } else {
        await createSubjectMutation.mutateAsync({
          name: subjectName.trim(),
          description: subjectDesc.trim() || null,
          status: subjectStatus,
          color: subjectColor,
        })
        showSuccessToast("Subject added successfully")
      }
      setShowAddSubjectModal(false)
    } catch {
      showErrorToast("Failed to save subject")
    }
  }

  const handleDeleteSubject = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const isConfirmed = await confirmDestructive(
      "Delete Learning Subject",
      `Are you sure you want to delete "${name}" and all of its materials and tasks?`
    )

    if (isConfirmed) {
      try {
        await deleteSubjectMutation.mutateAsync(id)
        if (activeSubjectId === id) {
          setActiveSubjectId(null)
        }
        showSuccessToast("Subject deleted successfully")
      } catch {
        showErrorToast("Failed to delete subject")
      }
    }
  }

  // Material Actions
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSubjectId || !matTitle.trim()) return

    try {
      await createMaterialMutation.mutateAsync({
        subjectId: activeSubjectId,
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
    if (!activeSubjectId || !taskTitle.trim()) return

    try {
      await createTaskMutation.mutateAsync({
        subjectId: activeSubjectId,
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
    subjects,
    filteredSubjects,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    activeSubjectId,
    setActiveSubjectId,
    activeSubject,
    showAddSubjectModal,
    setShowAddSubjectModal,
    editingSubject,

    // Form inputs Subject
    subjectName,
    setSubjectName,
    subjectDesc,
    setSubjectDesc,
    subjectStatus,
    setSubjectStatus,
    subjectColor,
    setSubjectColor,

    // Form inputs Material
    matTitle,
    setMatTitle,
    matNotes,
    setMatNotes,
    matLink,
    setMatLink,

    // Form inputs Task
    taskTitle,
    setTaskTitle,
    taskDueDate,
    setTaskDueDate,

    // Subject Handlers
    handleOpenAddSubject,
    handleOpenEditSubject,
    handleSaveSubject,
    handleDeleteSubject,
    isSaveSubjectPending: createSubjectMutation.isPending || updateSubjectMutation.isPending,

    // Material Handlers
    handleAddMaterial,
    handleToggleMaterialStatus,
    handleDeleteMaterial,

    // Task Handlers
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
  }
}
