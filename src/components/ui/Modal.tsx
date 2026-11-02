import React, { useEffect, useId, useRef, useState, useSyncExternalStore } from "react"
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

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal(props: ModalProps) {
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!props.isOpen || !isMounted) return null

  return createPortal(<ModalDialog {...props} />, document.body)
}

// Mounts only while open, so the state initializer captures focus before any autoFocus child takes it.
function ModalDialog({
  onClose,
  title,
  icon,
  children,
  maxWidth = "max-w-lg",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const [previousFocus] = useState(() => document.activeElement as HTMLElement | null)

  // Move focus into the modal, and give it back on close
  useEffect(() => {
    if (!modalRef.current?.contains(document.activeElement)) {
      modalRef.current?.focus()
    }
    return () => previousFocus?.focus()
  }, [previousFocus])

  // Close on Escape, keep Tab inside the modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
        return
      }
      const modal = modalRef.current
      if (event.key !== "Tab" || !modal) return

      const active = document.activeElement
      // Focus in an overlay above the modal (e.g. SweetAlert) is that overlay's to manage
      if (active && active !== document.body && !modal.contains(active)) return

      const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0
      )
      if (focusable.length === 0) {
        event.preventDefault()
        modal.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (active === first || active === modal || active === document.body)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || active === document.body)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl backdrop-blur-md space-y-4 outline-none animate-in zoom-in-95 duration-200`}
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
          <h3 id={titleId} className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/40 pb-2.5 select-none w-[90%]">
            {icon && <span className="shrink-0">{icon}</span>}
            {title}
          </h3>
        )}

        {/* Modal content */}
        <div className="pt-1">{children}</div>
      </div>
    </div>
  )
}
