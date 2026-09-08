import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useChartTheme } from './chartTheme'
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

export function TimeByHobbyChart({ data, height = 200 }: Props) {
  const t = useChartTheme()
  const nonZero = data.filter((d) => d.minutes > 0)

  if (nonZero.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-slate-400" style={{ height }}>
        No time logged in this range
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4" style={{ height }}>
      <div className="h-full w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={nonZero}
              dataKey="minutes"
              nameKey="name"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="none"
            >
              {nonZero.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: t.tooltipBg,
                border: `1px solid ${t.tooltipBorder}`,
                borderRadius: 8,
                color: t.tooltipText,
                fontSize: 12,
              }}
              formatter={(value, name) => [formatDuration(Number(value) * 60), String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-1.5 text-sm">
        {nonZero
          .slice()
          .sort((a, b) => b.minutes - a.minutes)
          .map((d) => (
            <li key={d.name} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="truncate text-slate-600 dark:text-slate-300">{d.name}</span>
              <span className="ml-auto font-mono text-xs text-slate-400">
                {formatDuration(d.minutes * 60)}
              </span>
            </li>
          ))}
      </ul>
    </div>
  )
}
