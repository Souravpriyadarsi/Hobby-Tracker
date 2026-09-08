import { type FormEvent, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'
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
  const [error, setError] = useState<string | undefined>()

  async function submit(e: FormEvent) {
    e.preventDefault()
    const minutes = parseDurationInput(duration)
    if (minutes == null || minutes <= 0) {
      setError('Try "45m" or "1h 30m"')
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
    setError(undefined)
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-start gap-2.5">
      <TextField
        id="manual-duration"
        label="Duration"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="45m"
        error={error}
        className="w-24"
      />
      <TextField
        id="manual-date"
        label="Date"
        type="date"
        value={date}
        max={todayKey()}
        onChange={(e) => setDate(e.target.value)}
        className="w-40"
      />
      <div className="min-w-40 flex-1">
        <TextField
          id="manual-note"
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What did you work on?"
        />
      </div>
      <Button type="submit" className="mt-6">
        <Plus size={15} /> Add
      </Button>
    </form>
  )
}
