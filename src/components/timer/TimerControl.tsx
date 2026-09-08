import { Pause, Play, Square, Trash2 } from 'lucide-react'
import { Button, IconButton } from '../ui/Button'
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
    <div className="rounded-3xl bg-surface-low p-6">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-xs font-medium tracking-wide text-on-surface-variant">
            {isThisHobby ? (running ? 'Recording' : 'Paused') : 'Timer'}
          </p>
          <p
            className="mt-1 font-mono text-5xl font-light tabular-nums text-on-surface"
            style={isThisHobby ? { color: hobbyColor } : undefined}
          >
            {formatClock(isThisHobby ? elapsed : 0)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isThisHobby && (
            <Button size="lg" onClick={() => start(hobbyId)} disabled={busyElsewhere}>
              <Play size={18} /> Start
            </Button>
          )}
          {isThisHobby && running && (
            <Button size="lg" variant="tonal" onClick={pause}>
              <Pause size={18} /> Pause
            </Button>
          )}
          {isThisHobby && !running && (
            <Button size="lg" onClick={resume}>
              <Play size={18} /> Resume
            </Button>
          )}
          {isThisHobby && (
            <>
              <Button size="lg" onClick={stopAndSave}>
                <Square size={17} /> Stop &amp; save
              </Button>
              <IconButton label="Discard this timer" onClick={cancel}>
                <Trash2 size={17} />
              </IconButton>
            </>
          )}
        </div>
      </div>

      {busyElsewhere && (
        <p className="mt-4 rounded-2xl bg-tertiary-container px-4 py-2.5 text-xs text-on-tertiary-container">
          A timer is already running for another hobby. Stop it before starting this one.
        </p>
      )}
    </div>
  )
}
