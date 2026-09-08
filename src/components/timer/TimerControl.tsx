import { Pause, Play, Square, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { formatClock } from '../../lib/time'
import { useTimerControls } from '../../lib/useTimerControls'
import { useElapsedSeconds, useTimerStore } from '../../store/useTimerStore'

interface Props {
  hobbyId: string
  hobbyColor: string
}

export function TimerControl({ hobbyId, hobbyColor }: Props) {
  const activeHobbyId = useTimerStore((s) => s.hobbyId)
  const running = useTimerStore((s) => s.running)
  const elapsed = useElapsedSeconds()
  const { start, pause, resume, cancel, stopAndSave } = useTimerControls()

  const isThisHobby = activeHobbyId === hobbyId
  const busyElsewhere = activeHobbyId != null && !isThisHobby

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {isThisHobby ? (running ? 'Recording' : 'Paused') : 'Timer'}
          </p>
          <p
            className="mt-1 font-mono text-4xl tabular-nums text-slate-900 dark:text-slate-100"
            style={isThisHobby ? { color: hobbyColor } : undefined}
          >
            {formatClock(isThisHobby ? elapsed : 0)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isThisHobby && (
            <Button onClick={() => start(hobbyId)} disabled={busyElsewhere}>
              <Play size={16} /> Start
            </Button>
          )}
          {isThisHobby && running && (
            <Button variant="secondary" onClick={pause}>
              <Pause size={16} /> Pause
            </Button>
          )}
          {isThisHobby && !running && (
            <Button onClick={resume}>
              <Play size={16} /> Resume
            </Button>
          )}
          {isThisHobby && (
            <>
              <Button variant="primary" onClick={stopAndSave}>
                <Square size={16} /> Stop &amp; save
              </Button>
              <Button variant="ghost" onClick={cancel} aria-label="Discard timer">
                <Trash2 size={16} />
              </Button>
            </>
          )}
        </div>
      </div>

      {busyElsewhere && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
          A timer is already running for another hobby. Stop it first.
        </p>
      )}
    </div>
  )
}
