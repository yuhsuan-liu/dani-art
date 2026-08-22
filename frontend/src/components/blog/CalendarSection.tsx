import { useState, type FormEvent } from 'react'
import type { CalendarEvent } from '../../types'

type Props = {
  events: CalendarEvent[]
  canEdit: boolean
  onAdd: (input: { date: string; title: string }) => Promise<void>
  onEdit: (event: CalendarEvent, input: { date: string; title: string }) => Promise<void>
  onDelete: (event: CalendarEvent) => Promise<void>
}

function formatMd(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate
  return `${month}/${day}`
}

export function CalendarSection({ events, canEdit, onAdd, onEdit, onDelete }: Props) {
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!date || !title.trim()) {
      setError('Add a date and a short note.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onAdd({ date, title })
      setDate('')
      setTitle('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add date')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="frame-inset">
      <h2 className="text-xs font-medium tracking-[0.2em] text-stone-400 uppercase">
        Calendar
      </h2>

      <ul className="mt-5 space-y-3">
        {events.length === 0 && (
          <li className="text-stone-400">No dates yet.</li>
        )}
        {events.map((item) => (
          <li key={item.id} className="group">
            {editingId === item.id ? (
              <form
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
                onSubmit={async (event) => {
                  event.preventDefault()
                  if (!editDate || !editTitle.trim()) return
                  setSaving(true)
                  try {
                    await onEdit(item, { date: editDate, title: editTitle })
                    setEditingId(null)
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Could not save')
                  } finally {
                    setSaving(false)
                  }
                }}
              >
                <input
                  type="date"
                  value={editDate}
                  onChange={(event) => setEditDate(event.target.value)}
                  className="input-line sm:w-auto"
                />
                <input
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  className="input-line min-w-0 flex-1"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className="btn-a">
                    save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="btn-c"
                  >
                    cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-baseline gap-6">
                <span className="w-12 shrink-0 tabular-nums text-stone-500">
                  {formatMd(item.date)}
                </span>
                <span className="min-w-0 flex-1 text-stone-900">{item.title}</span>
                {canEdit && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(item.id)
                        setEditDate(item.date)
                        setEditTitle(item.title)
                      }}
                      className="btn-c"
                    >
                      edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="btn-c"
                    >
                      remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {canEdit && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="input-line sm:w-auto"
            />
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="artfare at..."
              className="input-line min-w-0 flex-1"
            />
            <button type="submit" disabled={saving} className="btn-a self-start">
              {saving ? 'adding…' : 'add'}
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </section>
  )
}
