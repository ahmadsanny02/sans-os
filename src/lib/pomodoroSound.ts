"use client"

import { usePomodoroStore } from "@/store/pomodoroStore"

export type PomodoroSoundType = "focus" | "break" | "long-break"

/**
 * Plays a notification sound using the Web Audio API.
 * - "focus": ascending energetic arpeggio
 * - "break": calm descending tones
 * - "long-break": warm chord resolution
 */
export function playPomodoroSound(type: PomodoroSoundType): void {
  try {
    const config = usePomodoroStore.getState().config
    if (!config.soundEnabled) return

    const volumeMultiplier = config.soundVolume ?? 0.5
    const oscType = config.soundType ?? "sine"

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()

    const playTone = (
      freq: number,
      startAt: number,
      duration: number,
      volume: number = 0.35
    ): void => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = oscType
      osc.frequency.setValueAtTime(freq, startAt)

      const finalVolume = volume * volumeMultiplier

      gain.gain.setValueAtTime(0, startAt)
      gain.gain.linearRampToValueAtTime(finalVolume, startAt + 0.04)
      gain.gain.setValueAtTime(finalVolume, startAt + duration - 0.08)
      gain.gain.linearRampToValueAtTime(0, startAt + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startAt)
      osc.stop(startAt + duration)
    }

    const t = ctx.currentTime

    if (type === "focus") {
      // C5 → E5 → G5 — ascending, energetic
      playTone(523.25, t, 0.18, 0.4)
      playTone(659.25, t + 0.22, 0.18, 0.4)
      playTone(783.99, t + 0.44, 0.28, 0.5)
    } else if (type === "break") {
      // E5 → C5 → A4 — descending, relaxing
      playTone(659.25, t, 0.28, 0.3)
      playTone(523.25, t + 0.32, 0.28, 0.3)
      playTone(440.0, t + 0.64, 0.4, 0.25)
    } else {
      // Long break: gentle chord — G4 + B4 + D5
      playTone(392.0, t, 0.5, 0.22)
      playTone(493.88, t + 0.08, 0.5, 0.22)
      playTone(587.33, t + 0.16, 0.55, 0.25)
    }

    // Release AudioContext after tones finish
    setTimeout(() => ctx.close().catch(() => {}), 2500)
  } catch {
    // Silently fail — Web Audio API unavailable or blocked
  }
}
