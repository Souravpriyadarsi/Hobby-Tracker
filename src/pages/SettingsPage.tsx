import { type ReactNode, useEffect, useState } from 'react'
import {
  AlertTriangle,
  Check,
  Database,
  Download,
  Monitor,
  Moon,
  RotateCcw,
  Sun,
  Upload,
} from 'lucide-react'
import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { backend, isTauri } from '../db'
import { parseSnapshot, useDataStore } from '../store/useDataStore'
import { useUiStore } from '../store/useUiStore'
import { openTextFile, saveTextFile } from '../lib/fileIO'
import { todayKey } from '../lib/date'
import { cn } from '../lib/cn'

type Feedback = { kind: 'ok' | 'error'; text: string } | null

export function SettingsPage() {
  const hobbies = useDataStore((s) => s.hobbies)
  const sessions = useDataStore((s) => s.sessions)
  const checks = useDataStore((s) => s.checks)
  const exportSnapshot = useDataStore((s) => s.exportSnapshot)
  const importSnapshot = useDataStore((s) => s.importSnapshot)
  const resetAll = useDataStore((s) => s.resetAll)

  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  const [feedback, setFeedback] = useState<Feedback>(null)
  const [busy, setBusy] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [storageLabel, setStorageLabel] = useState('')

  useEffect(() => {
    void backend().describe().then(setStorageLabel)
  }, [])

  // Clear the status message after a while so it doesn't linger.
  useEffect(() => {
    if (!feedback) return
    const id = setTimeout(() => setFeedback(null), 6000)
    return () => clearTimeout(id)
  }, [feedback])

  async function handleBackup() {
    setBusy(true)
    try {
      const json = JSON.stringify(exportSnapshot(), null, 2)
      const where = await saveTextFile(`hobby-tracker-backup-${todayKey()}.json`, json)
      setFeedback(
        where
          ? { kind: 'ok', text: `Backup saved to ${where}` }
          : { kind: 'ok', text: 'Backup cancelled.' },
      )
    } catch (e) {
      setFeedback({ kind: 'error', text: message(e) })
    } finally {
      setBusy(false)
    }
  }

  async function handlePickRestore() {
    setBusy(true)
    try {
      const text = await openTextFile()
      if (text == null) {
        setBusy(false)
        return
      }
      // Validate before asking to confirm, so bad files fail fast.
      parseSnapshot(JSON.parse(text))
      setConfirmRestore(text)
    } catch (e) {
      setFeedback({ kind: 'error', text: message(e) })
    } finally {
      setBusy(false)
    }
  }

  async function applyRestore(text: string) {
    setConfirmRestore(null)
    setBusy(true)
    try {
      const snapshot = parseSnapshot(JSON.parse(text))
      await importSnapshot(snapshot)
      setFeedback({
        kind: 'ok',
        text: `Restored ${snapshot.hobbies.length} hobbies and ${snapshot.sessions.length} sessions.`,
      })
    } catch (e) {
      setFeedback({ kind: 'error', text: message(e) })
    } finally {
      setBusy(false)
    }
  }

  async function applyReset() {
    setConfirmReset(false)
    setBusy(true)
    try {
      await resetAll()
      setFeedback({ kind: 'ok', text: 'All data erased.' })
    } catch (e) {
      setFeedback({ kind: 'error', text: message(e) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title="Settings">
      <div className="space-y-5">
        <Card>
          <CardTitle>Appearance</CardTitle>
          <p className="mb-4 text-sm text-on-surface-variant">
            Choose how Hobby Tracker looks. Your choice is remembered.
          </p>
          <div className="flex flex-wrap gap-2">
            <ThemeChoice
              active={theme === 'light'}
              onClick={() => setTheme('light')}
              icon={<Sun size={17} />}
              label="Light"
            />
            <ThemeChoice
              active={theme === 'dark'}
              onClick={() => setTheme('dark')}
              icon={<Moon size={17} />}
              label="Dark"
            />
          </div>
        </Card>

        <Card>
          <CardTitle>Your data</CardTitle>
          <div className="mb-5 flex items-start gap-3 rounded-2xl bg-surface-container px-4 py-3">
            <Database size={18} className="mt-0.5 shrink-0 text-on-surface-variant" />
            <div className="text-sm">
              <p className="text-on-surface">{storageLabel || 'Checking…'}</p>
              <p className="mt-0.5 text-on-surface-variant">
                {hobbies.length} hobbies · {sessions.length} sessions · {checks.length} check-ins
              </p>
              {!isTauri() && (
                <p className="mt-1.5 text-xs text-on-surface-variant">
                  You&apos;re running in a browser. Data here is separate from the desktop app —
                  use Backup and Restore to move between them.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Row
              title="Back up data"
              description="Save everything to a JSON file you can keep or move to another machine."
              action={
                <Button variant="tonal" onClick={handleBackup} disabled={busy}>
                  <Download size={17} /> Back up
                </Button>
              }
            />
            <Row
              title="Restore from backup"
              description="Load a backup file. This replaces everything currently in the app."
              action={
                <Button variant="outlined" onClick={handlePickRestore} disabled={busy}>
                  <Upload size={17} /> Restore
                </Button>
              }
            />
          </div>
        </Card>

        <Card>
          <CardTitle>
            <span className="text-error">Danger zone</span>
          </CardTitle>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-error-container px-4 py-3.5 text-on-error-container">
            <div className="min-w-48 flex-1">
              <p className="text-sm font-medium">Reset all data</p>
              <p className="mt-0.5 text-sm opacity-80">
                Permanently deletes every hobby, session, and check-in. Back up first.
              </p>
            </div>
            <Button variant="danger" onClick={() => setConfirmReset(true)} disabled={busy}>
              <RotateCcw size={17} /> Reset
            </Button>
          </div>
        </Card>

        {feedback && (
          <div
            role="status"
            className={cn(
              'flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm',
              feedback.kind === 'ok'
                ? 'bg-success-container text-on-success-container'
                : 'bg-error-container text-on-error-container',
            )}
          >
            {feedback.kind === 'ok' ? (
              <Check size={17} className="mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            )}
            <span className="break-all">{feedback.text}</span>
          </div>
        )}

        <p className="flex items-center gap-2 px-1 text-xs text-on-surface-variant">
          <Monitor size={14} />
          Hobby Tracker · {isTauri() ? 'desktop' : 'browser'} mode
        </p>
      </div>

      <ConfirmDialog
        open={confirmRestore != null}
        title="Restore from backup?"
        message="This replaces every hobby, session, and check-in currently in the app with the contents of the backup file. This cannot be undone."
        confirmLabel="Replace my data"
        destructive
        onCancel={() => setConfirmRestore(null)}
        onConfirm={() => confirmRestore && applyRestore(confirmRestore)}
      />

      <ConfirmDialog
        open={confirmReset}
        title="Reset all data?"
        message="Every hobby, session, and check-in will be permanently deleted. This cannot be undone."
        confirmLabel="Erase everything"
        destructive
        onCancel={() => setConfirmReset(false)}
        onConfirm={applyReset}
      />
    </Page>
  )
}

function Row({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-container px-4 py-3.5">
      <div className="min-w-48 flex-1">
        <p className="text-sm font-medium text-on-surface">{title}</p>
        <p className="mt-0.5 text-sm text-on-surface-variant">{description}</p>
      </div>
      {action}
    </div>
  )
}

function ThemeChoice({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors',
        active
          ? 'bg-secondary-container text-on-secondary-container'
          : 'border border-outline text-on-surface-variant hover:bg-on-surface/8',
      )}
    >
      {active ? <Check size={17} /> : icon}
      {label}
    </button>
  )
}

function message(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}
