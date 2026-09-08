import { useMemo } from 'react'
import { heatmapGrid, monthLabel, prettyDate } from '../../lib/date'

interface Props {
  /** dayKey -> seconds logged that day */
  secondsByDay: Map<string, number>
  weeks?: number
  color?: string
}

const DEFAULT_COLOR = '#6366f1'
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function bucket(minutes: number): number {
  if (minutes <= 0) return 0
  if (minutes < 15) return 1
  if (minutes < 30) return 2
  if (minutes < 60) return 3
  return 4
}

const OPACITY = [0, 0.25, 0.45, 0.7, 1]

export function Heatmap({ secondsByDay, weeks = 26, color = DEFAULT_COLOR }: Props) {
  const grid = useMemo(() => heatmapGrid(weeks), [weeks])

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1">
        {/* Month labels */}
        <div className="flex gap-1 pl-8">
          {grid.map((week, i) => {
            const first = week[0].key
            const prev = i > 0 ? grid[i - 1][0].key : null
            const show = !prev || monthLabel(prev) !== monthLabel(first)
            return (
              <div key={first} className="w-3 text-[10px] text-slate-400">
                {show ? monthLabel(first) : ''}
              </div>
            )
          })}
        </div>

        <div className="flex gap-1">
          {/* Day-of-week labels */}
          <div className="flex w-7 flex-col gap-1">
            {DAY_LABELS.map((d, i) => (
              <div key={i} className="h-3 text-[10px] leading-3 text-slate-400">
                {d}
              </div>
            ))}
          </div>

          {grid.map((week) => (
            <div key={week[0].key} className="flex flex-col gap-1">
              {week.map((day) => {
                const minutes = Math.round((secondsByDay.get(day.key) ?? 0) / 60)
                const b = bucket(minutes)
                return (
                  <div
                    key={day.key}
                    title={
                      day.inFuture
                        ? undefined
                        : `${prettyDate(day.key)} — ${minutes ? `${minutes} min` : 'nothing logged'}`
                    }
                    className="h-3 w-3 rounded-sm"
                    style={{
                      backgroundColor: day.inFuture
                        ? 'transparent'
                        : b === 0
                          ? 'var(--heatmap-empty)'
                          : color,
                      opacity: day.inFuture ? 0 : b === 0 ? 1 : OPACITY[b],
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
