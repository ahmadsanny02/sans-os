"use client"

import React, { useEffect } from "react"
import { LearningWorkspace } from "./ui/LearningWorkspace"

export default function LearningComponent() {
  useEffect(() => {
    document.title = "Learning Hub — SansOS Workspace"
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <LearningWorkspace />
    </div>
  )
}
