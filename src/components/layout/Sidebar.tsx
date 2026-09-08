import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListChecks, Moon, Settings, Sprout, Sun } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useUiStore } from '../../store/useUiStore'

/**
 * Deliberately a fixed three items. An earlier version listed every hobby here,
 * which meant the sidebar grew without bound; hobbies are reached through the
 * Hobbies page instead, and the running timer surfaces in the top bar.
 */
function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex h-8.5 items-center gap-2.5 rounded-sm px-2.5 text-[13px] transition-colors',
    isActive
      ? 'bg-accent-tint font-medium text-accent'
      : 'text-muted hover:bg-ink/5 hover:text-ink-soft',
  )
}

export function Sidebar() {
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-line-soft">
      <div className="flex items-center gap-2.5 px-4 py-4.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-solid text-on-accent">
          <Sprout size={17} />
        </span>
        <span className="text-[13.5px] font-semibold tracking-tight text-ink">Hobby Tracker</span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        <NavLink to="/" end className={navClass}>
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
        <NavLink to="/hobbies" className={navClass}>
          <ListChecks size={16} /> Hobbies
        </NavLink>
        <NavLink to="/settings" className={navClass}>
          <Settings size={16} /> Settings
        </NavLink>
      </nav>

      <div className="flex-1" />

      <div className="px-3 pb-3.5">
        <button
          onClick={toggleTheme}
          className="flex h-8.5 w-full items-center gap-2.5 rounded-sm px-2.5 text-[13px] text-muted transition-colors hover:bg-ink/5 hover:text-ink-soft"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </aside>
  )
}
