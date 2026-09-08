import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { tooltipStyle, useChartTheme } from './chartTheme'
import { formatDuration } from '../../lib/time'

export interface HobbyDatum {
  name: string
  minutes: number
  color: string
}

interface Props {
  data: HobbyDatum[]
  height?: number
}

/**
 * Donut plus a directly-labelled legend. The legend is not decoration: on the
 * light surface a few series sit just under 3:1 against the card, so the
 * name/value/share text is what carries identity, not colour alone.
 */
export function TimeByHobbyChart({ data, height = 168 }: Props) {
  const t = useChartTheme()
  const slices = data.filter((d) => d.minutes > 0).sort((a, b) => b.minutes - a.minutes)
  const total = slices.reduce((sum, d) => sum + d.minutes, 0)

  if (slices.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-[11.5px] text-muted"
        style={{ height }}
      >
        No time logged in this range
      </div>
    )
  }

  return (
    <div className="flex items-center gap-5" style={{ height }}>
      <div className="relative h-full w-[42%] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="minutes"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              // A gap on a single slice leaves a visible notch in the ring.
              paddingAngle={slices.length > 1 ? 2 : 0}
              stroke="none"
            >
              {slices.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle(t)}
              formatter={(value, name) => [formatDuration(Number(value) * 60), String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9.5px] font-semibold tracking-[0.08em] text-muted">TOTAL</span>
          <span className="num mt-0.5 text-[15px] font-medium text-ink">
            {formatDuration(total * 60)}
          </span>
        </div>
      </div>

      <ul className="flex-1 space-y-2.5 overflow-y-auto">
        {slices.map((d) => (
          <li key={d.name} className="flex items-center gap-2.5 text-[12.5px]">
            <span
              className="h-1.75 w-1.75 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="min-w-0 flex-1 truncate text-ink-soft">{d.name}</span>
            <span className="num shrink-0 text-ink">{formatDuration(d.minutes * 60)}</span>
            <span className="num w-8 shrink-0 text-right text-[11.5px] text-faint">
              {Math.round((d.minutes / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
