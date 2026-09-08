import { type ReactNode, useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import type { Hobby } from '../../db/types'
import type { HobbyInput } from '../../db/hobbies'
import { cn } from '../../lib/cn'

const ICONS = ['🎯', '📚', '🎨', '🎸', '🏃', '🧶', '♟️', '📷', '✍️', '🍳', '🌱', '🧩', '🎮', '🏋️']
const COLORS = [
  '#6366f1',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#0ea5e9',
  '#8b5cf6',
  '#ef4444',
  '#64748b',
]

interface Props {
  open: boolean
  hobby?: Hobby | null
  onClose: () => void
  onSubmit: (input: HobbyInput) => void | Promise<void>
}

export function HobbyFormModal({ open, hobby, onClose, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ICONS[0])
  const [color, setColor] = useState(COLORS[0])
  const [goal, setGoal] = useState('')
  const [trackStreak, setTrackStreak] = useState(true)

  useEffect(() => {
    if (!open) return
    setName(hobby?.name ?? '')
    setIcon(hobby?.icon ?? ICONS[0])
    setColor(hobby?.color ?? COLORS[0])
    setGoal(hobby?.dailyGoalMinutes ? String(hobby.dailyGoalMinutes) : '')
    setTrackStreak(hobby?.trackStreak ?? true)
  }, [open, hobby])

  const canSave = name.trim().length > 0

  function submit() {
    if (!canSave) return
    const parsedGoal = Number.parseInt(goal, 10)
    void onSubmit({
      name: name.trim(),
      icon,
      color,
      dailyGoalMinutes: Number.isFinite(parsedGoal) && parsedGoal > 0 ? parsedGoal : null,
      trackStreak,
    })
  }

  return (
    <Modal
      open={open}
      title={hobby ? 'Edit hobby' : 'New hobby'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSave}>
            {hobby ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="e.g. Guitar practice"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800"
          />
        </Field>

        <Field label="Icon">
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={cn(
                  'h-9 w-9 rounded-lg text-lg',
                  icon === i
                    ? 'bg-indigo-100 ring-2 ring-indigo-500 dark:bg-indigo-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700',
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Color">
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={cn(
                  'h-7 w-7 rounded-full',
                  color === c && 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900',
                )}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </Field>

        <Field label="Daily goal (minutes, optional)">
          <input
            type="number"
            min={0}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. 30"
            className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={trackStreak}
            onChange={(e) => setTrackStreak(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
          />
          Track streaks &amp; show on heatmap
        </label>
      </div>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      {children}
    </div>
  )
}
