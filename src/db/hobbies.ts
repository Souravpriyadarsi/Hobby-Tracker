import { getDb, newId, nowIso } from './client'
import { type Hobby, type HobbyRow, hobbyFromRow } from './types'

export interface HobbyInput {
  name: string
  icon: string
  color: string
  dailyGoalMinutes: number | null
  trackStreak: boolean
}

export async function listHobbies(): Promise<Hobby[]> {
  const db = await getDb()
  const rows = await db.select<HobbyRow[]>(
    'SELECT * FROM hobbies ORDER BY archived ASC, sort_order ASC, created_at ASC',
  )
  return rows.map(hobbyFromRow)
}

export async function createHobby(input: HobbyInput): Promise<Hobby> {
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
  return {
    id,
    name: input.name,
    icon: input.icon,
    color: input.color,
    dailyGoalMinutes: input.dailyGoalMinutes,
    trackStreak: input.trackStreak,
    archived: false,
    sortOrder: next,
    createdAt,
  }
}

export async function updateHobby(
  id: string,
  patch: Partial<HobbyInput> & { archived?: boolean },
): Promise<void> {
  const db = await getDb()
  const sets: string[] = []
  const args: unknown[] = []
  const push = (col: string, val: unknown) => {
    args.push(val)
    sets.push(`${col} = $${args.length}`)
  }
  if (patch.name !== undefined) push('name', patch.name)
  if (patch.icon !== undefined) push('icon', patch.icon)
  if (patch.color !== undefined) push('color', patch.color)
  if (patch.dailyGoalMinutes !== undefined) push('daily_goal_minutes', patch.dailyGoalMinutes)
  if (patch.trackStreak !== undefined) push('track_streak', patch.trackStreak ? 1 : 0)
  if (patch.archived !== undefined) push('archived', patch.archived ? 1 : 0)
  if (sets.length === 0) return
  args.push(id)
  await db.execute(`UPDATE hobbies SET ${sets.join(', ')} WHERE id = $${args.length}`, args)
}

export async function deleteHobby(id: string): Promise<void> {
  const db = await getDb()
  // Explicit cascade — the plugin doesn't guarantee PRAGMA foreign_keys is on.
  await db.execute('DELETE FROM daily_checks WHERE hobby_id = $1', [id])
  await db.execute('DELETE FROM sessions WHERE hobby_id = $1', [id])
  await db.execute('DELETE FROM hobbies WHERE id = $1', [id])
}

export async function reorderHobbies(orderedIds: string[]): Promise<void> {
  const db = await getDb()
  for (let i = 0; i < orderedIds.length; i++) {
    await db.execute('UPDATE hobbies SET sort_order = $1 WHERE id = $2', [i, orderedIds[i]])
  }
}
