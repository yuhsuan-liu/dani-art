import type { Room, RoomDecor } from '../types'

export const DEFAULT_ROOM_DECOR: RoomDecor = {
  wall_style: 'warm',
  floor_style: 'oak',
  carpet: { enabled: true, tone: 'sand' },
}

export function normalizeRoomDecor(raw: unknown): RoomDecor {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_ROOM_DECOR }

  const value = raw as Partial<RoomDecor>
  return {
    wall_style: value.wall_style === 'neutral' ? 'neutral' : 'warm',
    floor_style: value.floor_style === 'plain' ? 'plain' : 'oak',
    carpet: {
      enabled: value.carpet?.enabled !== false,
      tone:
        value.carpet?.tone === 'rose' || value.carpet?.tone === 'slate'
          ? value.carpet.tone
          : 'sand',
    },
  }
}

export function roomDecorClasses(decor: RoomDecor): string {
  return [
    'room-shell',
    decor.wall_style === 'neutral' ? 'room-walls-neutral' : 'room-walls-warm',
    decor.floor_style === 'plain' ? 'room-floor-plain' : 'room-floor-oak',
    decor.carpet.enabled ? `room-carpet-${decor.carpet.tone}` : 'room-carpet-off',
  ].join(' ')
}

export function withRoomDecor(room: Room): Room {
  return { ...room, decor: normalizeRoomDecor(room.decor) }
}
