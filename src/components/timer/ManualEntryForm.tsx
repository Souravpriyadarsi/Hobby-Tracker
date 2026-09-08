import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { parseDurationInput } from '../../lib/time'
import { todayKey } from '../../lib/date'
import { useDataStore } from '../../store/useDataStore'

interface Props {
  hobbyId: string
}

export function ManualEntryForm({ hobbyId }: Props) {
  const addSession = useDataStore((s) => s.addSession)
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState(todayKey())
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const minutes = parseDurationInput(duration)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (minutes == null || minutes <= 0) {
      setError('Enter a duration like "45m" or "1h 30m"')
      return
    }
    // Anchor manual entries at local noon so the calendar day is unambiguous.
    const start = new Date(`${date}T12:00:00`)
    const end = new Date(start.getTime() + minutes * 60_000)
    await addSession({
      hobbyId,
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      durationSeconds: minutes * 60,
      note: note.trim(),
    })
    setDuration('')
    setNote('')
    setError(null)
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Duration</span>
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="45m"
          className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Date</span>
        <input
          type="date"
          value={date}
          max={todayKey()}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800"
        />
      </label>
      <label className="flex min-w-[10rem] flex-1 flex-col gap-1">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Note (optional)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What did you work on?"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800"
        />
      </label>
      <Button type="submit">
        <Plus size={16} /> Add
      </Button>
      {error && <p className="w-full text-xs text-red-500">{error}</p>}
    </form>
  )
}
