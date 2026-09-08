import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * Material 3 card. Elevation is expressed tonally (a lighter/darker surface
 * container) rather than with a heavy drop shadow.
 */
export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-3xl bg-surface-low p-5 text-on-surface', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-[15px] font-medium text-on-surface">{children}</h3>
      {action}
    </div>
  )
}
