import type {
  DataBundle,
  Hobby,
  HobbyInput,
  HobbyPatch,
  Session,
  SessionInput,
  SessionPatch,
} from './types'

/**
 * Everything the app needs from storage. Two implementations exist:
 * `sqliteBackend` (inside the Tauri desktop app) and `localBackend`
 * (plain browser, so `npm run dev` works without the shell).
 */
export interface Backend {
  readonly kind: 'sqlite' | 'local'
  /** Human-readable description of where data lives, shown in Settings. */
  describe(): Promise<string>

  loadAll(): Promise<DataBundle>

  createHobby(input: HobbyInput): Promise<Hobby>
  updateHobby(id: string, patch: HobbyPatch): Promise<void>
  deleteHobby(id: string): Promise<void>
  reorderHobbies(orderedIds: string[]): Promise<void>

  createSession(input: SessionInput): Promise<Session>
  updateSession(id: string, patch: SessionPatch): Promise<void>
  deleteSession(id: string): Promise<void>

  addCheck(hobbyId: string, date: string): Promise<void>
  removeCheck(hobbyId: string, date: string): Promise<void>

  /** Wipe everything and write the given bundle. Used by restore-from-backup. */
  replaceAll(bundle: DataBundle): Promise<void>
  clearAll(): Promise<void>
}

export function newId(): string {
  return crypto.randomUUID()
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function applyHobbyPatch(h: Hobby, patch: HobbyPatch): Hobby {
  return {
    ...h,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.icon !== undefined ? { icon: patch.icon } : {}),
    ...(patch.color !== undefined ? { color: patch.color } : {}),
    ...(patch.dailyGoalMinutes !== undefined
      ? { dailyGoalMinutes: patch.dailyGoalMinutes }
      : {}),
    ...(patch.trackStreak !== undefined ? { trackStreak: patch.trackStreak } : {}),
    ...(patch.archived !== undefined ? { archived: patch.archived } : {}),
  }
}
