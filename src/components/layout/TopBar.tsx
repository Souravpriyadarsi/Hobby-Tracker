import { Moon, Sun } from 'lucide-react'
import { GlobalTimerWidget } from './GlobalTimerWidget'
import { IconButton } from '../ui/Button'
import { useUiStore } from '../../store/useUiStore'

interface Props {
  title: string
}

/** Material 3 small top app bar. */
export function TopBar({ title }: Props) {
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-surface px-6">
      <h1 className="truncate text-[22px] font-normal text-on-surface">{title}</h1>
      <div className="flex items-center gap-2">
        <GlobalTimerWidget />
        <IconButton
          label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </IconButton>
      </div>
    </header>
  )
}
