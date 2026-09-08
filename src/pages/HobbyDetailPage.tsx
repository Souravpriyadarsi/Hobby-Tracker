import { type ReactNode, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CalendarCheck2, ChevronLeft, Flame, Pencil, Trash2 } from 'lucide-react'
import { Page } from '../components/layout/Page'
import { Button, IconButton } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { HobbyFormModal } from '../components/hobbies/HobbyFormModal'
import { TimerControl } from '../components/timer/TimerControl'
import { ManualEntryForm } from '../components/timer/ManualEntryForm'
import { SessionList } from '../components/sessions/SessionList'
import { Heatmap } from '../components/heatmap/Heatmap'
import { MinutesBarChart } from '../components/charts/MinutesBarChart'
import type { HobbyInput } from '../db/types'
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
import { cn } from '../lib/cn'

export function HobbyDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const hobby = useDataStore((s) => s.hobbies.find((h) => h.id === id))
  const sessions = useDataStore((s) => s.sessions)
  const checks = useDataStore((s) => s.checks)
  const editHobby = useDataStore((s) => s.editHobby)
  const removeHobby = useDataStore((s) => s.removeHobby)
  const toggleCheck = useDataStore((s) => s.toggleCheck)

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

  const checkedToday = myChecks.some((c) => c.date === todayKey())

  if (!hobby) {
    return (
      <Page title="Hobby">
        <p className="text-sm text-on-surface-variant">
          This hobby doesn&apos;t exist.{' '}
          <Link to="/hobbies" className="text-primary hover:underline">
            Back to hobbies
          </Link>
        </p>
      </Page>
    )
  }

  return (
    <Page title={`${hobby.icon}  ${hobby.name}`}>
      <Link
        to="/hobbies"
        className="mb-4 inline-flex items-center gap-1 rounded-full py-1 pr-3 text-sm text-on-surface-variant transition-colors hover:text-on-surface"
      >
        <ChevronLeft size={16} /> All hobbies
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
            style={{ backgroundColor: `${hobby.color}33` }}
          >
            {hobby.icon}
          </span>
          <div>
            <h2 className="text-2xl font-normal text-on-surface">{hobby.name}</h2>
            {hobby.dailyGoalMinutes && (
              <p className="text-sm text-on-surface-variant">
                Goal: {hobby.dailyGoalMinutes} min/day
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outlined" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil size={15} /> Edit
          </Button>
          <IconButton label="Delete hobby" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={17} />
          </IconButton>
        </div>
      </div>

      <div className="space-y-5">
        <TimerControl hobbyId={hobby.id} hobbyColor={hobby.color} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total time" value={formatDuration(stats.total)} />
          <StatTile label="This week" value={formatDuration(stats.week)} />
          <StatTile label="Today" value={formatDuration(stats.today)} />
          <StatTile
            label="Current streak"
            value={
              hobby.trackStreak ? (
                <span className="inline-flex items-center gap-1.5">
                  <Flame size={18} className="text-secondary" /> {stats.current}
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
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[15px] font-medium text-on-surface">Today&apos;s check-in</p>
                <p className="mt-0.5 text-sm text-on-surface-variant">
                  {checkedToday ? 'Marked as done today.' : 'Not marked yet.'}
                </p>
              </div>
              <button
                onClick={() => toggleCheck(hobby.id)}
                className={cn(
                  'inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium transition-all active:scale-[0.98]',
                  checkedToday
                    ? 'bg-primary text-on-primary shadow-e1'
                    : 'bg-surface-container text-on-surface hover:bg-surface-highest',
                )}
              >
                <CalendarCheck2 size={18} />
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

      {editOpen && (
        <HobbyFormModal
          hobby={hobby}
          onClose={() => setEditOpen(false)}
          onSubmit={async (input: HobbyInput) => {
            await editHobby(hobby.id, input)
            setEditOpen(false)
          }}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete hobby?"
        message={`This permanently deletes "${hobby.name}" along with all its sessions and check-ins. This cannot be undone.`}
        confirmLabel="Delete forever"
        destructive
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await removeHobby(hobby.id)
          navigate('/hobbies')
        }}
      />
    </Page>
  )
}

function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="rounded-3xl bg-surface-low p-4">
      <div className="text-xl font-normal text-on-surface">{value}</div>
      <div className="mt-1 text-xs text-on-surface-variant">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-on-surface-variant/70">{sub}</div>}
    </div>
  )
}
