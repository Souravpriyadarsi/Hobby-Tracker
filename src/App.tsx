import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { HobbiesPage } from './pages/HobbiesPage'
import { HobbyDetailPage } from './pages/HobbyDetailPage'
import { SettingsPage } from './pages/SettingsPage'
import { useDataStore } from './store/useDataStore'

function App() {
  const hydrate = useDataStore((s) => s.hydrate)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    hydrate().then(
      () => !cancelled && setStatus('ready'),
      (e: unknown) => {
        if (cancelled) return
        console.error(e)
        setErrorMsg(e instanceof Error ? e.message : String(e))
        setStatus('error')
      },
    )
    return () => {
      cancelled = true
    }
  }, [hydrate])

  if (status === 'error') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 bg-surface p-8 text-center">
        <p className="text-sm font-medium text-error">Couldn&apos;t load your data</p>
        <p className="max-w-md text-xs text-on-surface-variant">{errorMsg}</p>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex h-full items-center justify-center bg-surface">
        <p className="text-sm text-on-surface-variant">Loading…</p>
      </div>
    )
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="hobbies" element={<HobbiesPage />} />
          <Route path="hobby/:id" element={<HobbyDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
