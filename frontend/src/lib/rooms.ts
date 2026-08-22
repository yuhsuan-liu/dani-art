import { MOCK_FURNITURE, MOCK_ROOMS } from '../data/mockRegistry'
import { wait } from './utils'
import type { Furniture, Room } from '../types'
// import { apiRequest } from './api'

/**
 * Expected backend contract:
 *   GET /artists/:artistId/rooms → Room[]
 *   GET /rooms/:roomId/furniture → Furniture[]
 */
export async function getRoomsByArtist(artistId: string): Promise<Room[]> {
  // return apiRequest<Room[]>(`/artists/${artistId}/rooms`)
  await wait()
  const matched = MOCK_ROOMS.filter((room) => room.artist_id === artistId)
  // Until rooms API is live, fall back to Dani's demo rooms
  const rooms =
    matched.length > 0
      ? matched
      : MOCK_ROOMS.filter((room) => room.artist_id === 'dani')
  return rooms.sort((a, b) => a.order - b.order)
}

export async function getFurnitureByRoom(roomId: string): Promise<Furniture[]> {
  // return apiRequest<Furniture[]>(`/rooms/${roomId}/furniture`)
  await wait()
  return MOCK_FURNITURE.filter((item) => item.room_id === roomId)
}

export async function getFurnitureByArtist(artistId: string): Promise<Furniture[]> {
  const rooms = await getRoomsByArtist(artistId)
  const roomIds = new Set(rooms.map((room) => room.id))
  return MOCK_FURNITURE.filter((item) => roomIds.has(item.room_id))
}
