import { getDb, newId, nowIso } from './client'
import { type Session, type SessionRow, sessionFromRow } from './types'

export interface SessionInput {
  hobbyId: string
  startedAt: string
  endedAt: string
  durationSeconds: number
  note?: string
}

export async function listSessions(hobbyId?: string): Promise<Session[]> {
  const db = await getDb()
  const rows = hobbyId
    ? await db.select<SessionRow[]>(
        'SELECT * FROM sessions WHERE hobby_id = $1 ORDER BY started_at DESC',
        [hobbyId],
      )
    : await db.select<SessionRow[]>('SELECT * FROM sessions ORDER BY started_at DESC')
  return rows.map(sessionFromRow)
}

export async function createSession(input: SessionInput): Promise<Session> {
  const db = await getDb()
  const id = newId()
  const createdAt = nowIso()
  const note = input.note ?? ''
  await db.execute(
    `INSERT INTO sessions
       (id, hobby_id, started_at, ended_at, duration_seconds, note, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, input.hobbyId, input.startedAt, input.endedAt, input.durationSeconds, note, createdAt],
  )
  return {
    id,
    hobbyId: input.hobbyId,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    durationSeconds: input.durationSeconds,
    note,
    createdAt,
  }
}

export async function updateSession(
  id: string,
  patch: { durationSeconds?: number; note?: string; startedAt?: string },
): Promise<void> {
  const db = await getDb()
  const sets: string[] = []
  const args: unknown[] = []
  const push = (col: string, val: unknown) => {
    args.push(val)
    sets.push(`${col} = $${args.length}`)
  }
  if (patch.durationSeconds !== undefined) push('duration_seconds', patch.durationSeconds)
  if (patch.note !== undefined) push('note', patch.note)
  if (patch.startedAt !== undefined) push('started_at', patch.startedAt)
  if (sets.length === 0) return
  args.push(id)
  await db.execute(`UPDATE sessions SET ${sets.join(', ')} WHERE id = $${args.length}`, args)
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDb()
  await db.execute('DELETE FROM sessions WHERE id = $1', [id])
}
