import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent-solid text-on-accent hover:brightness-105',
  secondary: 'border border-line-strong text-ink-soft hover:bg-ink/5',
  ghost: 'text-muted hover:bg-ink/5',
  danger: 'bg-danger text-on-danger hover:brightness-110',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-[13px]',
}

export function Button({ variant = 'primary', size = 'md', className, ...rest }: Props) {
  return (
    <button
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-sm font-medium',
        'transition-colors disabled:pointer-events-none disabled:opacity-40',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  )
}

/** Square icon-only button, sized to sit level with a `md` Button. */
export function IconButton({
  className,
  label,
  bordered = true,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; bordered?: boolean }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm',
        'text-muted transition-colors hover:bg-ink/5 hover:text-ink',
        'disabled:pointer-events-none disabled:opacity-40',
        bordered && 'border border-line',
        className,
      )}
      {...rest}
    />
  )
}
