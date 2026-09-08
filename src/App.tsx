import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { HobbiesPage } from './pages/HobbiesPage'
import { HobbyDetailPage } from './pages/HobbyDetailPage'
import { useDataStore } from './store/useDataStore'

function App() {
  const hydrate = useDataStore((s) => s.hydrate)
  const hydrated = useDataStore((s) => s.hydrated)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    hydrate().catch((e) => {
      console.error(e)
      setError(e instanceof Error ? e.message : String(e))
    })
  }, [hydrate])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <p className="text-sm font-medium text-red-600">Couldn&apos;t open the database</p>
          <p className="mt-1 text-xs text-slate-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
