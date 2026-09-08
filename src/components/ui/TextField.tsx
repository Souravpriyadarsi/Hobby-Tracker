import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export function TextField({ label, hint, error, className, id, ...rest }: Props) {
  const inputId =
    id ?? rest.name ?? label?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[11px] text-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'h-9 rounded-sm border bg-well px-3 text-[12.5px] text-ink',
          'placeholder:text-faint outline-none transition-colors',
          error ? 'border-danger' : 'border-line-strong focus:border-accent',
          className,
        )}
        {...rest}
      />
      {(error || hint) && (
        <span className={cn('text-[11px]', error ? 'text-danger-text' : 'text-muted')}>
          {error ?? hint}
        </span>
      )}
    </div>
  )
}

export function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] text-muted">{label}</span>
      {children}
    </div>
  )
}
