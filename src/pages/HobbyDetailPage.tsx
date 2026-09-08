import { type ReactNode, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarCheck2, ChevronLeft, Flame, Pencil, Trash2 } from 'lucide-react'
import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { HobbyFormModal } from '../components/hobbies/HobbyFormModal'
import { TimerControl } from '../components/timer/TimerControl'
import { ManualEntryForm } from '../components/timer/ManualEntryForm'
import { SessionList } from '../components/sessions/SessionList'
import { Heatmap } from '../components/heatmap/Heatmap'
import { MinutesBarChart } from '../components/charts/MinutesBarChart'
import type { HobbyInput } from '../db/hobbies'
import { useDataStore } from '../store/useDataStore'
import {
  activeDays,
  dailyMinutesSeries,
  forHobby,
  secondsByDay,
  thisWeekSeconds,
  todaySeconds,
  totalSeconds,
} from '../lib/stats'
import { currentStreak, longestStreak } from '../lib/streak'
import { formatDuration } from '../lib/time'
import { todayKey } from '../lib/date'

export function HobbyDetailPage() {
  const { id = '' } = useParams()
  const hobby = useDataStore((s) => s.hobbies.find((h) => h.id === id))
  const sessions = useDataStore((s) => s.sessions)
  const checks = useDataStore((s) => s.checks)
  const editHobby = useDataStore((s) => s.editHobby)
  const removeHobby = useDataStore((s) => s.removeHobby)
  const toggleCheck = useDataStore((s) => s.toggleCheck)
  const isChecked = useDataStore((s) => s.isChecked)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const mine = useMemo(() => forHobby(sessions, id), [sessions, id])
  const myChecks = useMemo(() => checks.filter((c) => c.hobbyId === id), [checks, id])

  const stats = useMemo(() => {
    const days = activeDays(mine, myChecks)
    return {
      total: totalSeconds(mine),
      week: thisWeekSeconds(mine),
      today: todaySeconds(mine),
      current: currentStreak(days),
      longest: longestStreak(days),
      byDay: secondsByDay(mine),
      series: dailyMinutesSeries(mine, 14),
    }
  }, [mine, myChecks])

  if (!hobby) {
    return (
      <Page title="Hobby">
        <p className="text-sm text-slate-500">
          This hobby doesn&apos;t exist. <Link to="/hobbies" className="text-indigo-600 hover:underline">Back to hobbies</Link>
        </p>
      </Page>
    )
  }

  const checkedToday = isChecked(hobby.id, todayKey())

  return (
    <Page title={`${hobby.icon}  ${hobby.name}`}>
      <Link
        to="/hobbies"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      >
        <ChevronLeft size={15} /> All hobbies
      </Link>

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: `${hobby.color}22` }}
          >
            {hobby.icon}
          </span>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{hobby.name}</h2>
            {hobby.dailyGoalMinutes && (
              <p className="text-xs text-slate-400">Goal: {hobby.dailyGoalMinutes} min/day</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil size={14} /> Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)} aria-label="Delete hobby">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        <TimerControl hobbyId={hobby.id} hobbyColor={hobby.color} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total time" value={formatDuration(stats.total)} />
          <StatTile label="This week" value={formatDuration(stats.week)} />
          <StatTile label="Today" value={formatDuration(stats.today)} />
          <StatTile
            label="Streak"
            value={
              hobby.trackStreak ? (
                <span className="inline-flex items-center gap-1">
                  <Flame size={15} className="text-orange-500" /> {stats.current}
                </span>
              ) : (
                '—'
              )
            }
            sub={hobby.trackStreak ? `Best: ${stats.longest}` : undefined}
          />
        </div>

        {hobby.trackStreak && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today&apos;s check-in</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {checkedToday ? 'Marked as done today.' : 'Not marked yet.'}
                </p>
              </div>
              <button
                onClick={() => toggleCheck(hobby.id)}
                className={
                  checkedToday
                    ? 'inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500'
                    : 'inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                }
              >
                <CalendarCheck2 size={16} />
                {checkedToday ? 'Done today' : 'Mark done'}
              </button>
            </div>
          </Card>
        )}

        <Card>
          <CardTitle>Activity</CardTitle>
          <Heatmap secondsByDay={stats.byDay} color={hobby.color} />
        </Card>

        <Card>
          <CardTitle>Last 2 weeks</CardTitle>
          <MinutesBarChart data={stats.series} color={hobby.color} />
        </Card>

        <Card>
          <CardTitle>Log time manually</CardTitle>
          <ManualEntryForm hobbyId={hobby.id} />
        </Card>

        <Card>
          <CardTitle>Sessions</CardTitle>
          <SessionList sessions={mine} />
        </Card>
      </div>

      <HobbyFormModal
        open={editOpen}
        hobby={hobby}
        onClose={() => setEditOpen(false)}
        onSubmit={async (input: HobbyInput) => {
          await editHobby(hobby.id, input)
          setEditOpen(false)
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete hobby?"
        message={`This permanently deletes "${hobby.name}" and all its sessions, check-ins, and notes. This cannot be undone.`}
        confirmLabel="Delete forever"
        destructive
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await removeHobby(hobby.id)
          window.location.hash = '#/hobbies'
        }}
      />
    </Page>
  )
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string
  value: ReactNode
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      {sub && <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>}
    </div>
  )
}
