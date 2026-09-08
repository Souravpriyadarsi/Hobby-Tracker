import Database from '@tauri-apps/plugin-sql'
import { type Backend, newId, nowIso } from './backend'
import {
  type DailyCheckRow,
  type DataBundle,
  type Hobby,
  type HobbyInput,
  type HobbyPatch,
  type HobbyRow,
  type Session,
  type SessionInput,
  type SessionPatch,
  type SessionRow,
  dailyCheckFromRow,
  hobbyFromRow,
  sessionFromRow,
} from './types'

const DB_URL = 'sqlite:hobby.db'

let dbPromise: Promise<Database> | null = null

/** Shared connection; migrations run on the Rust side at first load. */
function getDb(): Promise<Database> {
  if (!dbPromise) dbPromise = Database.load(DB_URL)
  return dbPromise
}

/** Builds `SET a = $1, b = $2` from a patch, skipping undefined fields. */
function buildUpdate(mapping: Array<[string, unknown]>) {
  const sets: string[] = []
  const args: unknown[] = []
  for (const [col, val] of mapping) {
    if (val === undefined) continue
    args.push(val)
    sets.push(`${col} = $${args.length}`)
  }
  return { sets, args }
}

export const sqliteBackend: Backend = {
  kind: 'sqlite',

  async describe() {
    return 'SQLite database in the app data folder'
  },

  async loadAll(): Promise<DataBundle> {
    const db = await getDb()
    const [hobbies, sessions, checks] = await Promise.all([
      db.select<HobbyRow[]>(
        'SELECT * FROM hobbies ORDER BY archived ASC, sort_order ASC, created_at ASC',
      ),
      db.select<SessionRow[]>('SELECT * FROM sessions ORDER BY started_at DESC'),
      db.select<DailyCheckRow[]>('SELECT * FROM daily_checks'),
    ])
    return {
      hobbies: hobbies.map(hobbyFromRow),
      sessions: sessions.map(sessionFromRow),
      checks: checks.map(dailyCheckFromRow),
    }
  },

  async createHobby(input: HobbyInput): Promise<Hobby> {
    const db = await getDb()
    const id = newId()
    const createdAt = nowIso()
    const [{ next }] = await db.select<{ next: number }[]>(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM hobbies',
    )
    await db.execute(
      `INSERT INTO hobbies
         (id, name, icon, color, daily_goal_minutes, track_streak, archived, sort_order, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8)`,
      [
        id,
        input.name,
        input.icon,
        input.color,
        input.dailyGoalMinutes,
        input.trackStreak ? 1 : 0,
        next,
        createdAt,
      ],
    )
    return { id, ...input, archived: false, sortOrder: next, createdAt }
  },

  async updateHobby(id: string, patch: HobbyPatch) {
    const db = await getDb()
    const { sets, args } = buildUpdate([
      ['name', patch.name],
      ['icon', patch.icon],
      ['color', patch.color],
      ['daily_goal_minutes', patch.dailyGoalMinutes],
      ['track_streak', patch.trackStreak === undefined ? undefined : patch.trackStreak ? 1 : 0],
      ['archived', patch.archived === undefined ? undefined : patch.archived ? 1 : 0],
    ])
    if (sets.length === 0) return
    args.push(id)
    await db.execute(`UPDATE hobbies SET ${sets.join(', ')} WHERE id = $${args.length}`, args)
  },

  async deleteHobby(id: string) {
    const db = await getDb()
    // Explicit cascade — the plugin doesn't guarantee PRAGMA foreign_keys is on.
    await db.execute('DELETE FROM daily_checks WHERE hobby_id = $1', [id])
    await db.execute('DELETE FROM sessions WHERE hobby_id = $1', [id])
    await db.execute('DELETE FROM hobbies WHERE id = $1', [id])
  },

  async reorderHobbies(orderedIds: string[]) {
    const db = await getDb()
    for (let i = 0; i < orderedIds.length; i++) {
      await db.execute('UPDATE hobbies SET sort_order = $1 WHERE id = $2', [i, orderedIds[i]])
    }
  },

  async createSession(input: SessionInput): Promise<Session> {
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
    return { id, ...input, note, createdAt }
  },

  async updateSession(id: string, patch: SessionPatch) {
    const db = await getDb()
    const { sets, args } = buildUpdate([
      ['duration_seconds', patch.durationSeconds],
      ['note', patch.note],
      ['started_at', patch.startedAt],
    ])
    if (sets.length === 0) return
    args.push(id)
    await db.execute(`UPDATE sessions SET ${sets.join(', ')} WHERE id = $${args.length}`, args)
  },

  async deleteSession(id: string) {
    const db = await getDb()
    await db.execute('DELETE FROM sessions WHERE id = $1', [id])
  },

  async addCheck(hobbyId: string, date: string) {
    const db = await getDb()
    await db.execute(
      `INSERT INTO daily_checks (id, hobby_id, date, created_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT(hobby_id, date) DO NOTHING`,
      [newId(), hobbyId, date, nowIso()],
    )
  },

  async removeCheck(hobbyId: string, date: string) {
    const db = await getDb()
    await db.execute('DELETE FROM daily_checks WHERE hobby_id = $1 AND date = $2', [hobbyId, date])
  },

  async clearAll() {
    const db = await getDb()
    await db.execute('DELETE FROM daily_checks')
    await db.execute('DELETE FROM sessions')
    await db.execute('DELETE FROM hobbies')
  },

  async replaceAll(bundle: DataBundle) {
    const db = await getDb()
    await this.clearAll()
    for (const h of bundle.hobbies) {
      await db.execute(
        `INSERT INTO hobbies
           (id, name, icon, color, daily_goal_minutes, track_streak, archived, sort_order, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          h.id,
          h.name,
          h.icon,
          h.color,
          h.dailyGoalMinutes,
          h.trackStreak ? 1 : 0,
          h.archived ? 1 : 0,
          h.sortOrder,
          h.createdAt,
        ],
      )
    }
    for (const s of bundle.sessions) {
      await db.execute(
        `INSERT INTO sessions
           (id, hobby_id, started_at, ended_at, duration_seconds, note, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [s.id, s.hobbyId, s.startedAt, s.endedAt, s.durationSeconds, s.note, s.createdAt],
      )
    }
    for (const c of bundle.checks) {
      await db.execute(
        `INSERT INTO daily_checks (id, hobby_id, date, created_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT(hobby_id, date) DO NOTHING`,
        [c.id, c.hobbyId, c.date, c.createdAt],
      )
    }
  },
}
