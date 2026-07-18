"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"

export interface SelectOption {
  value: string | number
  label: string
}

interface CustomSelectProps {
  value: string | number
  onChange: (value: string | number) => void
  options: SelectOption[]
  label?: string
  placeholder?: string
  className?: string
}

export function CustomSelect({
  value,
  onChange,
  options,
  label,
  placeholder = "Select...",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

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

  return (
    <div ref={containerRef} className={`relative inline-flex items-center gap-1.5 ${className}`}>
      {label && (
        <span className="text-xs font-bold text-muted-foreground select-none shrink-0">
          {label}
        </span>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full inline-flex items-center justify-between gap-1.5 rounded-xl border border-border/80 bg-card/60 hover:bg-card/90 px-2.5 py-1.5 text-xs font-bold text-foreground transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/40 cursor-pointer min-w-[75px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full right-0 sm:left-0 mt-1.5 z-50 min-w-[130px] max-h-60 overflow-y-auto rounded-xl border border-border/80 bg-card/95 p-1.5 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div role="listbox" className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-primary/15 text-primary font-extrabold"
                      : "text-foreground font-semibold hover:bg-primary/10 hover:text-primary"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
