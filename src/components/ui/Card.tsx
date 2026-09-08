import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Elevation comes from the hairline, not a shadow. */
export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-md border border-line bg-card p-4 text-ink', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

/** Card header: title left, optional action or hint right. */
export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="text-[13.5px] font-medium text-ink">{children}</h3>
      {action}
    </div>
  )
}

/** Uppercase micro-label with a status dot, as used on every stat tile. */
export function StatLabel({ color, children }: { color?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.75">
      {color && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="text-[10px] font-semibold tracking-[0.07em] text-muted">{children}</span>
    </div>
  )
}

export function StatTile({
  label,
  color,
  value,
  sub,
}: {
  label: string
  color?: string
  value: ReactNode
  sub?: ReactNode
}) {
  return (
    <div className="rounded-md border border-line bg-card px-4 py-3.5">
      <StatLabel color={color}>{label}</StatLabel>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="num text-[23px] font-medium leading-tight text-ink">{value}</span>
        {sub && <span className="text-[11.5px] text-muted">{sub}</span>}
      </div>
    </div>
  )
}
