"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"

export interface SelectOption<T = string | number> {
  value: T
  label: string
  icon?: React.ReactNode
  dotClass?: string
}

interface CustomSelectProps<T = string | number> {
  value: T
  onChange: (value: T) => void
  options: SelectOption<T>[]
  label?: string
  placeholder?: string
  className?: string
  triggerClassName?: string
  dropdownClassName?: string
  size?: "sm" | "md"
  fullWidth?: boolean
  disabled?: boolean
  id?: string
  align?: "left" | "right" | "auto"
  placement?: "auto" | "top" | "bottom"
}

export function CustomSelect<T extends string | number = string | number>({
  value,
  onChange,
  options,
  label,
  placeholder = "Select...",
  className = "",
  triggerClassName = "",
  dropdownClassName = "",
  size = "md",
  fullWidth = false,
  disabled = false,
  id,
  align = "auto",
  placement = "auto",
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isFullWidth = fullWidth || className.includes("w-full")

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value)
  )

  const handleToggle = () => {
    if (disabled) return
    if (!isOpen) {
      if (placement === "top") {
        setOpenUpward(true)
      } else if (placement === "bottom") {
        setOpenUpward(false)
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top

        // Check if closest element with scroll/hidden overflow restricts space below
        let parent = containerRef.current.parentElement
        let containerSpaceBelow = spaceBelow
        while (parent && parent !== document.body) {
          const style = window.getComputedStyle(parent)
          if (
            style.overflow !== "visible" ||
            style.overflowY !== "visible" ||
            style.overflowX !== "visible"
          ) {
            const parentRect = parent.getBoundingClientRect()
            containerSpaceBelow = Math.min(containerSpaceBelow, parentRect.bottom - rect.bottom)
            break
          }
          parent = parent.parentElement
        }

        const neededHeight = Math.min(options.length * 40 + 24, 240)
        setOpenUpward(containerSpaceBelow < neededHeight && spaceAbove > neededHeight)
      }
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs rounded-xl min-h-[34px]",
    md: "px-3.5 py-2.5 text-xs sm:text-sm rounded-xl min-h-[42px]",
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${isOpen ? "z-30" : ""} ${
        isFullWidth ? "w-full flex flex-col gap-1.5" : "inline-flex items-center gap-1.5"
      } ${className}`}
    >
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-bold text-muted-foreground select-none shrink-0"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full inline-flex items-center justify-between gap-2 border border-border/80 bg-background/60 dark:bg-card/40 hover:bg-card/90 text-foreground transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${triggerClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate flex items-center gap-2 font-medium">
          {selectedOption?.dotClass && (
            <span className={`h-2 w-2 rounded-full shrink-0 ${selectedOption.dotClass}`} />
          )}
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : (value !== undefined && value !== null && value !== "" ? String(value) : placeholder)}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute ${
            openUpward ? "bottom-full mb-1.5 origin-bottom" : "top-full mt-1.5 origin-top"
          } left-0 z-50 max-h-60 overflow-y-auto rounded-xl border border-border/80 bg-card p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
            isFullWidth
              ? "w-full min-w-full"
              : align === "right"
              ? "min-w-[140px] right-0 left-auto"
              : align === "left"
              ? "min-w-[140px] left-0 right-auto"
              : "min-w-[140px] right-0 sm:left-auto"
          } ${dropdownClassName}`}
        >
          <div role="listbox" className="space-y-0.5">
            {options.map((option) => {
              const isSelected = String(option.value) === String(value)
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-primary/15 text-primary font-bold"
                      : "text-foreground font-medium hover:bg-primary/10 hover:text-primary"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="truncate flex items-center gap-2">
                    {option.dotClass && (
                      <span className={`h-2 w-2 rounded-full shrink-0 ${option.dotClass}`} />
                    )}
                    {option.icon}
                    {option.label}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

