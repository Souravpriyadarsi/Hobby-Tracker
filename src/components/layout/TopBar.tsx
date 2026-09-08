import { Moon, Sun } from 'lucide-react'
import { GlobalTimerWidget } from './GlobalTimerWidget'
import { useUiStore } from '../../store/useUiStore'

interface Props {
  title: string
}

export function TopBar({ title }: Props) {
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <GlobalTimerWidget />
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
