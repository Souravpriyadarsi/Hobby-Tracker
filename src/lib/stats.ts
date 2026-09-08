import { addDays, format, parseISO, startOfWeek, subDays } from 'date-fns'
import type { DailyCheck, Session } from '../db/types'
import { dayKey, todayKey } from './date'

export function forHobby<T extends { hobbyId: string }>(items: T[], hobbyId?: string): T[] {
  return hobbyId ? items.filter((i) => i.hobbyId === hobbyId) : items
}

/** dayKey -> total seconds logged that day. */
export function secondsByDay(sessions: Session[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const s of sessions) {
    const k = dayKey(s.startedAt)
    map.set(k, (map.get(k) ?? 0) + s.durationSeconds)
  }
  return map
}

export function totalSeconds(sessions: Session[]): number {
  return sessions.reduce((sum, s) => sum + s.durationSeconds, 0)
}

export function secondsSince(sessions: Session[], sinceKey: string): number {
  return sessions
    .filter((s) => dayKey(s.startedAt) >= sinceKey)
    .reduce((sum, s) => sum + s.durationSeconds, 0)
}

export function thisWeekSeconds(sessions: Session[], now = new Date()): number {
  const monday = dayKey(startOfWeek(now, { weekStartsOn: 1 }))
  return secondsSince(sessions, monday)
}

/** Union of days with a logged session or a manual check — used for streaks. */
export function activeDays(sessions: Session[], checks: DailyCheck[]): Set<string> {
  const set = new Set<string>()
  for (const s of sessions) set.add(dayKey(s.startedAt))
  for (const c of checks) set.add(c.date)
  return set
}

export interface DayDatum {
  label: string
  key: string
  minutes: number
}

/** Last `days` calendar days ending today, oldest first. */
export function dailyMinutesSeries(sessions: Session[], days = 7, now = new Date()): DayDatum[] {
  const byDay = secondsByDay(sessions)
  const out: DayDatum[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(now, i)
    const key = dayKey(d)
    out.push({
      key,
      label: format(d, days <= 7 ? 'EEE' : 'MMM d'),
      minutes: Math.round((byDay.get(key) ?? 0) / 60),
    })
  }
  return out
}

export interface WeekDatum {
  label: string
  key: string
  minutes: number
}

/** Last `weeks` weeks (Mon-start) ending this week, oldest first. */
export function weeklyMinutesSeries(sessions: Session[], weeks = 8, now = new Date()): WeekDatum[] {
  const thisMonday = startOfWeek(now, { weekStartsOn: 1 })
  const buckets: WeekDatum[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = addDays(thisMonday, -7 * i)
    buckets.push({ key: dayKey(weekStart), label: format(weekStart, 'MMM d'), minutes: 0 })
  }
  const firstKey = buckets[0].key
  for (const s of sessions) {
    const k = dayKey(s.startedAt)
    if (k < firstKey) continue
    const ws = dayKey(startOfWeek(parseISO(k), { weekStartsOn: 1 }))
    const bucket = buckets.find((b) => b.key === ws)
    if (bucket) bucket.minutes += s.durationSeconds / 60
  }
  for (const b of buckets) b.minutes = Math.round(b.minutes)
  return buckets
}

export interface HobbySlice {
  hobbyId: string
  minutes: number
}

export function minutesByHobbySince(sessions: Session[], sinceKey: string): HobbySlice[] {
  const map = new Map<string, number>()
  for (const s of sessions) {
    if (dayKey(s.startedAt) < sinceKey) continue
    map.set(s.hobbyId, (map.get(s.hobbyId) ?? 0) + s.durationSeconds)
  }
  return [...map.entries()]
    .map(([hobbyId, sec]) => ({ hobbyId, minutes: Math.round(sec / 60) }))
    .sort((a, b) => b.minutes - a.minutes)
}

export function todaySeconds(sessions: Session[]): number {
  return secondsByDay(sessions).get(todayKey()) ?? 0
}
