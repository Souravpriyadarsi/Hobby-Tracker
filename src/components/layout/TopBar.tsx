import type { ReactNode } from 'react'
import { GlobalTimerWidget } from './GlobalTimerWidget'

interface Props {
  title: ReactNode
  actions?: ReactNode
}

export function TopBar({ title, actions }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-6">
      <div className="flex min-w-0 items-center gap-2.5">{title}</div>
      <div className="flex items-center gap-2">
        <GlobalTimerWidget />
        {actions}
      </div>
    </header>
  )
}
