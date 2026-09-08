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

export function TimeByHobbyChart({ data, height = 210 }: Props) {
  const t = useChartTheme()
  const nonZero = data.filter((d) => d.minutes > 0)

  if (nonZero.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-on-surface-variant"
        style={{ height }}
      >
        No time logged in this range
      </div>
    )
  }

  return (
    <div className="flex items-center gap-5" style={{ height }}>
      <div className="h-full w-1/2 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={nonZero}
              dataKey="minutes"
              nameKey="name"
              innerRadius="58%"
              outerRadius="88%"
              // A gap on a single slice leaves a visible notch in the ring.
              paddingAngle={nonZero.length > 1 ? 3 : 0}
              stroke="none"
              cornerRadius={nonZero.length > 1 ? 4 : 0}
            >
              {nonZero.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle(t)}
              formatter={(value, name) => [formatDuration(Number(value) * 60), String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-2 overflow-y-auto text-sm">
        {nonZero
          .slice()
          .sort((a, b) => b.minutes - a.minutes)
          .map((d) => (
            <li key={d.name} className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="truncate text-on-surface">{d.name}</span>
              <span className="ml-auto shrink-0 font-mono text-xs text-on-surface-variant">
                {formatDuration(d.minutes * 60)}
              </span>
            </li>
          ))}
      </ul>
    </div>
  )
}
