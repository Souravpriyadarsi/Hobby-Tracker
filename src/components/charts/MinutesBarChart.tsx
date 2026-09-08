import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useChartTheme } from './chartTheme'
import { formatDuration } from '../../lib/time'

interface Datum {
  label: string
  minutes: number
}

interface Props {
  data: Datum[]
  color?: string
  height?: number
}

export function MinutesBarChart({ data, color = '#6366f1', height = 200 }: Props) {
  const t = useChartTheme()
  const empty = data.every((d) => d.minutes === 0)

  return (
    <div className="relative" style={{ height }}>
      {empty && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-400">
          No time logged in this range
        </p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} stroke={t.grid} />
          <XAxis
            dataKey="label"
            tick={{ fill: t.axis, fontSize: 11 }}
            axisLine={{ stroke: t.grid }}
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
            cursor={{ fill: t.grid, opacity: 0.4 }}
            contentStyle={{
              background: t.tooltipBg,
              border: `1px solid ${t.tooltipBorder}`,
              borderRadius: 8,
              color: t.tooltipText,
              fontSize: 12,
            }}
            formatter={(value) => [formatDuration(Number(value) * 60), 'Time']}
          />
          <Bar dataKey="minutes" fill={color} radius={[4, 4, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
