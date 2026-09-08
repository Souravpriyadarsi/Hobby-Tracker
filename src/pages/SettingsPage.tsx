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
import { Page, PageTitle } from '../components/layout/Page'
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
    <Page title={<PageTitle>Settings</PageTitle>}>
      <div className="max-w-3xl space-y-3">
        <Card>
          <CardTitle>Appearance</CardTitle>
          <p className="mb-3.5 text-[12px] text-muted">
            Your choice is remembered on this device.
          </p>
          <div className="flex gap-2">
            <ThemeChoice
              active={theme === 'light'}
              onClick={() => setTheme('light')}
              icon={<Sun size={14} />}
              label="Light"
            />
            <ThemeChoice
              active={theme === 'dark'}
              onClick={() => setTheme('dark')}
              icon={<Moon size={14} />}
              label="Dark"
            />
          </div>
        </Card>

        <Card>
          <CardTitle>Your data</CardTitle>

          <div className="flex items-start gap-3 rounded-sm border border-line bg-well px-4 py-3">
            <Database size={16} className="mt-0.5 shrink-0 text-muted" />
            <div>
              <p className="text-[12.8px] text-ink">{storageLabel || 'Checking…'}</p>
              <p className="num mt-0.5 text-[11.5px] text-muted">
                {hobbies.length} hobbies · {sessions.length} sessions · {checks.length} check-ins
              </p>
              {!isTauri() && (
                <p className="mt-1.5 text-[11px] text-faint">
                  You&apos;re running in a browser. Data here is separate from the desktop app —
                  use Backup and Restore to move between them.
                </p>
              )}
            </div>
          </div>

          <Row
            title="Back up data"
            description="Save everything to a JSON file you can keep or move to another machine."
            action={
              <Button onClick={handleBackup} disabled={busy}>
                <Download size={14} /> Back up
              </Button>
            }
          />
          <Row
            title="Restore from backup"
            description="Load a backup file. This replaces everything currently in the app."
            last
            action={
              <Button variant="secondary" onClick={handlePickRestore} disabled={busy}>
                <Upload size={14} /> Restore
              </Button>
            }
          />
        </Card>

        <Card>
          <CardTitle>
            <span className="text-danger-text">Danger zone</span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-4 rounded-sm border border-danger-line bg-danger-tint px-4 py-3">
            <div className="min-w-48 flex-1">
              <p className="text-[12.8px] text-ink">Reset all data</p>
              <p className="mt-0.5 text-[11.5px] text-muted">
                Permanently deletes every hobby, session, and check-in. Back up first.
              </p>
            </div>
            <Button variant="danger" onClick={() => setConfirmReset(true)} disabled={busy}>
              <RotateCcw size={14} /> Reset
            </Button>
          </div>
        </Card>

        {feedback && (
          <div
            role="status"
            className={cn(
              'flex items-start gap-2.5 rounded-sm border px-4 py-3 text-[12.5px]',
              feedback.kind === 'ok'
                ? 'border-accent-line bg-accent-tint text-accent'
                : 'border-danger-line bg-danger-tint text-danger-text',
            )}
          >
            {feedback.kind === 'ok' ? (
              <Check size={15} className="mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            )}
            <span className="break-all">{feedback.text}</span>
          </div>
        )}

        <p className="flex items-center gap-2 px-0.5 text-[11.5px] text-faint">
          <Monitor size={13} />
          Hobby Tracker {__APP_VERSION__} · {isTauri() ? 'desktop' : 'browser'} mode
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
  last,
}: {
  title: string
  description: string
  action: ReactNode
  last?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 py-3.5',
        !last && 'border-b border-line-soft',
      )}
    >
      <div className="min-w-48 flex-1">
        <p className="text-[12.8px] text-ink">{title}</p>
        <p className="mt-0.5 text-[11.5px] text-muted">{description}</p>
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
        'inline-flex h-9 items-center gap-2 rounded-sm px-4 text-[12.5px] transition-colors',
        active
          ? 'border border-accent-line bg-accent-tint font-medium text-accent'
          : 'border border-line-strong text-muted hover:text-ink',
      )}
    >
      {active ? <Check size={14} /> : icon}
      {label}
    </button>
  )
}

function message(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}
