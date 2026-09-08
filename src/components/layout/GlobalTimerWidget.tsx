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
    <div className="flex items-center gap-3 rounded-lg bg-slate-100 py-1 pl-3 pr-1.5 dark:bg-slate-800">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: hobby.color, opacity: running ? 1 : 0.4 }}
      />
      <Link
        to={`/hobby/${hobby.id}`}
        className="max-w-40 truncate text-sm font-medium text-slate-700 hover:underline dark:text-slate-200"
      >
        {hobby.icon} {hobby.name}
      </Link>
      <span className="font-mono text-sm tabular-nums text-slate-600 dark:text-slate-300">
        {formatClock(elapsed)}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={running ? pause : resume}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
          aria-label={running ? 'Pause timer' : 'Resume timer'}
        >
          {running ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          onClick={stopAndSave}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
          aria-label="Stop and save timer"
        >
          <Square size={15} />
        </button>
      </div>
    </div>
  )
}
