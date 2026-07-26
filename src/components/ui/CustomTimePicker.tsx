"use client"

import React, { useState, useRef, useEffect, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
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

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

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
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const hourScrollRef = useRef<HTMLDivElement>(null)
  const minuteScrollRef = useRef<HTMLDivElement>(null)

  // Split value into hour and minute
  const [hourStr, minuteStr] = value ? value.split(":") : ["", ""]
  const currentHour = hourStr ? parseInt(hourStr, 10) : null
  const currentMinute = minuteStr ? parseInt(minuteStr, 10) : null

  // Position updates on scroll / resize / open
  useEffect(() => {
    if (!isOpen || !isMounted) return

    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setCoords({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        })
      }
    }

    // Set initial position immediately
    updatePosition()

    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)

    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [isOpen, isMounted])

  // Close popover when clicking outside (supporting React Portal)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const clickedInsideInput = containerRef.current && containerRef.current.contains(target)
      const clickedInsidePopover = popoverRef.current && popoverRef.current.contains(target)

      if (!clickedInsideInput && !clickedInsidePopover) {
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

  const popoverContent = isOpen && coords && (
    <div
      ref={popoverRef}
      id={`${id || "time-picker"}-popover`}
      style={{
        position: "absolute",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        opacity: 1,
        zIndex: 9999,
      }}
      className="flex gap-2 rounded-2xl border border-border bg-white dark:bg-slate-950 p-3 shadow-2xl w-52 justify-between"
    >
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
  )

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-label="Select or enter time in HH:MM format"
          aria-expanded={isOpen}
          aria-controls={`${id || "time-picker"}-popover`}
          aria-haspopup="dialog"
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

      {isMounted && isOpen && coords && createPortal(popoverContent, document.body)}
    </div>
  )
}
