// Row shapes as stored in SQLite. Integers are used for booleans (0/1).

export interface HobbyRow {
  id: string
  name: string
  icon: string
  color: string
  daily_goal_minutes: number | null
  track_streak: number
  archived: number
  sort_order: number
  created_at: string
}

export interface SessionRow {
  id: string
  hobby_id: string
  started_at: string
  ended_at: string
  duration_seconds: number
  note: string
  created_at: string
}

export interface DailyCheckRow {
  id: string
  hobby_id: string
  date: string
  created_at: string
}

// App-facing models (booleans as booleans).

export interface Hobby {
  id: string
  name: string
  icon: string
  color: string
  dailyGoalMinutes: number | null
  trackStreak: boolean
  archived: boolean
  sortOrder: number
  createdAt: string
}

export interface Session {
  id: string
  hobbyId: string
  startedAt: string
  endedAt: string
  durationSeconds: number
  note: string
  createdAt: string
}

export interface DailyCheck {
  id: string
  hobbyId: string
  date: string
  createdAt: string
}

export function hobbyFromRow(r: HobbyRow): Hobby {
  return {
    id: r.id,
    name: r.name,
    icon: r.icon,
    color: r.color,
    dailyGoalMinutes: r.daily_goal_minutes,
    trackStreak: r.track_streak === 1,
    archived: r.archived === 1,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

export function sessionFromRow(r: SessionRow): Session {
  return {
    id: r.id,
    hobbyId: r.hobby_id,
    startedAt: r.started_at,
    endedAt: r.ended_at,
    durationSeconds: r.duration_seconds,
    note: r.note,
    createdAt: r.created_at,
  }
}

export function dailyCheckFromRow(r: DailyCheckRow): DailyCheck {
  return {
    id: r.id,
    hobbyId: r.hobby_id,
    date: r.date,
    createdAt: r.created_at,
  }
}
