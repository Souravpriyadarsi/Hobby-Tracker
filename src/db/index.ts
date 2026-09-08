import type { Backend } from './backend'
import { localBackend } from './localBackend'
import { sqliteBackend } from './sqliteBackend'

/** True when running inside the Tauri desktop shell (vs. a plain browser). */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

let cached: Backend | null = null

/**
 * SQLite in the desktop app, localStorage in the browser. Resolved once so the
 * two never get mixed within a session.
 */
export function backend(): Backend {
  if (!cached) cached = isTauri() ? sqliteBackend : localBackend
  return cached
}

export type { Backend } from './backend'
