import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck2, Flame } from 'lucide-react'
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
import { subDays } from 'date-fns'

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
          doneToday: myChecks.some((c) => c.date === today) || mine.some((s) => dayKey(s.startedAt) === today),
        }
      })
      .sort((a, b) => b.streak - a.streak)

    const byHobby = minutesByHobbySince(sessions, weekAgo).map((slice) => {
      const h = hobbies.find((x) => x.id === slice.hobbyId)
      return { name: h?.name ?? 'Unknown', minutes: slice.minutes, color: h?.color ?? '#64748b' }
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
          title="Welcome to Hobby Tracker"
          hint="Create a hobby to start logging time, building streaks, and keeping notes."
          action={
            <Link to="/hobbies">
              <Button>Get started</Button>
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
            <Summary label="Time today" value={formatDuration(data.todayTotal)} />
            <Summary label="Hobbies today" value={String(data.hobbiesToday)} />
            <Summary label="Check-ins today" value={String(data.checksToday)} />
          </div>

          <Card>
            <CardTitle>Weekly time (last 8 weeks)</CardTitle>
            <MinutesBarChart data={data.weekly} />
          </Card>

          <Card>
            <CardTitle>Time by hobby (last 7 days)</CardTitle>
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
              <p className="text-sm text-slate-400">No streak-tracked hobbies.</p>
            ) : (
              <ul className="space-y-2">
                {data.streaks.map(({ hobby, streak, doneToday }) => (
                  <li key={hobby.id} className="flex items-center gap-2">
                    <Link
                      to={`/hobby/${hobby.id}`}
                      className="flex min-w-0 flex-1 items-center gap-2 text-sm hover:underline"
                    >
                      <span>{hobby.icon}</span>
                      <span className="truncate text-slate-700 dark:text-slate-200">
                        {hobby.name}
                      </span>
                    </Link>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                      <Flame
                        size={14}
                        className={streak > 0 ? 'text-orange-500' : 'text-slate-300'}
                      />
                      {streak}
                    </span>
                    <button
                      onClick={() => toggleCheck(hobby.id)}
                      className={
                        doneToday
                          ? 'rounded-md bg-emerald-600 p-1.5 text-white'
                          : 'rounded-md bg-slate-100 p-1.5 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                      }
                      aria-label={doneToday ? 'Unmark today' : 'Mark done today'}
                      title={doneToday ? 'Done today' : 'Mark done today'}
                    >
                      <CalendarCheck2 size={14} />
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

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-xl font-semibold text-slate-900 dark:text-slate-100">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  )
}
