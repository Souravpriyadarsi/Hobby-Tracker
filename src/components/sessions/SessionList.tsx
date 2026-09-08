import { useState } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { Session } from '../../db/types'
import { formatDuration, parseDurationInput } from '../../lib/time'
import { dayKey, prettyDate } from '../../lib/date'
import { useDataStore } from '../../store/useDataStore'

interface Props {
  sessions: Session[]
  showHobby?: (hobbyId: string) => string
}

export function SessionList({ sessions, showHobby }: Props) {
  if (sessions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-on-surface-variant">No sessions logged yet.</p>
    )
  }
  return (
    <ul className="divide-y divide-outline-variant">
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

  function startEditing() {
    setDuration(formatDuration(session.durationSeconds))
    setNote(session.note)
    setEditing(true)
  }

  const inputCls =
    'rounded-lg border border-outline-variant bg-surface-lowest px-2 py-1 text-sm text-on-surface outline-none focus:border-primary'

  return (
    <li className="flex items-center gap-3 py-3 text-sm">
      <div className="w-20 shrink-0 font-mono tabular-nums text-on-surface">
        {editing ? (
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={`w-18 ${inputCls}`}
            aria-label="Duration"
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
            className={`w-full ${inputCls}`}
            aria-label="Note"
          />
        ) : (
          <div className="truncate">
            {label && (
              <span className="mr-2 rounded-full bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
                {label}
              </span>
            )}
            <span className="text-on-surface">{session.note || '—'}</span>
          </div>
        )}
        <div className="mt-0.5 text-xs text-on-surface-variant" title={prettyDate(dayKey(session.startedAt))}>
          {formatDistanceToNow(parseISO(session.startedAt), { addSuffix: true })}
        </div>
      </div>

      <div className="flex shrink-0 items-center">
        {editing ? (
          <>
            <button
              onClick={save}
              className="rounded-full p-2 text-primary transition-colors hover:bg-primary/12"
              aria-label="Save session"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-on-surface/8"
              aria-label="Cancel edit"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={startEditing}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-on-surface/8"
              aria-label="Edit session"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => removeSession(session.id)}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-error/15 hover:text-error"
              aria-label="Delete session"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </li>
  )
}
