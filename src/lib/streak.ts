import { addDays, format, parseISO } from 'date-fns'
import { todayKey } from './date'

function shift(key: string, days: number): string {
  return format(addDays(parseISO(key), days), 'yyyy-MM-dd')
}

/**
 * Length of the run of consecutive active days ending today (or yesterday, so a
 * streak isn't "broken" just because today hasn't happened yet).
 */
export function currentStreak(activeDays: Set<string>, today = todayKey()): number {
  let cursor = activeDays.has(today) ? today : shift(today, -1)
  if (!activeDays.has(cursor)) return 0
  let count = 0
  while (activeDays.has(cursor)) {
    count++
    cursor = shift(cursor, -1)
  }
  return count
}

/** Longest run of consecutive active days ever recorded. */
export function longestStreak(activeDays: Set<string>): number {
  if (activeDays.size === 0) return 0
  const sorted = [...activeDays].sort()
  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    if (shift(sorted[i - 1], 1) === sorted[i]) {
      run++
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }
  return best
}
