"use client"

import React, { useEffect } from "react"
import { usePomodoroPage } from "@/hooks/usePomodoroPage"
import { PomodoroConfigView } from "./ui/PomodoroConfigView"

export default function PomodoroComponent() {
  const pageData = usePomodoroPage()

  useEffect(() => {
    document.title = "Pomodoro — SansOS Workspace"
  }, [])

  return <PomodoroConfigView {...pageData} />
}
