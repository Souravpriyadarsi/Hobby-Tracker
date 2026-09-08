import type { ReactNode } from 'react'
import { TopBar } from './TopBar'

interface Props {
  title: string
  children: ReactNode
}

export function Page({ title, children }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface">
      <TopBar title={title} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 pt-2 pb-10">{children}</div>
      </div>
    </div>
  )
}
