import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  hint?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, hint, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-surface-low px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          {icon}
        </div>
      )}
      <p className="text-lg font-normal text-on-surface">{title}</p>
      {hint && <p className="mt-1.5 max-w-sm text-sm text-on-surface-variant">{hint}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
