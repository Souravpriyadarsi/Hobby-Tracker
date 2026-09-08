import { getDb, newId, nowIso } from './client'
import { type DailyCheck, type DailyCheckRow, dailyCheckFromRow } from './types'

export async function listChecks(hobbyId?: string): Promise<DailyCheck[]> {
  const db = await getDb()
  const rows = hobbyId
    ? await db.select<DailyCheckRow[]>('SELECT * FROM daily_checks WHERE hobby_id = $1', [hobbyId])
    : await db.select<DailyCheckRow[]>('SELECT * FROM daily_checks')
  return rows.map(dailyCheckFromRow)
}

/** Ensure a check row exists for the given hobby + day. No-op if already present. */
export async function addCheck(hobbyId: string, date: string): Promise<void> {
  const db = await getDb()
  await db.execute(
    `INSERT INTO daily_checks (id, hobby_id, date, created_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT(hobby_id, date) DO NOTHING`,
    [newId(), hobbyId, date, nowIso()],
  )
}

export async function removeCheck(hobbyId: string, date: string): Promise<void> {
  const db = await getDb()
  await db.execute('DELETE FROM daily_checks WHERE hobby_id = $1 AND date = $2', [hobbyId, date])
}
