import { useState } from 'react'
import { Archive, Plus, Sparkles, Trash2 } from 'lucide-react'
import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { HobbyCard } from '../components/hobbies/HobbyCard'
import { HobbyFormModal } from '../components/hobbies/HobbyFormModal'
import type { Hobby } from '../db/types'
import type { HobbyInput } from '../db/hobbies'
import { useDataStore } from '../store/useDataStore'

export function HobbiesPage() {
  const hobbies = useDataStore((s) => s.hobbies)
  const addHobby = useDataStore((s) => s.addHobby)
  const editHobby = useDataStore((s) => s.editHobby)
  const removeHobby = useDataStore((s) => s.removeHobby)

  const [formOpen, setFormOpen] = useState(false)
  const [editingHobby, setEditingHobby] = useState<Hobby | null>(null)
  const [deleting, setDeleting] = useState<Hobby | null>(null)

  const active = hobbies.filter((h) => !h.archived)
  const archived = hobbies.filter((h) => h.archived)

  function openNew() {
    setEditingHobby(null)
    setFormOpen(true)
  }

  function openEdit(h: Hobby) {
    setEditingHobby(h)
    setFormOpen(true)
  }

  async function handleSubmit(input: HobbyInput) {
    if (editingHobby) await editHobby(editingHobby.id, input)
    else await addHobby(input)
    setFormOpen(false)
  }

  return (
    <Page title="Hobbies">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {active.length} active {active.length === 1 ? 'hobby' : 'hobbies'}
        </p>
        <Button onClick={openNew}>
          <Plus size={16} /> New hobby
        </Button>
      </div>

      {active.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={28} />}
          title="No hobbies yet"
          hint="Add your first hobby to start tracking time, streaks, and notes."
          action={
            <Button onClick={openNew}>
              <Plus size={16} /> New hobby
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((h) => (
            <div key={h.id} className="group relative">
              <HobbyCard hobby={h} onEdit={openEdit} />
              <button
                onClick={() => editHobby(h.id, { archived: true })}
                className="absolute right-2 top-2 z-10 rounded-md bg-white/80 p-1.5 text-slate-400 opacity-0 backdrop-blur transition hover:text-slate-600 group-hover:opacity-100 dark:bg-slate-900/80"
                aria-label="Archive hobby"
                title="Archive"
              >
                <Archive size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Archived
          </h2>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {archived.map((h) => (
              <li key={h.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="text-lg">{h.icon}</span>
                <span className="flex-1 text-slate-600 dark:text-slate-300">{h.name}</span>
                <button
                  onClick={() => editHobby(h.id, { archived: false })}
                  className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Restore
                </button>
                <button
                  onClick={() => setDeleting(h)}
                  className="rounded p-1.5 text-slate-400 hover:text-red-600"
                  aria-label="Delete permanently"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <HobbyFormModal
        open={formOpen}
        hobby={editingHobby}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting != null}
        title="Delete hobby?"
        message={`This permanently deletes "${deleting?.name}" and all its sessions, check-ins, and notes. This cannot be undone.`}
        confirmLabel="Delete forever"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await removeHobby(deleting.id)
          setDeleting(null)
        }}
      />
    </Page>
  )
}
