import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { subDays } from 'date-fns'
import { CalendarCheck2, Flame, Sparkles } from 'lucide-react'
import { Page } from '../components/layout/Page'
import { Card, CardTitle } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { SessionList } from '../components/sessions/SessionList'
import { MinutesBarChart } from '../components/charts/MinutesBarChart'
import { TimeByHobbyChart } from '../components/charts/TimeByHobbyChart'
import { useDataStore } from '../store/useDataStore'
import {
  activeDays,
  forHobby,
  minutesByHobbySince,
  todaySeconds,
  weeklyMinutesSeries,
} from '../lib/stats'
import { currentStreak } from '../lib/streak'
import { formatDuration } from '../lib/time'
import { dayKey, todayKey } from '../lib/date'
import { cn } from '../lib/cn'

export function DashboardPage() {
  const allHobbies = useDataStore((s) => s.hobbies)
  const hobbies = useMemo(() => allHobbies.filter((h) => !h.archived), [allHobbies])
  const sessions = useDataStore((s) => s.sessions)
  const checks = useDataStore((s) => s.checks)
  const toggleCheck = useDataStore((s) => s.toggleCheck)

  const hobbyName = (hid: string) => hobbies.find((h) => h.id === hid)?.name ?? 'Unknown'

  const data = useMemo(() => {
    const today = todayKey()
    const weekAgo = dayKey(subDays(new Date(), 6))

    const streaks = hobbies
      .filter((h) => h.trackStreak)
      .map((h) => {
        const mine = forHobby(sessions, h.id)
        const myChecks = checks.filter((c) => c.hobbyId === h.id)
        return {
          hobby: h,
          streak: currentStreak(activeDays(mine, myChecks)),
          doneToday:
            myChecks.some((c) => c.date === today) ||
            mine.some((s) => dayKey(s.startedAt) === today),
        }
      })
      .sort((a, b) => b.streak - a.streak)

    const byHobby = minutesByHobbySince(sessions, weekAgo).map((slice) => {
      const h = hobbies.find((x) => x.id === slice.hobbyId)
      return { name: h?.name ?? 'Unknown', minutes: slice.minutes, color: h?.color ?? '#CFC095' }
    })

    return {
      todayTotal: todaySeconds(sessions),
      checksToday: checks.filter((c) => c.date === today).length,
      hobbiesToday: new Set(
        sessions.filter((s) => dayKey(s.startedAt) === today).map((s) => s.hobbyId),
      ).size,
      streaks,
      weekly: weeklyMinutesSeries(sessions, 8),
      byHobby,
      recent: sessions.slice(0, 8),
    }
  }, [hobbies, sessions, checks])

  if (hobbies.length === 0) {
    return (
      <Page title="Dashboard">
        <EmptyState
          icon={<Sparkles size={28} />}
          title="Welcome to Hobby Tracker"
          hint="Create a hobby to start logging time, building streaks, and keeping notes in one place."
          action={
            <Link to="/hobbies">
              <Button size="lg">Get started</Button>
            </Link>
          }
        />
      </Page>
    )
  }

  return (
    <Page title="Dashboard">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            <Summary label="Time today" value={formatDuration(data.todayTotal)} highlight />
            <Summary label="Hobbies today" value={String(data.hobbiesToday)} />
            <Summary label="Check-ins today" value={String(data.checksToday)} />
          </div>

          <Card>
            <CardTitle>Weekly time · last 8 weeks</CardTitle>
            <MinutesBarChart data={data.weekly} />
          </Card>

          <Card>
            <CardTitle>Time by hobby · last 7 days</CardTitle>
            <TimeByHobbyChart data={data.byHobby} />
          </Card>

          <Card>
            <CardTitle>Recent sessions</CardTitle>
            <SessionList sessions={data.recent} showHobby={hobbyName} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle>Streaks</CardTitle>
            {data.streaks.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No streak-tracked hobbies.</p>
            ) : (
              <ul className="space-y-1">
                {data.streaks.map(({ hobby, streak, doneToday }) => (
                  <li key={hobby.id} className="flex items-center gap-2">
                    <Link
                      to={`/hobby/${hobby.id}`}
                      className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl py-1.5 text-sm hover:underline"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
                        style={{ backgroundColor: `${hobby.color}33` }}
                      >
                        {hobby.icon}
                      </span>
                      <span className="truncate text-on-surface">{hobby.name}</span>
                    </Link>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-on-surface">
                      <Flame
                        size={15}
                        className={streak > 0 ? 'text-secondary' : 'text-on-surface-variant/40'}
                      />
                      {streak}
                    </span>
                    <button
                      onClick={() => toggleCheck(hobby.id)}
                      className={cn(
                        'shrink-0 rounded-full p-2 transition-colors',
                        doneToday
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-highest',
                      )}
                      aria-label={
                        doneToday ? `Unmark ${hobby.name} today` : `Mark ${hobby.name} done today`
                      }
                      title={doneToday ? 'Done today' : 'Mark done today'}
                    >
                      <CalendarCheck2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </Page>
  )
}

function Summary({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-3xl p-5',
        highlight ? 'bg-primary-container text-on-primary-container' : 'bg-surface-low',
      )}
    >
      <div className="text-2xl font-normal">{value}</div>
      <div className={cn('mt-1 text-xs', highlight ? 'opacity-80' : 'text-on-surface-variant')}>
        {label}
      </div>
    </div>
  )
}
