import { useState } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import type { Session } from '../../db/types'
import { formatDuration, parseDurationInput } from '../../lib/time'
import { dayKey, prettyDate } from '../../lib/date'
import { useDataStore } from '../../store/useDataStore'

interface Props {
  sessions: Session[]
  /** Renders a hobby chip + dot per row; omit on a single-hobby list. */
  hobbyMeta?: (hobbyId: string) => { name: string; color: string }
  /** Puts the duration in a fixed left column instead of the right. */
  durationFirst?: boolean
}

export function SessionList({ sessions, hobbyMeta, durationFirst }: Props) {
  if (sessions.length === 0) {
    return <p className="py-8 text-center text-[12.5px] text-muted">No sessions logged yet.</p>
  }
  return (
    <ul className="divide-y divide-line-soft">
      {sessions.map((s) => (
        <SessionRow
          key={s.id}
          session={s}
          meta={hobbyMeta?.(s.hobbyId)}
          durationFirst={durationFirst}
        />
      ))}
    </ul>
  )
}

function SessionRow({
  session,
  meta,
  durationFirst,
}: {
  session: Session
  meta?: { name: string; color: string }
  durationFirst?: boolean
}) {
  const editSession = useDataStore((s) => s.editSession)
  const removeSession = useDataStore((s) => s.removeSession)
  const [editing, setEditing] = useState(false)
  const [duration, setDuration] = useState('')
  const [note, setNote] = useState('')

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

  const input =
    'rounded-sm border border-line-strong bg-well px-2 py-1 text-[12.5px] text-ink outline-none focus:border-accent'
  const when = formatDistanceToNow(parseISO(session.startedAt), { addSuffix: true })
  const value = formatDuration(session.durationSeconds)

  return (
    <li className="group flex items-center gap-3 py-2.5">
      {durationFirst && !editing && (
        <span className="num w-16 shrink-0 text-[12.8px] text-ink">{value}</span>
      )}
      {editing && (
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className={`w-16 shrink-0 ${input}`}
          aria-label="Duration"
        />
      )}

      {!durationFirst && !editing && meta && (
        <span
          className="h-1.75 w-1.75 shrink-0 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
      )}

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note"
            className={`w-full ${input}`}
            aria-label="Note"
          />
        ) : (
          <div className="truncate text-[12.8px] text-ink">{session.note || '—'}</div>
        )}
        <div className="mt-0.5 text-[11px] text-muted" title={prettyDate(dayKey(session.startedAt))}>
          {meta ? `${meta.name} · ${when}` : when}
        </div>
      </div>

      {!durationFirst && !editing && (
        <span className="num shrink-0 text-[12.8px] text-ink">{value}</span>
      )}

      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {editing ? (
          <>
            <button
              onClick={save}
              className="rounded-sm p-1.5 text-accent transition-colors hover:bg-accent/15"
              aria-label="Save session"
            >
              <Check size={15} />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-sm p-1.5 text-muted transition-colors hover:bg-ink/5"
              aria-label="Cancel edit"
            >
              <X size={15} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={startEditing}
              className="rounded-sm p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label="Edit session"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => removeSession(session.id)}
              className="rounded-sm p-1.5 text-muted transition-colors hover:bg-danger/15 hover:text-danger-text"
              aria-label="Delete session"
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    </li>
  )
}
