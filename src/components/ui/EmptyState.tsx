import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  hint?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, hint, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-line bg-card px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-accent-tint text-accent">
          {icon}
        </div>
      )}
      <p className="text-[15px] text-ink">{title}</p>
      {hint && <p className="mt-1.5 max-w-sm text-[12.5px] text-muted">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
