import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { FieldGroup, TextField } from '../ui/TextField'
import type { Hobby, HobbyInput } from '../../db/types'
import { HOBBY_COLORS } from '../../lib/palette'
import { HOBBY_ICONS, normalizeHobbyIcon } from '../../lib/hobbyIcons'
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
  // normalize so a hobby saved with the old emoji set pre-selects its mapping,
  // and saving migrates it to the new key.
  const [icon, setIcon] = useState<string>(normalizeHobbyIcon(hobby?.icon))
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
            {HOBBY_ICONS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setIcon(key)}
                title={label}
                aria-label={label}
                aria-pressed={icon === key}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-sm transition-colors',
                  icon === key
                    ? 'bg-accent-tint text-accent ring-1 ring-accent'
                    : 'bg-well text-muted hover:bg-raised hover:text-ink',
                )}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Colour">
          <div className="flex flex-wrap gap-2">
            {HOBBY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className="flex h-7 w-7 items-center justify-center rounded-sm transition-transform hover:scale-110"
                aria-label={`Colour ${c}`}
                aria-pressed={color === c}
              >
                {color === c && <Check size={14} strokeWidth={3} className="text-black/65" />}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-faint">
            Six colours, chosen so any two hobbies stay distinguishable in charts.
          </p>
        </FieldGroup>

        <TextField
          label="Daily goal (minutes, optional)"
          type="number"
          min={0}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. 30"
          className="w-32"
        />

        <label className="flex cursor-pointer items-center gap-2.5 rounded-sm border border-line bg-well px-3 py-2.5 text-[12.5px] text-ink">
          <input
            type="checkbox"
            checked={trackStreak}
            onChange={(e) => setTrackStreak(e.target.checked)}
            className="h-3.5 w-3.5 rounded-xs accent-accent-solid"
          />
          Track streaks &amp; show on the heatmap
        </label>
      </div>
    </Modal>
  )
}
