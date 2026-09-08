import { Link } from 'react-router-dom'
import { Pause, Play, Square } from 'lucide-react'
import { formatClock } from '../../lib/time'
import { useTimerControls } from '../../lib/useTimerControls'
import { useElapsedSeconds, useTimerStore } from '../../store/useTimerStore'
import { useDataStore } from '../../store/useDataStore'

export function GlobalTimerWidget() {
  const hobbyId = useTimerStore((s) => s.hobbyId)
  const running = useTimerStore((s) => s.running)
  const elapsed = useElapsedSeconds()
  const hobby = useDataStore((s) => s.hobbies.find((h) => h.id === hobbyId))
  const { pause, resume, stopAndSave } = useTimerControls()

  if (!hobbyId || !hobby) return null

  return (
    <div className="flex items-center gap-2.5 rounded-full bg-primary-container py-1 pl-3.5 pr-1.5 text-on-primary-container">
      <span
        className="h-2 w-2 shrink-0 rounded-full bg-current"
        style={{ opacity: running ? 1 : 0.35 }}
      />
      <Link to={`/hobby/${hobby.id}`} className="max-w-40 truncate text-sm font-medium hover:underline">
        {hobby.icon} {hobby.name}
      </Link>
      <span className="font-mono text-sm tabular-nums">{formatClock(elapsed)}</span>
      <div className="flex items-center">
        <button
          onClick={running ? pause : resume}
          className="rounded-full p-2 transition-colors hover:bg-on-primary-container/10"
          aria-label={running ? 'Pause timer' : 'Resume timer'}
        >
          {running ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          onClick={stopAndSave}
          className="rounded-full p-2 transition-colors hover:bg-on-primary-container/10"
          aria-label="Stop and save timer"
        >
          <Square size={15} />
        </button>
      </div>
    </div>
  )
}
