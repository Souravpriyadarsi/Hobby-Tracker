import { useState } from 'react'
import { Plus, Sparkles, Trash2 } from 'lucide-react'
import { Page, PageTitle } from '../components/layout/Page'
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
    <Page
      title={<PageTitle>Hobbies</PageTitle>}
      actions={
        <Button onClick={openNew}>
          <Plus size={15} /> New hobby
        </Button>
      }
    >
      {active.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={22} />}
          title="No hobbies yet"
          hint="Add your first hobby to start tracking time, building streaks, and keeping notes."
          action={
            <Button onClick={openNew}>
              <Plus size={15} /> New hobby
            </Button>
          }
        />
      ) : (
        <>
          <p className="mb-3 text-[11.5px] text-muted">
            {active.length} active {active.length === 1 ? 'hobby' : 'hobbies'}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((h) => (
              <HobbyCard
                key={h.id}
                hobby={h}
                onEdit={openEdit}
                onArchive={(hobby) => editHobby(hobby.id, { archived: true })}
              />
            ))}
          </div>
        </>
      )}

      {archived.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-2.5 text-[11.5px] font-medium text-muted">Archived</h2>
          <ul className="divide-y divide-line-soft overflow-hidden rounded-md border border-line bg-card">
            {archived.map((h) => (
              <li key={h.id} className="flex items-center gap-3 px-4 py-2.5">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-[13px]"
                  style={{ backgroundColor: `${h.color}26` }}
                >
                  {h.icon}
                </span>
                <span className="flex-1 truncate text-[12.8px] text-ink">{h.name}</span>
                <Button size="sm" variant="ghost" onClick={() => editHobby(h.id, { archived: false })}>
                  Restore
                </Button>
                <button
                  onClick={() => setDeleting(h)}
                  className="rounded-sm p-1.5 text-muted transition-colors hover:bg-danger/15 hover:text-danger-text"
                  aria-label={`Delete ${h.name} permanently`}
                >
                  <Trash2 size={15} />
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
