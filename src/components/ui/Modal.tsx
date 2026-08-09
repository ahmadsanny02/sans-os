import React, { useEffect, useRef, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: React.ReactNode
  icon?: React.ReactNode
  children: React.ReactNode
  maxWidth?: string // e.g. "max-w-lg", "max-w-md", "max-w-xl", "max-w-2xl"
}

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth = "max-w-lg",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !isMounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl backdrop-blur-md space-y-4 animate-in zoom-in-95 duration-200`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-5 top-5 p-1 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header title */}
        {title && (
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/40 pb-2.5 select-none w-[90%]">
            {icon && <span className="shrink-0">{icon}</span>}
            {title}
          </h3>
        )}

        {/* Modal content */}
        <div className="pt-1">{children}</div>
      </div>
    </div>,
    document.body
  )
}
