import { createElement } from 'react'
import { hobbyIconComponent } from '../../lib/hobbyIcons'
import { cn } from '../../lib/cn'

interface Props {
  icon: string
  /** Hobby accent — tints the tile and colours the glyph. */
  color: string
  /** Tile edge length in px. The glyph scales to ~55% of it. */
  size?: number
  className?: string
}

/**
 * The hobby's mark: its lucide glyph on a tile tinted with its own colour.
 *
 * `createElement` rather than `const Icon = …; <Icon />` — the glyph is picked at
 * runtime from a fixed set of module-level components, and the local-variable
 * form reads to linters as defining a component inside render.
 */
export function HobbyIcon({ icon, color, size = 32, className }: Props) {
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-sm', className)}
      style={{ width: size, height: size, backgroundColor: `${color}26`, color }}
    >
      {createElement(hobbyIconComponent(icon), { size: Math.round(size * 0.55) })}
    </span>
  )
}
