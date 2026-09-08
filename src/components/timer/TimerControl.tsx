import { Pause, Play, Square, Trash2 } from 'lucide-react'
import { Button, IconButton } from '../ui/Button'
import { StatLabel } from '../ui/Card'
import { formatClock } from '../../lib/time'
import { useTimerControls } from '../../lib/useTimerControls'
import { useElapsedSeconds, useTimerStore } from '../../store/useTimerStore'
import { HobbyIcon } from '../hobbies/HobbyIcon'

interface Props {
  hobbyId: string
  hobbyIcon: string
  hobbyColor: string
}

export function TimerControl({ hobbyId, hobbyIcon, hobbyColor }: Props) {
  const activeHobbyId = useTimerStore((s) => s.hobbyId)
  const running = useTimerStore((s) => s.running)
  const elapsed = useElapsedSeconds()
  const { start, pause, resume, cancel, stopAndSave } = useTimerControls()

  const isThisHobby = activeHobbyId === hobbyId
  const busyElsewhere = activeHobbyId != null && !isThisHobby

  return (
    <div className="rounded-md border border-line bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <HobbyIcon icon={hobbyIcon} color={hobbyColor} size={44} />
          <div>
            <StatLabel color={isThisHobby && running ? hobbyColor : undefined}>
              {isThisHobby ? (running ? 'RECORDING' : 'PAUSED') : 'TIMER'}
            </StatLabel>
            <p className="mono mt-1 text-[40px] leading-none font-normal tracking-tight text-ink">
              {formatClock(isThisHobby ? elapsed : 0)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isThisHobby && (
            <Button onClick={() => start(hobbyId)} disabled={busyElsewhere}>
              <Play size={15} fill="currentColor" /> Start
            </Button>
          )}
          {isThisHobby && running && (
            <Button variant="secondary" onClick={pause}>
              <Pause size={15} fill="currentColor" /> Pause
            </Button>
          )}
          {isThisHobby && !running && (
            <Button variant="secondary" onClick={resume}>
              <Play size={15} fill="currentColor" /> Resume
            </Button>
          )}
          {isThisHobby && (
            <>
              <Button onClick={stopAndSave}>
                <Square size={13} fill="currentColor" /> Stop &amp; save
              </Button>
              <IconButton label="Discard this timer" onClick={cancel}>
                <Trash2 size={15} />
              </IconButton>
            </>
          )}
        </div>
      </div>

      {busyElsewhere && (
        <p className="mt-4 rounded-sm border border-line bg-well px-3 py-2 text-[11.5px] text-muted">
          A timer is already running for another hobby. Stop it before starting this one.
        </p>
      )}
    </div>
  )
}
