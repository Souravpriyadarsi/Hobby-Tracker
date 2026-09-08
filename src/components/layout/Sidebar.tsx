import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListChecks, Settings, Sprout } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useDataStore } from '../../store/useDataStore'
import { useTimerStore } from '../../store/useTimerStore'

/** Material 3 navigation drawer item: full-pill, tonal when active. */
function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex h-14 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors',
    isActive
      ? 'bg-secondary-container text-on-secondary-container'
      : 'text-on-surface-variant hover:bg-on-surface/8',
  )
}

export function Sidebar() {
  const allHobbies = useDataStore((s) => s.hobbies)
  const hobbies = allHobbies.filter((h) => !h.archived)
  const activeTimerHobby = useTimerStore((s) => s.hobbyId)

  return (
    <aside className="flex w-68 shrink-0 flex-col bg-surface-low">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <Sprout size={19} />
        </span>
        <span className="text-[17px] font-medium text-on-surface">Hobby Tracker</span>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        <NavLink to="/" end className={navClass}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/hobbies" className={navClass}>
          <ListChecks size={20} /> Hobbies
        </NavLink>
      </nav>

      <div className="mt-5 px-7 pb-1 text-xs font-medium tracking-wide text-on-surface-variant">
        Your hobbies
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
        {hobbies.length === 0 && (
          <p className="px-4 py-2 text-sm text-on-surface-variant/70">Nothing yet</p>
        )}
        {hobbies.map((h) => (
          <NavLink key={h.id} to={`/hobby/${h.id}`} className={navClass}>
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
              style={{ backgroundColor: `${h.color}33` }}
            >
              {h.icon}
            </span>
            <span className="truncate">{h.name}</span>
            {activeTimerHobby === h.id && (
              <span className="ml-auto h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary" />
            )}
          </NavLink>
        ))}
      </div>

      <nav className="flex flex-col gap-1 px-3 pb-4">
        <NavLink to="/settings" className={navClass}>
          <Settings size={20} /> Settings
        </NavLink>
      </nav>
    </aside>
  )
}
