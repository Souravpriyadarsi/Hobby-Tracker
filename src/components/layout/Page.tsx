import type { ReactNode } from 'react'
import { TopBar } from './TopBar'

interface Props {
  title: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export function Page({ title, actions, children }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      <TopBar title={title} actions={actions} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1180px] px-6 pt-1.5 pb-8">{children}</div>
      </div>
    </div>
  )
}

/** Standard page heading, so every screen's title renders identically. */
export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="truncate text-[19px] font-medium tracking-tight text-ink">{children}</h1>
  )
}
