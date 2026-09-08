import { NavLink } from 'react-router-dom'
import { CalendarDays, LayoutDashboard, ListChecks } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useDataStore } from '../../store/useDataStore'
import { useTimerStore } from '../../store/useTimerStore'

const linkBase =
  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors'

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    linkBase,
    isActive
      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  )
}

export function Sidebar() {
  const allHobbies = useDataStore((s) => s.hobbies)
  const hobbies = allHobbies.filter((h) => !h.archived)
  const activeTimerHobby = useTimerStore((s) => s.hobbyId)

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 px-5 py-4">
        <CalendarDays className="text-indigo-600 dark:text-indigo-400" size={22} />
        <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Hobby Tracker
        </span>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        <NavLink to="/" end className={navClass}>
          <LayoutDashboard size={17} /> Dashboard
        </NavLink>
        <NavLink to="/hobbies" className={navClass}>
          <ListChecks size={17} /> Hobbies
        </NavLink>
      </nav>

      <div className="mt-6 px-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Your hobbies
      </div>
      <div className="mt-2 flex-1 overflow-y-auto px-3 pb-4">
        {hobbies.length === 0 && (
          <p className="px-3 py-2 text-sm text-slate-400">Nothing yet</p>
        )}
        {hobbies.map((h) => (
          <NavLink key={h.id} to={`/hobby/${h.id}`} className={navClass}>
            <span className="text-base leading-none">{h.icon}</span>
            <span className="truncate">{h.name}</span>
            {activeTimerHobby === h.id && (
              <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
