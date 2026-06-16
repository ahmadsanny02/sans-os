"use client"

import React, { useState, useRef } from "react"
import {
  useVisionBoardQuery,
  useCreateVisionBoardItemMutation,
  useUpdateVisionBoardItemMutation,
  useDeleteVisionBoardItemMutation,
  VisionBoardItem,
} from "@/hooks/useVisionBoard"
import { PanInfo } from "framer-motion"
import { useQueryClient } from "@tanstack/react-query"
import { confirmDestructive, showError, showSuccessToast } from "@/lib/sweetalert"

export function useVisionBoardPage() {
  const queryClient = useQueryClient()
  const { data: boardItems = [], isLoading, isError } = useVisionBoardQuery()
  const createItemMutation = useCreateVisionBoardItemMutation()
  const updateItemMutation = useUpdateVisionBoardItemMutation()
  const deleteItemMutation = useDeleteVisionBoardItemMutation()

  // References
  const canvasRef = useRef<HTMLDivElement>(null)

  // Floating controls popup state
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [itemType, setItemType] = useState<"text" | "image">("text")
  const [content, setContent] = useState("")
  const [width, setWidth] = useState(220)
  const [height, setHeight] = useState(160)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleAddItem = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setErrorMsg(null)

    if (!content.trim()) {
      setErrorMsg("Please enter content or select a preset.")
      return
    }

    try {
      await createItemMutation.mutateAsync({
        type: itemType,
        content: content.trim(),
        xOffset: Math.round(50 + Math.random() * 80),
        yOffset: Math.round(60 + Math.random() * 80),
        width: Number(width),
        height: Number(height),
      })
      setContent("")
      setShowAddMenu(false)
      showSuccessToast("Vision item added to canvas")
    } catch {
      setErrorMsg("Failed to add item to board.")
    }
  }

  const handleApplyPreset = (url: string): void => {
    setItemType("image")
    setContent(url)
    setWidth(240)
    setHeight(160)
  }

  const handleDeleteItem = async (id: string, e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    const confirmed = await confirmDestructive(
      "Delete Item?",
      "Are you sure you want to delete this vision board item?"
    )
    if (!confirmed) return
    try {
      await deleteItemMutation.mutateAsync(id)
      showSuccessToast("Item deleted successfully")
    } catch {
      await showError("Deletion Failed", "Failed to delete vision item.")
    }
  }

  const handleDragEnd = (item: VisionBoardItem, info: PanInfo): void => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    const newX = Math.round(item.xOffset + info.offset.x)
    const newY = Math.round(item.yOffset + info.offset.y)

    const maxBoundX = Math.max(0, canvasEl.offsetWidth - item.width)
    const maxBoundY = Math.max(0, 650 - item.height)

    const constrainedX = Math.max(0, Math.min(maxBoundX, newX))
    const constrainedY = Math.max(0, Math.min(maxBoundY, newY))

    queryClient.setQueryData<VisionBoardItem[]>(["vision-board"], (old) => {
      if (!old) return []
      return old.map((i) =>
        i.id === item.id ? { ...i, xOffset: constrainedX, yOffset: constrainedY } : i
      )
    })

    updateItemMutation.mutate({
      id: item.id,
      xOffset: constrainedX,
      yOffset: constrainedY,
    })
  }

  return {
    boardItems,
    isLoading,
    isError,
    canvasRef,
    showAddMenu,
    setShowAddMenu,
    itemType,
    setItemType,
    content,
    setContent,
    width,
    setWidth,
    height,
    setHeight,
    errorMsg,
    handleAddItem,
    handleApplyPreset,
    handleDeleteItem,
    handleDragEnd,
    isPendingCreate: createItemMutation.isPending,
    isPendingUpdate: updateItemMutation.isPending,
    isPendingDelete: deleteItemMutation.isPending,
  }
}

export type UseVisionBoardPageReturn = ReturnType<typeof useVisionBoardPage>
