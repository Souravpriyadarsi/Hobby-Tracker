import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useTick } from '../lib/useTick'

export interface FinishedRun {
  hobbyId: string
  startedAt: string
  endedAt: string
  durationSeconds: number
}

interface TimerState {
  hobbyId: string | null
  running: boolean
  /** Epoch ms when the current running segment began (null while paused/stopped). */
  segmentStart: number | null
  /** Seconds banked from previous segments of this run. */
  accumulatedSeconds: number
  /** ISO timestamp of the very first start of this run. */
  firstStartedAt: string | null

  start: (hobbyId: string) => void
  pause: () => void
  resume: () => void
  /** Stops the timer and returns the run to be persisted as a session. */
  stop: () => FinishedRun | null
  cancel: () => void
  elapsedSeconds: () => number
}

function bank(state: TimerState): number {
  if (state.running && state.segmentStart != null) {
    return state.accumulatedSeconds + (Date.now() - state.segmentStart) / 1000
  }
  return state.accumulatedSeconds
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      hobbyId: null,
      running: false,
      segmentStart: null,
      accumulatedSeconds: 0,
      firstStartedAt: null,

      start: (hobbyId) => {
        const now = Date.now()
        set({
          hobbyId,
          running: true,
          segmentStart: now,
          accumulatedSeconds: 0,
          firstStartedAt: new Date(now).toISOString(),
        })
      },

      pause: () => {
        const s = get()
        if (!s.running) return
        set({ running: false, segmentStart: null, accumulatedSeconds: bank(s) })
      },

      resume: () => {
        const s = get()
        if (s.running || !s.hobbyId) return
        set({ running: true, segmentStart: Date.now() })
      },

      stop: () => {
        const s = get()
        if (!s.hobbyId || !s.firstStartedAt) {
          set(clear())
          return null
        }
        const durationSeconds = Math.round(bank(s))
        const run: FinishedRun = {
          hobbyId: s.hobbyId,
          startedAt: s.firstStartedAt,
          endedAt: new Date().toISOString(),
          durationSeconds,
        }
        set(clear())
        return durationSeconds > 0 ? run : null
      },

      cancel: () => set(clear()),

      elapsedSeconds: () => bank(get()),
    }),
    {
      name: 'hobby-tracker.timer',
      partialize: (s) => ({
        hobbyId: s.hobbyId,
        running: s.running,
        segmentStart: s.segmentStart,
        accumulatedSeconds: s.accumulatedSeconds,
        firstStartedAt: s.firstStartedAt,
      }),
    },
  ),
)

/**
 * Live elapsed seconds for the active run, recomputed in the component body
 * (never via a store selector — Date.now() there would loop useSyncExternalStore).
 * Ticks once a second while running.
 */
export function useElapsedSeconds(): number {
  const running = useTimerStore((s) => s.running)
  const segmentStart = useTimerStore((s) => s.segmentStart)
  const accumulated = useTimerStore((s) => s.accumulatedSeconds)
  useTick(running)
  // Intentional: reading the clock inside a store selector makes getSnapshot
  // unstable and loops useSyncExternalStore. `useTick` drives the re-render,
  // so the clock read stays here in the component body.
  // oxlint-disable-next-line react/purity
  const now = Date.now()
  return running && segmentStart != null ? accumulated + (now - segmentStart) / 1000 : accumulated
}

function clear() {
  return {
    hobbyId: null,
    running: false,
    segmentStart: null,
    accumulatedSeconds: 0,
    firstStartedAt: null,
  }
}
