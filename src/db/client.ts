import Database from '@tauri-apps/plugin-sql'

const DB_URL = 'sqlite:hobby.db'

let dbPromise: Promise<Database> | null = null

/**
 * Returns the shared SQLite connection, loading it (and running migrations)
 * on first use. Migrations are registered on the Rust side in `src-tauri/src/lib.rs`.
 */
export function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load(DB_URL)
  }
  return dbPromise
}

export function newId(): string {
  return crypto.randomUUID()
}

export function nowIso(): string {
  return new Date().toISOString()
}
