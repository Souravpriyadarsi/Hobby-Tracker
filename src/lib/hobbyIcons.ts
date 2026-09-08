import {
  Bike,
  BookOpen,
  Camera,
  Code,
  CookingPot,
  Dumbbell,
  Film,
  Flower2,
  Footprints,
  Gamepad2,
  Guitar,
  Languages,
  type LucideIcon,
  Mic,
  Mountain,
  Palette,
  PenLine,
  Puzzle,
  Shirt,
  Target,
  Waves,
} from 'lucide-react'

export interface HobbyIconOption {
  /** Stored in the `icon` column. Stable — renaming one orphans saved hobbies. */
  key: string
  label: string
  Icon: LucideIcon
}

/** Twenty options, ten per row in the picker. */
export const HOBBY_ICONS: readonly HobbyIconOption[] = [
  { key: 'target', label: 'General', Icon: Target },
  { key: 'book-open', label: 'Reading', Icon: BookOpen },
  { key: 'pen-line', label: 'Writing', Icon: PenLine },
  { key: 'languages', label: 'Languages', Icon: Languages },
  { key: 'code', label: 'Coding', Icon: Code },
  { key: 'palette', label: 'Art', Icon: Palette },
  { key: 'camera', label: 'Photography', Icon: Camera },
  { key: 'film', label: 'Film', Icon: Film },
  { key: 'guitar', label: 'Instrument', Icon: Guitar },
  { key: 'mic', label: 'Singing', Icon: Mic },
  { key: 'gamepad-2', label: 'Gaming', Icon: Gamepad2 },
  { key: 'puzzle', label: 'Puzzles', Icon: Puzzle },
  { key: 'cooking-pot', label: 'Cooking', Icon: CookingPot },
  { key: 'flower-2', label: 'Gardening', Icon: Flower2 },
  { key: 'shirt', label: 'Textiles', Icon: Shirt },
  { key: 'footprints', label: 'Running', Icon: Footprints },
  { key: 'bike', label: 'Cycling', Icon: Bike },
  { key: 'dumbbell', label: 'Gym', Icon: Dumbbell },
  { key: 'mountain', label: 'Hiking', Icon: Mountain },
  { key: 'waves', label: 'Swimming', Icon: Waves },
]

export const DEFAULT_HOBBY_ICON = HOBBY_ICONS[0].key

const BY_KEY = new Map(HOBBY_ICONS.map((o) => [o.key, o]))

/**
 * Up to 1.0.0 the icon column held an emoji. Rather than migrate the database
 * (which would break 1.0.0 backups), old values are translated on read; the new
 * key is persisted the next time the hobby is saved.
 */
const LEGACY_EMOJI: Record<string, string> = {
  '🎯': 'target',
  '📚': 'book-open',
  '🎨': 'palette',
  '🎸': 'guitar',
  '🏃': 'footprints',
  '🧶': 'shirt',
  '♟️': 'puzzle',
  '♟': 'puzzle',
  '📷': 'camera',
  '✍️': 'pen-line',
  '✍': 'pen-line',
  '🍳': 'cooking-pot',
  '🌱': 'flower-2',
  '🧩': 'puzzle',
  '🎮': 'gamepad-2',
  '🏋️': 'dumbbell',
  '🏋': 'dumbbell',
}

/** Any stored value -> a key that exists in HOBBY_ICONS. */
export function normalizeHobbyIcon(icon: string | null | undefined): string {
  if (icon && BY_KEY.has(icon)) return icon
  const mapped = icon ? LEGACY_EMOJI[icon] : undefined
  return mapped ?? DEFAULT_HOBBY_ICON
}

export function hobbyIconComponent(icon: string | null | undefined): LucideIcon {
  return BY_KEY.get(normalizeHobbyIcon(icon))!.Icon
}
