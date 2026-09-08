import { type Backend, applyHobbyPatch, newId, nowIso } from './backend'
import type {
  DailyCheck,
  DataBundle,
  Hobby,
  HobbyInput,
  HobbyPatch,
  Session,
  SessionInput,
  SessionPatch,
} from './types'

const KEY = 'hobby-tracker.data'

const EMPTY: DataBundle = { hobbies: [], sessions: [], checks: [] }

function read(): DataBundle {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as Partial<DataBundle>
    return {
      hobbies: parsed.hobbies ?? [],
      sessions: parsed.sessions ?? [],
      checks: parsed.checks ?? [],
    }
  } catch {
    return { ...EMPTY }
  }
}

function write(bundle: DataBundle): void {
  localStorage.setItem(KEY, JSON.stringify(bundle))
}

function mutate(fn: (b: DataBundle) => void): void {
  const bundle = read()
  fn(bundle)
  write(bundle)
}

/**
 * Browser fallback so `npm run dev` is fully usable without the Tauri shell.
 * Data lives in localStorage and is separate from the desktop app's SQLite file —
 * move between them with Settings > Backup / Restore.
 */
export const localBackend: Backend = {
  kind: 'local',

  async describe() {
    return 'Browser local storage (development mode)'
  },

  async loadAll(): Promise<DataBundle> {
    const b = read()
    return {
      hobbies: [...b.hobbies].sort(
        (x, y) =>
          Number(x.archived) - Number(y.archived) ||
          x.sortOrder - y.sortOrder ||
          x.createdAt.localeCompare(y.createdAt),
      ),
      sessions: [...b.sessions].sort((x, y) => y.startedAt.localeCompare(x.startedAt)),
      checks: b.checks,
    }
  },

  async createHobby(input: HobbyInput): Promise<Hobby> {
    const b = read()
    const sortOrder = b.hobbies.reduce((max, h) => Math.max(max, h.sortOrder), -1) + 1
    const hobby: Hobby = {
      id: newId(),
      ...input,
      archived: false,
      sortOrder,
      createdAt: nowIso(),
    }
    b.hobbies.push(hobby)
    write(b)
    return hobby
  },

  async updateHobby(id: string, patch: HobbyPatch) {
    mutate((b) => {
      b.hobbies = b.hobbies.map((h) => (h.id === id ? applyHobbyPatch(h, patch) : h))
    })
  },

  async deleteHobby(id: string) {
    mutate((b) => {
      b.hobbies = b.hobbies.filter((h) => h.id !== id)
      b.sessions = b.sessions.filter((s) => s.hobbyId !== id)
      b.checks = b.checks.filter((c) => c.hobbyId !== id)
    })
  },

  async reorderHobbies(orderedIds: string[]) {
    mutate((b) => {
      b.hobbies = b.hobbies.map((h) => {
        const i = orderedIds.indexOf(h.id)
        return i === -1 ? h : { ...h, sortOrder: i }
      })
    })
  },

  async createSession(input: SessionInput): Promise<Session> {
    const session: Session = {
      id: newId(),
      ...input,
      note: input.note ?? '',
      createdAt: nowIso(),
    }
    mutate((b) => {
      b.sessions.unshift(session)
    })
    return session
  },

  async updateSession(id: string, patch: SessionPatch) {
    mutate((b) => {
      b.sessions = b.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s))
    })
  },

  async deleteSession(id: string) {
    mutate((b) => {
      b.sessions = b.sessions.filter((s) => s.id !== id)
    })
  },

  async addCheck(hobbyId: string, date: string) {
    mutate((b) => {
      if (b.checks.some((c) => c.hobbyId === hobbyId && c.date === date)) return
      const check: DailyCheck = { id: newId(), hobbyId, date, createdAt: nowIso() }
      b.checks.push(check)
    })
  },

  async removeCheck(hobbyId: string, date: string) {
    mutate((b) => {
      b.checks = b.checks.filter((c) => !(c.hobbyId === hobbyId && c.date === date))
    })
  },

  async clearAll() {
    write({ ...EMPTY })
  },

  async replaceAll(bundle: DataBundle) {
    write({
      hobbies: bundle.hobbies,
      sessions: bundle.sessions,
      checks: bundle.checks,
    })
  },
}
