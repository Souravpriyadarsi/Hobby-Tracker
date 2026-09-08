import { useCallback } from 'react'
import { useDataStore } from '../store/useDataStore'
import { useTimerStore } from '../store/useTimerStore'

/**
 * Timer actions bound to persistence: stopping the timer writes a session.
 */
export function useTimerControls() {
  const { start, pause, resume, stop, cancel } = useTimerStore.getState()
  const addSession = useDataStore((s) => s.addSession)

  const stopAndSave = useCallback(async () => {
    const run = stop()
    if (run) {
      await addSession({
        hobbyId: run.hobbyId,
        startedAt: run.startedAt,
        endedAt: run.endedAt,
        durationSeconds: run.durationSeconds,
      })
    }
  }, [stop, addSession])

  return { start, pause, resume, cancel, stopAndSave }
}
