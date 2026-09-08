import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { IconButton } from './Button'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

/** Material 3 dialog: 28px radius, high surface container, scrim behind. */
export function Modal({ open, title, onClose, children, footer }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--md-scrim)' }}
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[85vh] w-full max-w-md overflow-hidden rounded-[28px] bg-surface-high text-on-surface shadow-e3"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-2">
          <h2 className="text-xl font-normal text-on-surface">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-2">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 pt-3 pb-5">{footer}</div>}
      </div>
    </div>
  )
}
