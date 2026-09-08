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

interface Datum {
  label: string
  minutes: number
}

interface Props {
  data: Datum[]
  color?: string
  height?: number
}

/** Single series, so no legend — the card title names it. */
export function MinutesBarChart({ data, color, height = 168 }: Props) {
  const t = useChartTheme()
  const empty = data.every((d) => d.minutes === 0)
  const fill = color ?? t.accent

  return (
    <div className="relative" style={{ height }}>
      {empty && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11.5px] text-muted">
          No time logged in this range
        </p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        {/* left margin must not eat into YAxis width, or 3-digit labels clip */}
        <BarChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: -4 }}>
          <CartesianGrid vertical={false} stroke={t.grid} strokeDasharray="2 3" />
          <XAxis
            dataKey="label"
            tick={{ fill: t.axis, fontSize: 10 }}
            axisLine={{ stroke: t.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: t.axis, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={42}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: t.grid, opacity: 0.4 }}
            contentStyle={tooltipStyle(t)}
            formatter={(value) => [formatDuration(Number(value) * 60), 'Time']}
          />
          <Bar dataKey="minutes" fill={fill} radius={[3, 3, 0, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
