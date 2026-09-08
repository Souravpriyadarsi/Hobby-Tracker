import { useMemo } from 'react'
import { heatmapGrid, monthLabel, prettyDate } from '../../lib/date'
import { DEFAULT_HOBBY_COLOR } from '../../lib/palette'

interface Props {
  /** dayKey -> seconds logged that day */
  secondsByDay: Map<string, number>
  weeks?: number
  color?: string
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function bucket(minutes: number): number {
  if (minutes <= 0) return 0
  if (minutes < 15) return 1
  if (minutes < 30) return 2
  if (minutes < 60) return 3
  return 4
}

const OPACITY = [0, 0.3, 0.5, 0.75, 1]

export function Heatmap({ secondsByDay, weeks = 26, color = DEFAULT_HOBBY_COLOR }: Props) {
  const grid = useMemo(() => heatmapGrid(weeks), [weeks])

  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex flex-col gap-1.5">
        <div className="flex gap-1 pl-9">
          {grid.map((week, i) => {
            const first = week[0].key
            const prev = i > 0 ? grid[i - 1][0].key : null
            const show = !prev || monthLabel(prev) !== monthLabel(first)
            return (
              <div key={first} className="w-3.5 text-[10px] text-on-surface-variant">
                {show ? monthLabel(first) : ''}
              </div>
            )
          })}
        </div>

        <div className="flex gap-1">
          <div className="flex w-8 flex-col gap-1">
            {DAY_LABELS.map((d, i) => (
              <div key={i} className="h-3.5 text-[10px] leading-3.5 text-on-surface-variant">
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
                    className="h-3.5 w-3.5 rounded-sm"
                    style={{
                      backgroundColor:
                        day.inFuture ? 'transparent' : b === 0 ? 'var(--md-heatmap-empty)' : color,
                      opacity: day.inFuture ? 0 : b === 0 ? 1 : OPACITY[b],
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 pl-9 pt-1 text-[10px] text-on-surface-variant">
          <span>Less</span>
          {OPACITY.map((o, i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-[3px]"
              style={{
                backgroundColor: i === 0 ? 'var(--md-heatmap-empty)' : color,
                opacity: i === 0 ? 1 : o,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
