"use client"

import React, { useState, useRef, useEffect } from "react"
import { Clock } from "lucide-react"

interface CustomTimePickerProps {
  value: string // Format: "HH:MM" (24h)
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  placeholder?: string
  className?: string
  inputClassName?: string
  showIcon?: boolean
  id?: string
}

export function CustomTimePicker({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "--:--",
  className = "",
  inputClassName = "",
  showIcon = true,
  id,
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hourScrollRef = useRef<HTMLDivElement>(null)
  const minuteScrollRef = useRef<HTMLDivElement>(null)

  // Split value into hour and minute
  const [hourStr, minuteStr] = value ? value.split(":") : ["", ""]
  const currentHour = hourStr ? parseInt(hourStr, 10) : null
  const currentMinute = minuteStr ? parseInt(minuteStr, 10) : null

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Auto-scroll selected elements into view when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const scrollTimer = setTimeout(() => {
        if (currentHour !== null && hourScrollRef.current) {
          const selectedHourEl = hourScrollRef.current.children[currentHour] as HTMLElement
          if (selectedHourEl) {
            hourScrollRef.current.scrollTop =
              selectedHourEl.offsetTop -
              hourScrollRef.current.clientHeight / 2 +
              selectedHourEl.clientHeight / 2
          }
        }
        if (currentMinute !== null && minuteScrollRef.current) {
          const selectedMinuteEl = minuteScrollRef.current.children[currentMinute] as HTMLElement
          if (selectedMinuteEl) {
            minuteScrollRef.current.scrollTop =
              selectedMinuteEl.offsetTop -
              minuteScrollRef.current.clientHeight / 2 +
              selectedMinuteEl.clientHeight / 2
          }
        }
      }, 50) // Small delay to let the popover mount and paint
      return () => clearTimeout(scrollTimer)
    }
  }, [isOpen, currentHour, currentMinute])

  const handleHourSelect = (h: number) => {
    const nextHour = h.toString().padStart(2, "0")
    const nextMin = minuteStr ? minuteStr.padStart(2, "0") : "00"
    onChange(`${nextHour}:${nextMin}`)
  }

  const handleMinuteSelect = (m: number) => {
    const nextHour = hourStr ? hourStr.padStart(2, "0") : "12"
    const nextMin = m.toString().padStart(2, "0")
    onChange(`${nextHour}:${nextMin}`)
  }

  // Handle typing manually (e.g. validating HH:MM)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value
    // Remove non-digit characters except colon
    inputVal = inputVal.replace(/[^\d:]/g, "")

    // Automatically insert colon if user typing format
    if (inputVal.length === 2 && !inputVal.includes(":")) {
      inputVal = inputVal + ":"
    }

    if (inputVal.length > 5) {
      inputVal = inputVal.slice(0, 5)
    }

    onChange(inputVal)
  }

  // Set default hours and minutes list
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  const defaultInputClass = inputClassName
    ? `w-full border border-border bg-background/60 dark:bg-card/40 hover:bg-card/90 text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/40 font-medium ${inputClassName}`
    : `w-full rounded-xl border border-border bg-background/60 dark:bg-card/40 hover:bg-card/90 text-foreground transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/40 py-2.5 text-xs sm:text-sm font-medium ${
        showIcon ? "pl-10 pr-3.5" : "px-3"
      }`

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onClick={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
          className={defaultInputClass}
        />
        {showIcon && <Clock className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 flex gap-2 rounded-2xl border border-border bg-white dark:bg-[#121420] p-3 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 w-52 justify-between">
          {/* Hours Column */}
          <div className="flex flex-col gap-1 w-[46%]">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center pb-1 select-none border-b border-border/40">Hour</span>
            <div ref={hourScrollRef} className="h-40 overflow-y-auto space-y-0.5 scroll-smooth pr-1">
              {hours.map((h) => {
                const isSelected = currentHour === h
                const valStr = h.toString().padStart(2, "0")
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHourSelect(h)}
                    className={`w-full text-center py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-black"
                        : "text-foreground hover:bg-primary/10 hover:text-primary font-medium"
                    }`}
                  >
                    {valStr}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="w-[1px] bg-border/60 self-stretch my-2 shrink-0" />

          {/* Minutes Column */}
          <div className="flex flex-col gap-1 w-[46%]">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground text-center pb-1 select-none border-b border-border/40">Min</span>
            <div ref={minuteScrollRef} className="h-40 overflow-y-auto space-y-0.5 scroll-smooth pr-1">
              {minutes.map((m) => {
                const isSelected = currentMinute === m
                const valStr = m.toString().padStart(2, "0")
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinuteSelect(m)}
                    className={`w-full text-center py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-black"
                        : "text-foreground hover:bg-primary/10 hover:text-primary font-medium"
                    }`}
                  >
                    {valStr}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
