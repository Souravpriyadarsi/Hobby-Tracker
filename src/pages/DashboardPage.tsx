import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { subDays } from 'date-fns'
import { Check, Sparkles } from 'lucide-react'
import { Page, PageTitle } from '../components/layout/Page'
import { Card, CardTitle, StatTile } from '../components/ui/Card'
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
  thisWeekSeconds,
  todaySeconds,
  weeklyMinutesSeries,
} from '../lib/stats'
import { currentStreak, longestStreak } from '../lib/streak'
import { formatDuration, pluralDays } from '../lib/time'
import { dayKey, todayKey } from '../lib/date'
import { HOBBY_COLORS, OTHER_COLOR } from '../lib/palette'
import { cn } from '../lib/cn'

export function DashboardPage() {
  const allHobbies = useDataStore((s) => s.hobbies)
  const hobbies = useMemo(() => allHobbies.filter((h) => !h.archived), [allHobbies])
  const sessions = useDataStore((s) => s.sessions)
  const checks = useDataStore((s) => s.checks)
  const toggleCheck = useDataStore((s) => s.toggleCheck)

  const hobbyMeta = (id: string) => {
    const h = hobbies.find((x) => x.id === id)
    return { name: h?.name ?? 'Unknown', color: h?.color ?? OTHER_COLOR }
  }

  const data = useMemo(() => {
    const today = todayKey()
    const weekAgo = dayKey(subDays(new Date(), 6))

    const streaks = hobbies
      .filter((h) => h.trackStreak)
      .map((h) => {
        const mine = forHobby(sessions, h.id)
        const myChecks = checks.filter((c) => c.hobbyId === h.id)
        const days = activeDays(mine, myChecks)
        return {
          hobby: h,
          streak: currentStreak(days),
          best: longestStreak(days),
          doneToday:
            myChecks.some((c) => c.date === today) ||
            mine.some((s) => dayKey(s.startedAt) === today),
        }
      })
      .sort((a, b) => b.streak - a.streak)

    const best = streaks.reduce<(typeof streaks)[number] | null>(
      (top, s) => (top === null || s.best > top.best ? s : top),
      null,
    )

    const byHobby = minutesByHobbySince(sessions, weekAgo).map((slice) => {
      const meta = hobbyMeta(slice.hobbyId)
      return { name: meta.name, minutes: slice.minutes, color: meta.color }
    })

    return {
      todayTotal: todaySeconds(sessions),
      weekTotal: thisWeekSeconds(sessions),
      hobbiesToday: new Set(
        sessions.filter((s) => dayKey(s.startedAt) === today).map((s) => s.hobbyId),
      ).size,
      best,
      streaks,
      weekly: weeklyMinutesSeries(sessions, 8),
      byHobby,
      recent: sessions.slice(0, 6),
    }
    // hobbyMeta is derived from `hobbies`, which is already a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hobbies, sessions, checks])

  if (hobbies.length === 0) {
    return (
      <Page title={<PageTitle>Dashboard</PageTitle>}>
        <EmptyState
          icon={<Sparkles size={22} />}
          title="Welcome to Hobby Tracker"
          hint="Create a hobby to start logging time, building streaks, and keeping notes in one place."
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
    <Page title={<PageTitle>Dashboard</PageTitle>}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="TIME TODAY"
            color={HOBBY_COLORS[2]}
            value={formatDuration(data.todayTotal)}
          />
          <StatTile
            label="THIS WEEK"
            color={HOBBY_COLORS[0]}
            value={formatDuration(data.weekTotal)}
          />
          <StatTile
            label="HOBBIES TODAY"
            color={HOBBY_COLORS[3]}
            value={String(data.hobbiesToday)}
          />
          <StatTile
            label="LONGEST STREAK"
            color={HOBBY_COLORS[1]}
            value={data.best ? String(data.best.best) : '0'}
            sub={data.best?.best ? `${data.best.best === 1 ? 'day' : 'days'} · ${data.best.hobby.name}` : 'days'}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <Card>
            <CardTitle action={<span className="text-[11.5px] text-faint">Last 7 days</span>}>
              Time by hobby
            </CardTitle>
            <TimeByHobbyChart data={data.byHobby} />
          </Card>

          <Card>
            <CardTitle action={<span className="text-[11.5px] text-faint">Last 8 weeks</span>}>
              Weekly time
            </CardTitle>
            <MinutesBarChart data={data.weekly} />
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <Card>
            <CardTitle
              action={
                <Link to="/hobbies" className="text-[11.5px] text-accent hover:underline">
                  All hobbies &rarr;
                </Link>
              }
            >
              Streaks
            </CardTitle>
            {data.streaks.length === 0 ? (
              <p className="py-6 text-center text-[12.5px] text-muted">
                No streak-tracked hobbies.
              </p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {data.streaks.map(({ hobby, streak, best, doneToday }) => (
                  <li key={hobby.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className="h-1.75 w-1.75 shrink-0 rounded-full"
                      style={{ backgroundColor: hobby.color }}
                    />
                    <Link to={`/hobby/${hobby.id}`} className="min-w-0 flex-1">
                      <div className="truncate text-[12.8px] text-ink hover:underline">
                        {hobby.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted">
                        Best {pluralDays(best)}
                        {hobby.dailyGoalMinutes ? ` · goal ${hobby.dailyGoalMinutes} min` : ''}
                      </div>
                    </Link>
                    <span
                      className={cn(
                        'num shrink-0 text-[12.8px]',
                        streak > 0 ? 'text-accent' : 'text-muted',
                      )}
                    >
                      {pluralDays(streak)}
                    </span>
                    <button
                      onClick={() => toggleCheck(hobby.id)}
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-xs transition-colors',
                        doneToday
                          ? 'bg-accent-tint text-accent'
                          : 'border border-line bg-well text-faint hover:text-muted',
                      )}
                      aria-label={
                        doneToday ? `Unmark ${hobby.name} today` : `Mark ${hobby.name} done today`
                      }
                      title={doneToday ? 'Done today' : 'Mark done today'}
                    >
                      <Check size={13} strokeWidth={2.5} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardTitle
              action={<span className="text-[11.5px] text-faint">{sessions.length} total</span>}
            >
              Recent sessions
            </CardTitle>
            <SessionList sessions={data.recent} hobbyMeta={hobbyMeta} />
          </Card>
        </div>
      </div>
    </Page>
  )
}
