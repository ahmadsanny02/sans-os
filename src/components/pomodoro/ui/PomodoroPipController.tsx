"use client"

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { usePomodoroStore } from "@/store/pomodoroStore"
import { PomodoroPipView } from "./PomodoroPipView"

interface DocumentPictureInPicture {
  requestWindow: (options: { width: number; height: number }) => Promise<Window>
}

// Global reference to the active PiP window instance (client-side only)
let activePipWindow: Window | null = null

/**
 * Asynchronously opens the Picture-in-Picture window.
 * MUST be invoked directly in a user-gesture event handler (like onClick).
 */
export async function startPip(
  setIsPipActive: (active: boolean) => void,
  setIsPipExpanded: (expanded: boolean) => void
) {
  if (typeof window === "undefined" || !("documentPictureInPicture" in window)) {
    alert("Picture-in-Picture is not supported or not enabled in your browser.")
    return
  }

  if (activePipWindow) {
    try {
      activePipWindow.focus()
    } catch {
      activePipWindow = null
    }
    return
  }

  try {
    // Open the Document PiP window at collapsed circle mode dimensions
    const pipAPI = (window as unknown as { documentPictureInPicture: DocumentPictureInPicture }).documentPictureInPicture
    const win = await pipAPI.requestWindow({
      width: 150,
      height: 150,
    })

    activePipWindow = win

    const targetDoc = win.document
    
    // Copy the active HTML document classes to support dark/light styling correctly
    targetDoc.documentElement.className = document.documentElement.className
    targetDoc.body.className = "bg-zinc-950 text-white select-none overflow-hidden m-0 p-0"
    targetDoc.title = "Pomodoro Timer"

    // Copy stylesheet rules from parent document to PiP document
    Array.from(document.styleSheets).forEach((styleSheet) => {
      try {
        if (styleSheet.cssRules) {
          const newStyle = targetDoc.createElement("style")
          const cssTexts = Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n")
          newStyle.appendChild(targetDoc.createTextNode(cssTexts))
          targetDoc.head.appendChild(newStyle)
        }
      } catch {
        // Handle CORS/cross-origin stylesheet rules reading limitations
        if (styleSheet.href) {
          const newLink = targetDoc.createElement("link")
          newLink.rel = "stylesheet"
          newLink.href = styleSheet.href
          targetDoc.head.appendChild(newLink)
        }
      }
    })

    setIsPipActive(true)
    setIsPipExpanded(false)

    // Reset store state when window is closed manually by the user
    win.addEventListener("pagehide", () => {
      activePipWindow = null
      setIsPipActive(false)
      setIsPipExpanded(false)
    })
  } catch (err) {
    console.error("Failed to open Picture-in-Picture window:", err)
  }
}

/**
 * Controller component rendered in the main DOM tree.
 * Reactively manages portal rendering and resizing for the open PiP window.
 */
export function PomodoroPipController() {
  const isPipActive = usePomodoroStore((s) => s.isPipActive)
  const isPipExpanded = usePomodoroStore((s) => s.isPipExpanded)

  const [container, setContainer] = useState<HTMLElement | null>(null)

  // Listen to isPipActive state to close/initialize container
  useEffect(() => {
    if (!isPipActive && activePipWindow) {
      try {
        activePipWindow.close()
      } catch {}
      activePipWindow = null
    }

    if (isPipActive && activePipWindow) {
      const body = activePipWindow.document.body
      setTimeout(() => setContainer(body), 0)
    } else {
      setTimeout(() => setContainer(null), 0)
    }
  }, [isPipActive])

  // Listen to isPipExpanded state to resize the PiP window frame
  useEffect(() => {
    if (activePipWindow) {
      try {
        if (isPipExpanded) {
          activePipWindow.resizeTo(280, 320)
        } else {
          activePipWindow.resizeTo(150, 150)
        }
      } catch (err) {
        console.warn("Failed to resize PiP window:", err)
      }
    }
  }, [isPipExpanded])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activePipWindow) {
        try {
          activePipWindow.close()
        } catch {}
          activePipWindow = null
      }
    }
  }, [])

  if (!container) return null

  return createPortal(<PomodoroPipView />, container)
}
export default PomodoroPipController
