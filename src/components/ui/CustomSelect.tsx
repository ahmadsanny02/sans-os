"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"

export interface SelectOption {
  value: string | number
  label: string
  icon?: React.ReactNode
  dotClass?: string
}

interface CustomSelectProps {
  value: string | number
  onChange: (value: any) => void
  options: SelectOption[]
  label?: string
  placeholder?: string
  className?: string
  triggerClassName?: string
  dropdownClassName?: string
  size?: "sm" | "md"
  fullWidth?: boolean
  disabled?: boolean
  id?: string
}

export function CustomSelect({
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
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isFullWidth = fullWidth || className.includes("w-full")

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value)
  )

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
      className={`relative ${
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
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full inline-flex items-center justify-between gap-2 border border-border/80 bg-background/60 dark:bg-card/40 hover:bg-card/90 text-foreground transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${triggerClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate flex items-center gap-2 font-medium">
          {selectedOption?.dotClass && (
            <span className={`h-2 w-2 rounded-full shrink-0 ${selectedOption.dotClass}`} />
          )}
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : placeholder}
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
          className={`absolute top-full left-0 mt-1.5 z-50 max-h-60 overflow-y-auto rounded-xl border border-border/80 bg-card/95 p-1.5 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
            isFullWidth ? "w-full min-w-full" : "min-w-[140px] right-0 sm:left-auto"
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

