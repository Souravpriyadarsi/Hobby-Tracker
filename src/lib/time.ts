/** "1h 23m", "45m", "38s", "0m" */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  if (s < 60) return `${s}s`
  const minutes = Math.round(s / 60)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Stopwatch style: "MM:SS" under an hour, otherwise "H:MM:SS". */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return hh > 0 ? `${hh}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`
}

/**
 * Parse a free-form duration into minutes.
 * Accepts "1h 30m", "90", "90m", "1.5h", "1:30". Returns null if unparseable.
 */
export function parseDurationInput(raw: string): number | null {
  const text = raw.trim().toLowerCase()
  if (!text) return null

  // "1:30" -> 90
  const colon = text.match(/^(\d+):(\d{1,2})$/)
  if (colon) {
    const h = Number(colon[1])
    const m = Number(colon[2])
    return h * 60 + m
  }

  // "1h 30m", "1h", "30m", "1.5h"
  const hm = text.match(/^(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+(?:\.\d+)?)\s*m)?$/)
  if (hm && (hm[1] || hm[2])) {
    const h = hm[1] ? Number(hm[1]) : 0
    const m = hm[2] ? Number(hm[2]) : 0
    return Math.round(h * 60 + m)
  }

  // Bare number -> minutes
  const bare = text.match(/^(\d+(?:\.\d+)?)$/)
  if (bare) return Math.round(Number(bare[1]))

  return null
}
