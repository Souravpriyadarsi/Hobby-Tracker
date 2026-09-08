import { type ReactNode, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Pencil, Play } from 'lucide-react'
import type { Hobby } from '../../db/types'
import { useDataStore } from '../../store/useDataStore'
import { useTimerStore } from '../../store/useTimerStore'
import { activeDays, forHobby, thisWeekSeconds, totalSeconds } from '../../lib/stats'
import { currentStreak } from '../../lib/streak'
import { formatDuration } from '../../lib/time'

interface Props {
  hobby: Hobby
  onEdit: (hobby: Hobby) => void
}

export function HobbyCard({ hobby, onEdit }: Props) {
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
    <div className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <span
        className="absolute inset-x-0 top-0 h-1 rounded-t-xl"
        style={{ backgroundColor: hobby.color }}
      />
      <div className="flex items-start justify-between">
        <Link to={`/hobby/${hobby.id}`} className="flex items-center gap-3">
          <span className="text-2xl">{hobby.icon}</span>
          <span className="font-semibold text-slate-900 hover:underline dark:text-slate-100">
            {hobby.name}
          </span>
        </Link>
        <button
          onClick={() => onEdit(hobby)}
          className="rounded-md p-1.5 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-800"
          aria-label="Edit hobby"
        >
          <Pencil size={15} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Total" value={formatDuration(stats.total)} />
        <Stat label="This week" value={formatDuration(stats.week)} />
        <Stat
          label="Streak"
          value={
            hobby.trackStreak ? (
              <span className="inline-flex items-center gap-1">
                <Flame size={13} className="text-orange-500" />
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
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <Play size={14} /> Start timer
      </button>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  )
}
