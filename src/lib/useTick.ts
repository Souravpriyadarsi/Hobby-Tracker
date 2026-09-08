import { useEffect, useState } from 'react'

/** Re-renders the calling component every `ms` while `active`. */
export function useTick(active: boolean, ms = 1000): void {
  const [, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setN((n) => n + 1), ms)
    return () => clearInterval(id)
  }, [active, ms])
}
