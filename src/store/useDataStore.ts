import { create } from 'zustand'
import { backend } from '../db'
import { applyHobbyPatch, newId, nowIso } from '../db/backend'
import {
  type DailyCheck,
  type DataBundle,
  type Hobby,
  type HobbyInput,
  type HobbyPatch,
  type Session,
  type SessionInput,
  type SessionPatch,
  type Snapshot,
  SNAPSHOT_VERSION,
} from '../db/types'
import { dayKey, todayKey } from '../lib/date'

interface DataState {
  hydrated: boolean
  hobbies: Hobby[]
  sessions: Session[]
  checks: DailyCheck[]

  hydrate: () => Promise<void>

  addHobby: (input: HobbyInput) => Promise<Hobby>
  editHobby: (id: string, patch: HobbyPatch) => Promise<void>
  removeHobby: (id: string) => Promise<void>
  reorder: (orderedIds: string[]) => Promise<void>

  addSession: (input: SessionInput) => Promise<void>
  editSession: (id: string, patch: SessionPatch) => Promise<void>
  removeSession: (id: string) => Promise<void>

  ensureCheck: (hobbyId: string, date: string) => Promise<void>
  toggleCheck: (hobbyId: string, date?: string) => Promise<void>
  isChecked: (hobbyId: string, date?: string) => boolean

  exportSnapshot: () => Snapshot
  importSnapshot: (snapshot: Snapshot) => Promise<void>
  resetAll: () => Promise<void>
}

export const useDataStore = create<DataState>((set, get) => ({
  hydrated: false,
  hobbies: [],
  sessions: [],
  checks: [],

  hydrate: async () => {
    const { hobbies, sessions, checks } = await backend().loadAll()
    set({ hobbies, sessions, checks, hydrated: true })
  },

  addHobby: async (input) => {
    const hobby = await backend().createHobby(input)
    set((s) => ({ hobbies: [...s.hobbies, hobby] }))
    return hobby
  },

  editHobby: async (id, patch) => {
    await backend().updateHobby(id, patch)
    set((s) => ({
      hobbies: s.hobbies.map((h) => (h.id === id ? applyHobbyPatch(h, patch) : h)),
    }))
  },

  removeHobby: async (id) => {
    await backend().deleteHobby(id)
    set((s) => ({
      hobbies: s.hobbies.filter((h) => h.id !== id),
      sessions: s.sessions.filter((x) => x.hobbyId !== id),
      checks: s.checks.filter((c) => c.hobbyId !== id),
    }))
  },

  reorder: async (orderedIds) => {
    await backend().reorderHobbies(orderedIds)
    set((s) => ({
      hobbies: [...s.hobbies].sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)),
    }))
  },

  addSession: async (input) => {
    const session = await backend().createSession(input)
    set((s) => ({ sessions: [session, ...s.sessions] }))
    const hobby = get().hobbies.find((h) => h.id === input.hobbyId)
    if (hobby?.trackStreak) {
      await get().ensureCheck(session.hobbyId, dayKey(session.startedAt))
    }
  },

  editSession: async (id, patch) => {
    await backend().updateSession(id, patch)
    set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  },

  removeSession: async (id) => {
    await backend().deleteSession(id)
    set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) }))
  },

  ensureCheck: async (hobbyId, date) => {
    if (get().checks.some((c) => c.hobbyId === hobbyId && c.date === date)) return
    await backend().addCheck(hobbyId, date)
    set((s) => ({
      checks: [...s.checks, { id: newId(), hobbyId, date, createdAt: nowIso() }],
    }))
  },

  toggleCheck: async (hobbyId, date = todayKey()) => {
    const has = get().checks.some((c) => c.hobbyId === hobbyId && c.date === date)
    if (has) {
      await backend().removeCheck(hobbyId, date)
      set((s) => ({
        checks: s.checks.filter((c) => !(c.hobbyId === hobbyId && c.date === date)),
      }))
    } else {
      await get().ensureCheck(hobbyId, date)
    }
  },

  isChecked: (hobbyId, date = todayKey()) =>
    get().checks.some((c) => c.hobbyId === hobbyId && c.date === date),

  exportSnapshot: () => {
    const { hobbies, sessions, checks } = get()
    return {
      app: 'hobby-tracker',
      version: SNAPSHOT_VERSION,
      exportedAt: nowIso(),
      hobbies,
      sessions,
      checks,
    }
  },

  importSnapshot: async (snapshot) => {
    const bundle: DataBundle = {
      hobbies: snapshot.hobbies,
      sessions: snapshot.sessions,
      checks: snapshot.checks,
    }
    await backend().replaceAll(bundle)
    await get().hydrate()
  },

  resetAll: async () => {
    await backend().clearAll()
    set({ hobbies: [], sessions: [], checks: [] })
  },
}))

/**
 * Validates a parsed JSON blob as a Hobby Tracker backup.
 * Throws with a human-readable reason so Settings can surface it.
 */
export function parseSnapshot(raw: unknown): Snapshot {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('That file does not contain valid backup data.')
  }
  const s = raw as Partial<Snapshot>
  if (s.app !== 'hobby-tracker') {
    throw new Error('That file is not a Hobby Tracker backup.')
  }
  if (typeof s.version !== 'number' || s.version > SNAPSHOT_VERSION) {
    throw new Error(
      `Backup version ${String(s.version)} is newer than this app supports (${SNAPSHOT_VERSION}).`,
    )
  }
  if (!Array.isArray(s.hobbies) || !Array.isArray(s.sessions) || !Array.isArray(s.checks)) {
    throw new Error('Backup is missing hobbies, sessions, or check-ins.')
  }
  return {
    app: 'hobby-tracker',
    version: s.version,
    exportedAt: s.exportedAt ?? nowIso(),
    hobbies: s.hobbies,
    sessions: s.sessions,
    checks: s.checks,
  }
}
