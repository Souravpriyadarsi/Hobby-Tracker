import { type ReactNode, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Archive, Flame, Pencil, Play } from 'lucide-react'
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

  const stats = useMemo(() => {
    const mine = forHobby(sessions, hobby.id)
    const myChecks = checks.filter((c) => c.hobbyId === hobby.id)
    return {
      total: totalSeconds(mine),
      week: thisWeekSeconds(mine),
      streak: hobby.trackStreak ? currentStreak(activeDays(mine, myChecks)) : 0,
    }
  }, [sessions, checks, hobby.id, hobby.trackStreak])

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-surface-low transition-shadow hover:shadow-e2">
      <div className="h-1.5 w-full" style={{ backgroundColor: hobby.color }} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/hobby/${hobby.id}`} className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
              style={{ backgroundColor: `${hobby.color}33` }}
            >
              {hobby.icon}
            </span>
            <span className="truncate text-base font-medium text-on-surface group-hover:underline">
              {hobby.name}
            </span>
          </Link>
          <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              onClick={() => onEdit(hobby)}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-on-surface/8"
              aria-label={`Edit ${hobby.name}`}
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onArchive(hobby)}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-on-surface/8"
              aria-label={`Archive ${hobby.name}`}
            >
              <Archive size={16} />
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="Total" value={formatDuration(stats.total)} />
          <Stat label="This week" value={formatDuration(stats.week)} />
          <Stat
            label="Streak"
            value={
              hobby.trackStreak ? (
                <span className="inline-flex items-center gap-1">
                  <Flame size={14} className="text-secondary" />
                  {stats.streak}
                </span>
              ) : (
                '—'
              )
            }
          />
        </div>

        <button
          onClick={() => startTimer(hobby.id)}
          disabled={timerBusy}
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary-container text-sm font-medium text-on-primary-container transition-all hover:brightness-95 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          <Play size={15} /> Start timer
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface-container px-2 py-2.5 text-center">
      <div className="text-sm font-medium text-on-surface">{value}</div>
      <div className="mt-0.5 text-[11px] text-on-surface-variant">{label}</div>
    </div>
  )
}
