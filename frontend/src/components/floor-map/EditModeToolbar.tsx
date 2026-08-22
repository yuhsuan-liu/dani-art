type Props = {
  editMode: boolean
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  onToggle: () => void
  onAddFurniture: () => void
}

export function EditModeToolbar({ editMode, saveStatus, onToggle, onAddFurniture }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-stone-700">
          <span
            className={`relative h-6 w-11 rounded-full transition ${
              editMode ? 'bg-amber-600' : 'bg-stone-300'
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={editMode}
              onChange={onToggle}
            />
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${
                editMode ? 'translate-x-5' : ''
              }`}
            />
          </span>
          Edit mode
        </label>
        {editMode && (
          <span className="text-xs text-stone-500">
            Drag furniture to move. Click a piece to edit.
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {editMode && (
          <button
            type="button"
            onClick={onAddFurniture}
            className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm text-white"
          >
            Add furniture
          </button>
        )}
        <SaveBadge status={saveStatus} />
      </div>
    </div>
  )
}

function SaveBadge({ status }: { status: Props['saveStatus'] }) {
  if (status === 'idle') return null
  const label =
    status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save failed'
  const className =
    status === 'saving'
      ? 'text-stone-500'
      : status === 'saved'
        ? 'text-emerald-700'
        : 'text-red-600'
  return <span className={`text-xs ${className}`}>{label}</span>
}
