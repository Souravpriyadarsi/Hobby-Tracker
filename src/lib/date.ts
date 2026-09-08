import {
  eachDayOfInterval,
  format,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns'

/** Local calendar day key, e.g. "2026-09-08". */
export function dayKey(d: Date | string): string {
  const date = typeof d === 'string' ? parseISO(d) : d
  return format(date, 'yyyy-MM-dd')
}

export function todayKey(): string {
  return dayKey(new Date())
}

export interface HeatmapDay {
  key: string
  date: Date
  inFuture: boolean
}

/**
 * A grid of weeks (columns) x 7 days (rows), Monday-first, covering the last
 * `weeks` weeks up to and including the current week. Trailing future days in
 * the current week are marked `inFuture`.
 */
export function heatmapGrid(weeks = 26, now = new Date()): HeatmapDay[][] {
  const weekStartsOn = 1 // Monday
  const end = startOfWeek(now, { weekStartsOn })
  const start = subWeeks(end, weeks - 1)
  const todayK = dayKey(now)

  const columns: HeatmapDay[][] = []
  for (let w = 0; w < weeks; w++) {
    const colStart = new Date(start)
    colStart.setDate(colStart.getDate() + w * 7)
    const days = eachDayOfInterval({
      start: colStart,
      end: new Date(colStart.getFullYear(), colStart.getMonth(), colStart.getDate() + 6),
    })
    columns.push(
      days.map((date) => {
        const key = dayKey(date)
        return { key, date, inFuture: key > todayK }
      }),
    )
  }
  return columns
}

export function prettyDate(key: string): string {
  return format(parseISO(key), 'EEE, MMM d, yyyy')
}

export function monthLabel(key: string): string {
  return format(parseISO(key), 'MMM')
}
