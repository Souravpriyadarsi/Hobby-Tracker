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
    <div className="flex h-8 items-center gap-2.5 rounded-sm border border-accent-line bg-accent-tint pl-3 pr-1.5">
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
        style={{ opacity: running ? 1 : 0.35 }}
      />
      <Link
        to={`/hobby/${hobby.id}`}
        className="max-w-40 truncate text-[12.5px] text-ink-soft hover:underline"
      >
        {hobby.name}
      </Link>
      <span className="num text-[12.5px] font-medium text-accent">{formatClock(elapsed)}</span>
      <div className="flex items-center">
        <button
          onClick={running ? pause : resume}
          className="flex h-5.5 w-6 items-center justify-center rounded-xs text-accent transition-colors hover:bg-accent/15"
          aria-label={running ? 'Pause timer' : 'Resume timer'}
        >
          {running ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
        </button>
        <button
          onClick={stopAndSave}
          className="flex h-5.5 w-6 items-center justify-center rounded-xs text-accent transition-colors hover:bg-accent/15"
          aria-label="Stop and save timer"
        >
          <Square size={12} fill="currentColor" />
        </button>
      </div>
    </div>
  )
}
