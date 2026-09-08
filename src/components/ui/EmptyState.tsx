import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  hint?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, hint, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
      {icon && <div className="mb-3 text-slate-400">{icon}</div>}
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
