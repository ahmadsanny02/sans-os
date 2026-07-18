"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePomodoroStore } from "@/store/pomodoroStore"
import { Clock, Coffee, Plus, Sparkles, X, Flame, CheckCircle2 } from "lucide-react"

export function PomodoroExtendModal() {
  const showExtendModal = usePomodoroStore((s) => s.showExtendModal)
  const sessionCount = usePomodoroStore((s) => s.sessionCount)
  const extendFocusTime = usePomodoroStore((s) => s.extendFocusTime)
  const proceedToBreak = usePomodoroStore((s) => s.proceedToBreak)
  const closeExtendModal = usePomodoroStore((s) => s.closeExtendModal)
  const stopTimer = usePomodoroStore((s) => s.stopTimer)

  const [selectedMinutes, setSelectedMinutes] = useState<number>(5)
  const [customInput, setCustomInput] = useState<string>("")
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false)

  if (!showExtendModal) return null

  const PRESET_MINUTES = [5, 10, 15, 20, 25]

  const handleApplyExtension = (): void => {
    const minsToUse = isCustomMode ? Math.max(1, parseInt(customInput, 10) || 5) : selectedMinutes
    extendFocusTime(minsToUse)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-card/95 dark:bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-2xl text-foreground"
          role="dialog"
          aria-modal="true"
          aria-labelledby="extend-modal-title"
        >
          {/* Top Decorative Ambient Light Glow */}
          <div className="pointer-events-none absolute -top-12 -left-12 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-emerald-500/15 blur-3xl" />

          {/* Close button */}
          <button
            onClick={closeExtendModal}
            className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header Badge & Icon */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-glow">
              <Sparkles className="h-7 w-7 animate-pulse text-primary" />
              <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white font-bold shadow-md">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
              <Flame className="h-3.5 w-3.5" />
              <span>Sesi Fokus #{sessionCount} Selesai</span>
            </div>

            <h2 id="extend-modal-title" className="text-xl font-bold tracking-tight text-foreground">
              Tambah Waktu Fokus?
            </h2>

            <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-xs">
              Sesi fokus Anda telah selesai. Anda dapat memperpanjang sesi fokus ekstra atau langsung memulai waktu istirahat.
            </p>
          </div>

          {/* Time Extension Options */}
          <div className="mt-6 space-y-3">
            <label className="text-xs font-semibold text-foreground/80 flex items-center justify-between">
              <span>Pilih Perpanjangan Waktu:</span>
              <span className="text-[11px] text-primary font-mono font-medium">
                +{isCustomMode ? (parseInt(customInput, 10) || 0) : selectedMinutes} Menit
              </span>
            </label>

            {/* Presets Grid */}
            <div className="grid grid-cols-5 gap-2">
              {PRESET_MINUTES.map((mins) => {
                const isActive = !isCustomMode && selectedMinutes === mins
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setIsCustomMode(false)
                      setSelectedMinutes(mins)
                    }}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-glow scale-105"
                        : "bg-card/50 dark:bg-white/5 border-border/60 hover:bg-card hover:border-primary/40 text-foreground"
                    }`}
                  >
                    <span>+{mins}</span>
                    <span className="text-[9px] opacity-70">mnt</span>
                  </button>
                )
              })}
            </div>

            {/* Custom Input Toggle */}
            <div className="pt-1">
              {!isCustomMode ? (
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className="w-full text-center text-xs text-primary/80 hover:text-primary hover:underline transition-all cursor-pointer font-medium py-1"
                >
                  Atur waktu kustom (menit)...
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Masukkan menit (cth: 12)"
                      className="w-full rounded-xl border border-primary/40 bg-background/80 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      autoFocus
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">mnt</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-xs text-muted-foreground hover:bg-card hover:text-foreground transition-all cursor-pointer"
                  >
                    Preset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2">
            {/* Primary Extend Button */}
            <button
              type="button"
              onClick={handleApplyExtension}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-xs shadow-glow transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <Clock className="h-4 w-4" />
              <span>
                Tambah +{isCustomMode ? (parseInt(customInput, 10) || 5) : selectedMinutes} Menit Fokus Now
              </span>
            </button>

            {/* Secondary Start Break Button */}
            <button
              type="button"
              onClick={proceedToBreak}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Coffee className="h-4 w-4" />
              <span>Mulai Waktu Istirahat (Break)</span>
            </button>

            {/* Stop / Finish */}
            <button
              type="button"
              onClick={stopTimer}
              className="w-full text-center text-xs text-muted-foreground hover:text-rose-400 py-1.5 transition-colors cursor-pointer"
            >
              Selesai & Nonaktifkan Timer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
