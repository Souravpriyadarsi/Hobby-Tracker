import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

/** Material 3 outlined text field. */
export function TextField({ label, hint, error, className, id, ...rest }: Props) {
  const inputId =
    id ?? rest.name ?? label?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-on-surface-variant">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'h-11 rounded-xl border bg-surface-lowest px-3.5 text-sm text-on-surface',
          'placeholder:text-on-surface-variant/60 outline-none transition-colors',
          error
            ? 'border-error focus:border-error'
            : 'border-outline-variant focus:border-primary',
          className,
        )}
        {...rest}
      />
      {(error || hint) && (
        <span className={cn('text-xs', error ? 'text-error' : 'text-on-surface-variant')}>
          {error ?? hint}
        </span>
      )}
    </div>
  )
}

export function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-on-surface-variant">{label}</span>
      {children}
    </div>
  )
}
