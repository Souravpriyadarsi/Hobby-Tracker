import { type ReactNode, useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { HobbiesPage } from './pages/HobbiesPage'
import { HobbyDetailPage } from './pages/HobbyDetailPage'
import { useDataStore } from './store/useDataStore'

type Status = 'loading' | 'ready' | 'no-bridge' | 'db-error'

function App() {
  const hydrate = useDataStore((s) => s.hydrate)
  const [status, setStatus] = useState<Status>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    async function run() {
      // The Tauri IPC bridge can attach a tick after the webview loads; retry briefly.
      let hasBridge = false
      for (let attempt = 0; attempt < 20; attempt++) {
        if ('__TAURI_INTERNALS__' in window) {
          hasBridge = true
          break
        }
        await new Promise((r) => setTimeout(r, 100))
      }
      if (cancelled) return
      if (!hasBridge) {
        setStatus('no-bridge')
        return
      }
      try {
        await hydrate()
        if (!cancelled) setStatus('ready')
      } catch (e) {
        if (cancelled) return
        console.error(e)
        setErrorMsg(e instanceof Error ? e.message : String(e))
        setStatus('db-error')
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [hydrate])

  if (status === 'no-bridge') {
    return (
      <Centered>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Open the Hobby Tracker app window
        </p>
        <p className="mt-1 max-w-xs text-xs text-slate-500">
          This page only works inside the desktop app. Run <code>npm run tauri dev</code> and use the
          window it opens — not a browser tab at localhost.
        </p>
      </Centered>
    )
  }

  if (status === 'db-error') {
    return (
      <Centered>
        <p className="text-sm font-medium text-red-600">Couldn&apos;t open the database</p>
        <p className="mt-1 text-xs text-slate-500">{errorMsg}</p>
      </Centered>
    )
  }

  if (status === 'loading') {
    return (
      <Centered>
        <p className="text-sm text-slate-400">Loading…</p>
      </Centered>
    )
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="hobbies" element={<HobbiesPage />} />
          <Route path="hobby/:id" element={<HobbyDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">{children}</div>
  )
}

export default App
