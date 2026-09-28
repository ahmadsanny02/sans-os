"use client"

import React from "react"
import { Check, CalendarDays } from "lucide-react"
import { useWorkspaceStore } from "@/store/workspaceStore"

export interface DayOption {
  value: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  labelEn: string
  labelId: string
  shortEn: string
  shortId: string
}

export const DAYS_LIST: DayOption[] = [
  { value: 1, labelEn: "Monday", labelId: "Senin", shortEn: "Mon", shortId: "Sen" },
  { value: 2, labelEn: "Tuesday", labelId: "Selasa", shortEn: "Tue", shortId: "Sel" },
  { value: 3, labelEn: "Wednesday", labelId: "Rabu", shortEn: "Wed", shortId: "Rab" },
  { value: 4, labelEn: "Thursday", labelId: "Kamis", shortEn: "Thu", shortId: "Kam" },
  { value: 5, labelEn: "Friday", labelId: "Jumat", shortEn: "Fri", shortId: "Jum" },
  { value: 6, labelEn: "Saturday", labelId: "Sabtu", shortEn: "Sat", shortId: "Sab" },
  { value: 0, labelEn: "Sunday", labelId: "Minggu", shortEn: "Sun", shortId: "Min" },
]

export interface DayOfWeekChecklistProps {
  selectedDays: number[]
  onChange: (days: number[]) => void
  label?: string
  description?: string
  error?: string | null
}

export function DayOfWeekChecklist({
  selectedDays,
  onChange,
  label = "Pilih Hari (Checklist)",
  description = "Centang hari-hari tertentu jadwal ini akan aktif",
  error,
}: DayOfWeekChecklistProps): React.JSX.Element {
  const startOfWeek = useWorkspaceStore((state) => state.userConfig.startOfWeek)

  const orderedDays = React.useMemo(() => {
    if (startOfWeek === 0) {
      // Sunday first
      return [
        DAYS_LIST[6], // Sunday
        DAYS_LIST[0], // Monday
        DAYS_LIST[1], // Tuesday
        DAYS_LIST[2], // Wednesday
        DAYS_LIST[3], // Thursday
        DAYS_LIST[4], // Friday
        DAYS_LIST[5], // Saturday
      ]
    }
    // Monday first
    return DAYS_LIST
  }, [startOfWeek])

  const toggleDay = (dayValue: number): void => {
    if (selectedDays.includes(dayValue)) {
      onChange(selectedDays.filter((d) => d !== dayValue))
    } else {
      const nextDays = [...selectedDays, dayValue]
      const orderMap = orderedDays.map((d) => d.value)
      nextDays.sort((a, b) => orderMap.indexOf(a) - orderMap.indexOf(b))
      onChange(nextDays)
    }
  }

  const selectPreset = (presetValues: number[]): void => {
    onChange(presetValues)
  }

  // Generate dynamic human-readable summary
  const summaryText = React.useMemo((): string => {
    if (selectedDays.length === 0) {
      return "Belum ada hari yang dipilih (Pilih minimal 1 hari)"
    }
    if (selectedDays.length === 7) {
      return "Setiap hari (Senin - Minggu)"
    }
    const isWorkdays =
      selectedDays.length === 5 &&
      [1, 2, 3, 4, 5].every((d) => selectedDays.includes(d))
    if (isWorkdays) {
      return "Hari kerja (Senin - Jumat)"
    }
    const isWeekend =
      selectedDays.length === 2 &&
      [6, 0].every((d) => selectedDays.includes(d))
    if (isWeekend) {
      return "Akhir pekan (Sabtu & Minggu)"
    }

    // List individual day names in Indonesian
    const names = orderedDays
      .filter((d) => selectedDays.includes(d.value))
      .map((d) => d.labelId)
      .join(", ")

    return `${names} (${selectedDays.length} hari)`
  }, [selectedDays, orderedDays])

  return (
    <div className="space-y-2">
      {/* Header with Title and Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        <div>
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <span>{label}</span>
          </label>
          {description && (
            <p className="text-[11px] text-muted-foreground/80 mt-0.5">{description}</p>
          )}
        </div>

        {/* Quick Presets */}
        <div className="flex items-center flex-wrap gap-1">
          <button
            type="button"
            onClick={() => selectPreset([1, 2, 3, 4, 5])}
            className="text-[10px] font-medium px-2 py-0.5 rounded-lg border border-border/60 bg-card/40 hover:bg-card/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            Senin-Jumat
          </button>
          <button
            type="button"
            onClick={() => selectPreset([6, 0])}
            className="text-[10px] font-medium px-2 py-0.5 rounded-lg border border-border/60 bg-card/40 hover:bg-card/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            Weekend
          </button>
          <button
            type="button"
            onClick={() => selectPreset([1, 2, 3, 4, 5, 6, 0])}
            className="text-[10px] font-medium px-2 py-0.5 rounded-lg border border-border/60 bg-card/40 hover:bg-card/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            Semua
          </button>
          {selectedDays.length > 0 && (
            <button
              type="button"
              onClick={() => selectPreset([])}
              className="text-[10px] font-medium px-2 py-0.5 rounded-lg border border-border/60 bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {orderedDays.map((day) => {
          const isSelected = selectedDays.includes(day.value)
          return (
            <button
              key={day.value}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggleDay(day.value)}
              className={`flex items-center gap-2 p-2 sm:px-2.5 sm:py-2 rounded-xl border text-left transition-all duration-150 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/20"
                  : "border-border/60 bg-card/25 hover:border-border hover:bg-card/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {/* Checkbox indicator */}
              <div
                className={`h-4 w-4 shrink-0 rounded-md border flex items-center justify-center transition-colors ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-background/50 text-transparent"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
              </div>

              {/* Day Labels */}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold leading-tight truncate">
                  {day.labelId}
                </span>
                <span className="text-[10px] text-muted-foreground opacity-75 leading-none truncate">
                  {day.shortEn}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Summary / Helper Text */}
      <div className="flex items-center justify-between text-[11px] px-1 pt-0.5">
        <span
          className={
            selectedDays.length === 0
              ? "text-destructive font-medium"
              : "text-muted-foreground font-medium"
          }
        >
          {summaryText}
        </span>
        {selectedDays.length > 0 && (
          <span className="text-xs font-bold text-primary">
            {selectedDays.length}/7 hari
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive font-semibold">{error}</p>
      )}
    </div>
  )
}
