"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  isSameMonth,
} from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface CalendarDatePickerProps {
  selectedDate: string // YYYY-MM-DD
  onDateChange: (date: string) => void
}

export function CalendarDatePicker({ selectedDate, onDateChange }: CalendarDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const parsedSelectedDate = parseISO(selectedDate)
  const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate)
  const [viewedMonth, setViewedMonth] = useState<Date>(parsedSelectedDate)

  if (selectedDate !== prevSelectedDate) {
    setPrevSelectedDate(selectedDate)
    setViewedMonth(parseISO(selectedDate))
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handlePrevMonth = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setViewedMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setViewedMonth((prev) => addMonths(prev, 1))
  }

  const handleDaySelect = (day: Date, e: React.MouseEvent): void => {
    e.stopPropagation()
    onDateChange(format(day, "yyyy-MM-dd"))
    setIsOpen(false)
  }

  const monthStart = startOfMonth(viewedMonth)
  const monthEnd = endOfMonth(monthStart)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)

  const daysGrid = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const formattedActiveDate = format(parsedSelectedDate, "MMMM d, yyyy")

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold shadow-sm hover:border-sidebar-primary/50 hover:bg-muted transition-all active:scale-[0.98]"
        aria-label="Select Date"
        aria-expanded={isOpen}
      >
        <CalendarIcon className="h-4.5 w-4.5 text-violet-500" />
        <span className="text-foreground">{formattedActiveDate}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 mt-2 z-50 w-76 rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md dark:bg-card/90"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-border/40">
              <span className="text-sm font-bold text-foreground">
                {format(viewedMonth, "MMMM yyyy")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center py-2 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
              {weekdays.map((day) => (
                <div key={day} className="h-6 flex items-center justify-center">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {daysGrid.map((day, idx) => {
                const isSelected = isSameDay(day, parsedSelectedDate)
                const isCurrentMonth = isSameMonth(day, viewedMonth)
                const currentDay = isToday(day)

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => handleDaySelect(day, e)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all relative ${
                      !isCurrentMonth
                        ? "text-muted-foreground/30 hover:bg-muted/30"
                        : "text-foreground"
                    } ${
                      isSelected
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-bold shadow-md hover:bg-sidebar-primary"
                        : !isSelected && currentDay
                        ? "border border-sidebar-primary/50 text-sidebar-primary font-bold"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span>{format(day, "d")}</span>
                    {currentDay && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sidebar-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
