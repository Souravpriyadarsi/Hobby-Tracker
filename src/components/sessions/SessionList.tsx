import { useState } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { Session } from '../../db/types'
import { formatDuration, parseDurationInput } from '../../lib/time'
import { prettyDate, dayKey } from '../../lib/date'
import { useDataStore } from '../../store/useDataStore'

interface Props {
  sessions: Session[]
  showHobby?: (hobbyId: string) => string
}

export function SessionList({ sessions, showHobby }: Props) {
  if (sessions.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">No sessions logged yet.</p>
  }
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {sessions.map((s) => (
        <SessionRow key={s.id} session={s} label={showHobby?.(s.hobbyId)} />
      ))}
    </ul>
  )
}

function SessionRow({ session, label }: { session: Session; label?: string }) {
  const editSession = useDataStore((s) => s.editSession)
  const removeSession = useDataStore((s) => s.removeSession)
  const [editing, setEditing] = useState(false)
  const [duration, setDuration] = useState(formatDuration(session.durationSeconds))
  const [note, setNote] = useState(session.note)

  async function save() {
    const minutes = parseDurationInput(duration)
    await editSession(session.id, {
      durationSeconds: minutes != null && minutes > 0 ? minutes * 60 : session.durationSeconds,
      note: note.trim(),
    })
    setEditing(false)
  }

  return (
    <li className="flex items-center gap-3 py-2.5 text-sm">
      <div className="w-20 shrink-0 font-mono tabular-nums text-slate-700 dark:text-slate-200">
        {editing ? (
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-16 rounded border border-slate-300 bg-white px-1.5 py-0.5 dark:border-slate-600 dark:bg-slate-800"
          />
        ) : (
          formatDuration(session.durationSeconds)
        )}
      </div>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note"
            className="w-full rounded border border-slate-300 bg-white px-2 py-0.5 dark:border-slate-600 dark:bg-slate-800"
          />
        ) : (
          <div className="truncate">
            {label && <span className="mr-2 text-slate-400">{label}</span>}
            <span className="text-slate-600 dark:text-slate-300">{session.note || '—'}</span>
          </div>
        )}
        <div className="text-xs text-slate-400" title={prettyDate(dayKey(session.startedAt))}>
          {formatDistanceToNow(parseISO(session.startedAt), { addSuffix: true })}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {editing ? (
          <>
            <button onClick={save} className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" aria-label="Save">
              <Check size={15} />
            </button>
            <button onClick={() => setEditing(false)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Cancel">
              <X size={15} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label="Edit session">
              <Pencil size={15} />
            </button>
            <button onClick={() => removeSession(session.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" aria-label="Delete session">
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    </li>
  )
}
