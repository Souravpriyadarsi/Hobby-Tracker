import { useState } from 'react'
import { Plus, Sparkles, Trash2 } from 'lucide-react'
import { Page } from '../components/layout/Page'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { HobbyCard } from '../components/hobbies/HobbyCard'
import { HobbyFormModal } from '../components/hobbies/HobbyFormModal'
import type { Hobby, HobbyInput } from '../db/types'
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
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-on-surface-variant">
          {active.length} active {active.length === 1 ? 'hobby' : 'hobbies'}
        </p>
        <Button onClick={openNew}>
          <Plus size={18} /> New hobby
        </Button>
      </div>

      {active.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={28} />}
          title="No hobbies yet"
          hint="Add your first hobby to start tracking time, building streaks, and keeping notes."
          action={
            <Button size="lg" onClick={openNew}>
              <Plus size={18} /> New hobby
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((h) => (
            <HobbyCard
              key={h.id}
              hobby={h}
              onEdit={openEdit}
              onArchive={(hobby) => editHobby(hobby.id, { archived: true })}
            />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 px-1 text-sm font-medium text-on-surface-variant">Archived</h2>
          <ul className="overflow-hidden rounded-3xl bg-surface-low">
            {archived.map((h, i) => (
              <li
                key={h.id}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm ${
                  i > 0 ? 'border-t border-outline-variant' : ''
                }`}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${h.color}33` }}
                >
                  {h.icon}
                </span>
                <span className="flex-1 truncate text-on-surface">{h.name}</span>
                <Button
                  size="sm"
                  variant="text"
                  onClick={() => editHobby(h.id, { archived: false })}
                >
                  Restore
                </Button>
                <button
                  onClick={() => setDeleting(h)}
                  className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-error/15 hover:text-error"
                  aria-label={`Delete ${h.name} permanently`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {formOpen && (
        <HobbyFormModal
          key={editingHobby?.id ?? 'new'}
          hobby={editingHobby}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={deleting != null}
        title="Delete hobby?"
        message={`This permanently deletes "${deleting?.name}" along with all its sessions and check-ins. This cannot be undone.`}
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
