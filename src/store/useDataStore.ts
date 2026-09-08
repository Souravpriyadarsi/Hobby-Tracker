import { create } from 'zustand'
import {
  type HobbyInput,
  createHobby,
  deleteHobby,
  listHobbies,
  reorderHobbies,
  updateHobby,
} from '../db/hobbies'
import {
  type SessionInput,
  createSession,
  deleteSession,
  listSessions,
  updateSession,
} from '../db/sessions'
import { addCheck, listChecks, removeCheck } from '../db/dailyChecks'
import { newId, nowIso } from '../db/client'
import type { DailyCheck, Hobby, Session } from '../db/types'
import { dayKey, todayKey } from '../lib/date'

interface DataState {
  hydrated: boolean
  hobbies: Hobby[]
  sessions: Session[]
  checks: DailyCheck[]

  hydrate: () => Promise<void>

  addHobby: (input: HobbyInput) => Promise<Hobby>
  editHobby: (id: string, patch: Partial<HobbyInput> & { archived?: boolean }) => Promise<void>
  removeHobby: (id: string) => Promise<void>
  reorder: (orderedIds: string[]) => Promise<void>

  addSession: (input: SessionInput) => Promise<void>
  editSession: (
    id: string,
    patch: { durationSeconds?: number; note?: string; startedAt?: string },
  ) => Promise<void>
  removeSession: (id: string) => Promise<void>

  ensureCheck: (hobbyId: string, date: string) => Promise<void>
  toggleCheck: (hobbyId: string, date?: string) => Promise<void>
  isChecked: (hobbyId: string, date?: string) => boolean
}

export const useDataStore = create<DataState>((set, get) => ({
  hydrated: false,
  hobbies: [],
  sessions: [],
  checks: [],

  hydrate: async () => {
    const [hobbies, sessions, checks] = await Promise.all([
      listHobbies(),
      listSessions(),
      listChecks(),
    ])
    set({ hobbies, sessions, checks, hydrated: true })
  },

  addHobby: async (input) => {
    const hobby = await createHobby(input)
    set((s) => ({ hobbies: [...s.hobbies, hobby] }))
    return hobby
  },

  editHobby: async (id, patch) => {
    await updateHobby(id, patch)
    set((s) => ({
      hobbies: s.hobbies.map((h) => (h.id === id ? applyHobbyPatch(h, patch) : h)),
    }))
  },

  removeHobby: async (id) => {
    await deleteHobby(id)
    set((s) => ({
      hobbies: s.hobbies.filter((h) => h.id !== id),
      sessions: s.sessions.filter((x) => x.hobbyId !== id),
      checks: s.checks.filter((c) => c.hobbyId !== id),
    }))
  },

  reorder: async (orderedIds) => {
    await reorderHobbies(orderedIds)
    set((s) => ({
      hobbies: [...s.hobbies].sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)),
    }))
  },

  addSession: async (input) => {
    const session = await createSession(input)
    set((s) => ({ sessions: [session, ...s.sessions] }))
    const hobby = get().hobbies.find((h) => h.id === input.hobbyId)
    if (hobby?.trackStreak) {
      await get().ensureCheck(session.hobbyId, dayKey(session.startedAt))
    }
  },

  editSession: async (id, patch) => {
    await updateSession(id, patch)
    set((s) => ({ sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  },

  removeSession: async (id) => {
    await deleteSession(id)
    set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) }))
  },

  ensureCheck: async (hobbyId, date) => {
    if (get().checks.some((c) => c.hobbyId === hobbyId && c.date === date)) return
    await addCheck(hobbyId, date)
    set((s) => ({
      checks: [...s.checks, { id: newId(), hobbyId, date, createdAt: nowIso() }],
    }))
  },

  toggleCheck: async (hobbyId, date = todayKey()) => {
    const has = get().checks.some((c) => c.hobbyId === hobbyId && c.date === date)
    if (has) {
      await removeCheck(hobbyId, date)
      set((s) => ({
        checks: s.checks.filter((c) => !(c.hobbyId === hobbyId && c.date === date)),
      }))
    } else {
      await get().ensureCheck(hobbyId, date)
    }
  },

  isChecked: (hobbyId, date = todayKey()) =>
    get().checks.some((c) => c.hobbyId === hobbyId && c.date === date),
}))

function applyHobbyPatch(
  h: Hobby,
  patch: Partial<HobbyInput> & { archived?: boolean },
): Hobby {
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
