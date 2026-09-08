import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Archive, Pencil, Play } from 'lucide-react'
import type { Hobby } from '../../db/types'
import { useDataStore } from '../../store/useDataStore'
import { useTimerStore } from '../../store/useTimerStore'
import { activeDays, forHobby, thisWeekSeconds, totalSeconds } from '../../lib/stats'
import { currentStreak } from '../../lib/streak'
import { formatDuration } from '../../lib/time'

interface Props {
  hobby: Hobby
  onEdit: (hobby: Hobby) => void
  onArchive: (hobby: Hobby) => void
}

export function HobbyCard({ hobby, onEdit, onArchive }: Props) {
  const sessions = useDataStore((s) => s.sessions)
  const checks = useDataStore((s) => s.checks)
  const startTimer = useTimerStore((s) => s.start)
  const timerBusy = useTimerStore((s) => s.hobbyId != null)
  const isRunning = useTimerStore((s) => s.hobbyId === hobby.id)

  const stats = useMemo(() => {
    const mine = forHobby(sessions, hobby.id)
    const myChecks = checks.filter((c) => c.hobbyId === hobby.id)
    return {
      total: totalSeconds(mine),
      week: thisWeekSeconds(mine),
      streak: hobby.trackStreak ? currentStreak(activeDays(mine, myChecks)) : null,
    }
  }, [sessions, checks, hobby.id, hobby.trackStreak])

  return (
    <div className="group flex flex-col overflow-hidden rounded-md border border-line bg-card">
      <span className="h-1 w-full shrink-0" style={{ backgroundColor: hobby.color }} />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/hobby/${hobby.id}`} className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-[15px]"
              style={{ backgroundColor: `${hobby.color}26` }}
            >
              {hobby.icon}
            </span>
            <span className="truncate text-[13.5px] font-medium text-ink group-hover:underline">
              {hobby.name}
            </span>
          </Link>
          <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              onClick={() => onEdit(hobby)}
              className="rounded-sm p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label={`Edit ${hobby.name}`}
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onArchive(hobby)}
              className="rounded-sm p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label={`Archive ${hobby.name}`}
            >
              <Archive size={15} />
            </button>
          </div>
        </div>

        <dl className="mt-4 flex items-baseline justify-between gap-2 border-t border-line-soft pt-3 text-[12.5px]">
          <div>
            <dt className="text-[10.5px] text-muted">Total</dt>
            <dd className="num mt-0.5 text-ink">{formatDuration(stats.total)}</dd>
          </div>
          <div className="text-center">
            <dt className="text-[10.5px] text-muted">This week</dt>
            <dd className="num mt-0.5 text-ink">{formatDuration(stats.week)}</dd>
          </div>
          <div className="text-right">
            <dt className="text-[10.5px] text-muted">Streak</dt>
            <dd className="num mt-0.5 text-ink">
              {stats.streak === null ? '—' : `${stats.streak}d`}
            </dd>
          </div>
        </dl>

        <button
          onClick={() => startTimer(hobby.id)}
          disabled={timerBusy}
          className="mt-4 inline-flex h-8 items-center justify-center gap-2 rounded-sm border border-accent-line bg-accent-tint text-[12.5px] font-medium text-accent transition-colors hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
        >
          <Play size={13} fill="currentColor" /> {isRunning ? 'Running' : 'Start timer'}
        </button>
      </div>
    </div>
  )
}
