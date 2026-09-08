import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { FieldGroup, TextField } from '../ui/TextField'
import type { Hobby, HobbyInput } from '../../db/types'
import { HOBBY_COLORS, HOBBY_ICONS } from '../../lib/palette'
import { cn } from '../../lib/cn'

interface Props {
  hobby?: Hobby | null
  onClose: () => void
  onSubmit: (input: HobbyInput) => void | Promise<void>
}

/**
 * Callers mount this only while the dialog is open, keyed by hobby id, so the
 * fields initialise straight from props — no reset-on-open effect needed.
 */
export function HobbyFormModal({ hobby, onClose, onSubmit }: Props) {
  const [name, setName] = useState(hobby?.name ?? '')
  const [icon, setIcon] = useState<string>(hobby?.icon ?? HOBBY_ICONS[0])
  const [color, setColor] = useState<string>(hobby?.color ?? HOBBY_COLORS[0])
  const [goal, setGoal] = useState(hobby?.dailyGoalMinutes ? String(hobby.dailyGoalMinutes) : '')
  const [trackStreak, setTrackStreak] = useState(hobby?.trackStreak ?? true)

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
      open
      title={hobby ? 'Edit hobby' : 'New hobby'}
      onClose={onClose}
      footer={
        <>
          <Button variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSave}>
            {hobby ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="space-y-5 pb-1">
        <TextField
          label="Name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="e.g. Guitar practice"
        />

        <FieldGroup label="Icon">
          <div className="flex flex-wrap gap-1.5">
            {HOBBY_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={cn(
                  'h-10 w-10 rounded-full text-lg transition-colors',
                  icon === i
                    ? 'bg-primary-container ring-2 ring-primary'
                    : 'bg-surface-container hover:bg-surface-highest',
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Colour">
          <div className="flex flex-wrap gap-2.5">
            {HOBBY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface transition-transform hover:scale-110"
                aria-label={`Colour ${c}`}
                aria-pressed={color === c}
              >
                {color === c && <Check size={16} strokeWidth={3} className="text-black/60" />}
              </button>
            ))}
          </div>
        </FieldGroup>

        <TextField
          label="Daily goal (minutes, optional)"
          type="number"
          min={0}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. 30"
          className="w-36"
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-surface-container px-4 py-3 text-sm text-on-surface">
          <input
            type="checkbox"
            checked={trackStreak}
            onChange={(e) => setTrackStreak(e.target.checked)}
            className="h-4 w-4 rounded accent-primary"
          />
          Track streaks &amp; show on the heatmap
        </label>
      </div>
    </Modal>
  )
}
