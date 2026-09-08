import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronLeft, Pencil, Trash2 } from 'lucide-react'
import { Page, PageTitle } from '../components/layout/Page'
import { Button, IconButton } from '../components/ui/Button'
import { Card, CardTitle, StatTile } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { HobbyFormModal } from '../components/hobbies/HobbyFormModal'
import { TimerControl } from '../components/timer/TimerControl'
import { ManualEntryForm } from '../components/timer/ManualEntryForm'
import { SessionList } from '../components/sessions/SessionList'
import { Heatmap, HeatmapLegend } from '../components/heatmap/Heatmap'
import type { HobbyInput } from '../db/types'
import { useDataStore } from '../store/useDataStore'
import {
  activeDays,
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
    }
  }, [mine, myChecks])

  const checkedToday = myChecks.some((c) => c.date === todayKey())

  if (!hobby) {
    return (
      <Page title={<PageTitle>Hobby</PageTitle>}>
        <p className="text-[12.5px] text-muted">
          This hobby doesn&apos;t exist.{' '}
          <Link to="/hobbies" className="text-accent hover:underline">
            Back to hobbies
          </Link>
        </p>
      </Page>
    )
  }

  return (
    <Page
      title={
        <>
          <Link
            to="/hobbies"
            className="flex shrink-0 items-center gap-1 text-[12.5px] text-muted transition-colors hover:text-ink"
          >
            <ChevronLeft size={14} /> Hobbies
          </Link>
          <span className="text-line-strong">/</span>
          <PageTitle>{hobby.name}</PageTitle>
        </>
      }
      actions={
        <>
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil size={14} /> Edit
          </Button>
          <IconButton label="Delete hobby" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={15} />
          </IconButton>
        </>
      }
    >
      <div className="space-y-3">
        <TimerControl hobbyId={hobby.id} hobbyIcon={hobby.icon} hobbyColor={hobby.color} />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="TOTAL TIME" value={formatDuration(stats.total)} />
          <StatTile label="THIS WEEK" value={formatDuration(stats.week)} />
          <StatTile label="TODAY" value={formatDuration(stats.today)} />
          <StatTile
            label="CURRENT STREAK"
            value={hobby.trackStreak ? stats.current : '—'}
            sub={hobby.trackStreak ? `${stats.current === 1 ? 'day' : 'days'} · best ${stats.longest}` : 'not tracked'}
          />
        </div>

        <Card>
          <CardTitle
            action={
              <div className="flex items-center gap-4">
                {hobby.trackStreak && (
                  <button
                    onClick={() => toggleCheck(hobby.id)}
                    className={cn(
                      'inline-flex h-7 items-center gap-1.5 rounded-sm px-3 text-[12px] font-medium transition-colors',
                      checkedToday
                        ? 'bg-accent-tint text-accent'
                        : 'border border-line-strong text-muted hover:text-ink',
                    )}
                  >
                    <Check size={13} strokeWidth={2.5} />
                    {checkedToday ? 'Done today' : 'Mark done today'}
                  </button>
                )}
                <HeatmapLegend color={hobby.color} />
              </div>
            }
          >
            Activity
          </CardTitle>
          <Heatmap secondsByDay={stats.byDay} color={hobby.color} />
        </Card>

        <Card>
          <CardTitle>Log time manually</CardTitle>
          <ManualEntryForm hobbyId={hobby.id} />
        </Card>

        <Card>
          <CardTitle
            action={<span className="text-[11.5px] text-faint">{mine.length} total</span>}
          >
            Sessions
          </CardTitle>
          <SessionList sessions={mine} durationFirst />
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
