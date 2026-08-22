import { Pencil, Plus, Trash2, X } from 'lucide-react'
import type { Room } from '../../types'

type Props = {
  rooms: Room[]
  activeRoomId: string
  editMode?: boolean
  onSelect: (roomId: string) => void
  onAddRoom?: () => void
  onRenameRoom?: (room: Room) => void
  onDeleteRoom?: (room: Room) => void
}

export function RoomTabs({
  rooms,
  activeRoomId,
  editMode = false,
  onSelect,
  onAddRoom,
  onRenameRoom,
  onDeleteRoom,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {rooms.map((room) => {
        const active = room.id === activeRoomId
        return (
          <div key={room.id} className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(room.id)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                active
                  ? 'bg-stone-900 text-white'
                  : room.is_demo
                    ? 'border border-dashed border-stone-300 bg-stone-100 text-stone-500'
                    : 'border border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              {room.name}
              {room.is_demo ? ' · demo' : ''}
            </button>
            {editMode && active && (
              <>
                <button
                  type="button"
                  onClick={() => onRenameRoom?.(room)}
                  className="rounded-full border border-stone-300 bg-white p-1.5 text-stone-500 hover:text-stone-900"
                  aria-label="Rename room"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRoom?.(room)}
                  className="rounded-full border border-stone-300 bg-white p-1.5 text-stone-500 hover:text-red-700"
                  aria-label="Delete room"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        )
      })}
      {editMode && (
        <button
          type="button"
          onClick={onAddRoom}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-stone-400 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Room
        </button>
      )}
    </div>
  )
}

export function RoomNameDialog({
  title,
  initialName,
  onConfirm,
  onCancel,
}: {
  title: string
  initialName: string
  onConfirm: (name: string) => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
      <form
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          onConfirm(String(data.get('name') || '').trim())
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg text-stone-900">{title}</h3>
          <button type="button" onClick={onCancel} aria-label="Close">
            <X className="h-4 w-4 text-stone-500" />
          </button>
        </div>
        <input
          name="name"
          defaultValue={initialName}
          autoFocus
          className="w-full rounded-lg border border-stone-300 px-3 py-2"
          placeholder="Room name"
        />
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
