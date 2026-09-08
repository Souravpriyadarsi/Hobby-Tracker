import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

/** Material 3 button emphasis levels. */
type Variant = 'filled' | 'tonal' | 'outlined' | 'text' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  filled: 'bg-primary text-on-primary shadow-e1 hover:shadow-e2 hover:brightness-105',
  tonal: 'bg-secondary-container text-on-secondary-container hover:brightness-95',
  outlined:
    'border border-outline text-primary hover:bg-primary/8 dark:hover:bg-primary/12',
  text: 'text-on-surface-variant hover:bg-on-surface/8',
  danger: 'bg-error text-on-error shadow-e1 hover:brightness-105',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
}

export function Button({ variant = 'filled', size = 'md', className, ...rest }: Props) {
  return (
    <button
      className={cn(
        // M3 buttons are fully rounded with a generous target area.
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium',
        'transition-all duration-150 active:scale-[0.98]',
        'disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  )
}

/** Circular icon-only button — M3 "icon button". */
export function IconButton({
  className,
  label,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
        'text-on-surface-variant transition-colors hover:bg-on-surface/8',
        'disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...rest}
    />
  )
}
