import type { Room } from '../../types'

type Props = {
  rooms: Room[]
  activeRoomId: string
  onSelect: (roomId: string) => void
}

export function RoomTabs({ rooms, activeRoomId, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {rooms.map((room) => {
        const active = room.id === activeRoomId
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelect(room.id)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              active
                ? 'bg-stone-900 text-white'
                : 'border border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            {room.name}
          </button>
        )
      })}
    </div>
  )
}
