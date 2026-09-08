import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { tooltipStyle, useChartTheme } from './chartTheme'
import { formatDuration } from '../../lib/time'
import { DEFAULT_HOBBY_COLOR } from '../../lib/palette'

interface Datum {
  label: string
  minutes: number
}

interface Props {
  data: Datum[]
  color?: string
  height?: number
}

export function MinutesBarChart({ data, color = DEFAULT_HOBBY_COLOR, height = 210 }: Props) {
  const t = useChartTheme()
  const empty = data.every((d) => d.minutes === 0)

  return (
    <div className="relative" style={{ height }}>
      {empty && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-on-surface-variant">
          No time logged in this range
        </p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke={t.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fill: t.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: t.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: t.grid, opacity: 0.35 }}
            contentStyle={tooltipStyle(t)}
            formatter={(value) => [formatDuration(Number(value) * 60), 'Time']}
          />
          <Bar dataKey="minutes" fill={color} radius={[8, 8, 4, 4]} maxBarSize={42} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
