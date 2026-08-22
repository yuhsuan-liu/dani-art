import { MOCK_FURNITURE, MOCK_ROOMS } from '../data/mockRegistry'
import { newId, wait } from './utils'
import type { Furniture, Room } from '../types'
// import { apiRequest } from './api'

let roomStore: Room[] = MOCK_ROOMS.map((item) => ({ ...item }))
let furnitureStore: Furniture[] = MOCK_FURNITURE.map((item) => ({ ...item }))

/**
 * Expected backend contract:
 *   GET    /artists/:id/rooms     → Room[]
 *   POST   /rooms                 → Room
 *   PATCH  /rooms/:id             → Room
 *   DELETE /rooms/:id             → void
 *   GET    /rooms/:id/furniture   → Furniture[]
 *   POST   /furniture             → Furniture
 *   PATCH  /furniture/:id         → Furniture
 *   DELETE /furniture/:id         → void
 */

export async function getRoomsByArtist(userId: string): Promise<Room[]> {
  // return apiRequest<Room[]>(`/artists/${userId}/rooms`)
  await wait()
  const matched = roomStore.filter((room) => room.user_id === userId)
  const rooms =
    matched.length > 0 ? matched : roomStore.filter((room) => room.user_id === 'dani')
  return rooms.sort((a, b) => a.order - b.order).map((room) => ({ ...room }))
}

export async function createRoom(input: {
  user_id: string
  name: string
  width?: number
  height?: number
}): Promise<Room> {
  // return apiRequest<Room>('/rooms', { method: 'POST', body: JSON.stringify(input) })
  await wait()
  const maxOrder = roomStore
    .filter((room) => room.user_id === input.user_id)
    .reduce((max, room) => Math.max(max, room.order), -1)
  const created: Room = {
    id: newId('room'),
    user_id: input.user_id,
    name: input.name.trim() || 'New Room',
    order: maxOrder + 1,
    width: input.width ?? 800,
    height: input.height ?? 560,
    created_at: new Date().toISOString(),
  }
  roomStore = [...roomStore, created]
  return { ...created }
}

export async function updateRoom(
  id: string,
  patch: Partial<Pick<Room, 'name' | 'order' | 'background_url' | 'width' | 'height'>>,
): Promise<Room> {
  // return apiRequest<Room>(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
  await wait()
  const index = roomStore.findIndex((room) => room.id === id)
  if (index === -1) throw new Error('Room not found')
  const updated = { ...roomStore[index], ...patch }
  roomStore[index] = updated
  return { ...updated }
}

export async function deleteRoom(id: string): Promise<void> {
  // await apiRequest<void>(`/rooms/${id}`, { method: 'DELETE' })
  await wait()
  roomStore = roomStore.filter((room) => room.id !== id)
  furnitureStore = furnitureStore.filter((item) => item.room_id !== id)
}

export async function getFurnitureByRoom(roomId: string): Promise<Furniture[]> {
  // return apiRequest<Furniture[]>(`/rooms/${roomId}/furniture`)
  await wait()
  return furnitureStore
    .filter((item) => item.room_id === roomId)
    .map((item) => ({ ...item }))
}

export async function getFurnitureByArtist(userId: string): Promise<Furniture[]> {
  const rooms = await getRoomsByArtist(userId)
  const roomIds = new Set(rooms.map((room) => room.id))
  return furnitureStore
    .filter((item) => roomIds.has(item.room_id))
    .map((item) => ({ ...item }))
}

export type FurnitureDraft = {
  room_id: string
  name: string
  price: number
  image_url: string
  width?: number
  height?: number
  external_url?: string
  artwork_id?: string
  position_x?: number
  position_y?: number
}

export async function createFurniture(draft: FurnitureDraft): Promise<Furniture> {
  // return apiRequest<Furniture>('/furniture', { method: 'POST', body: JSON.stringify(draft) })
  await wait()
  const now = new Date().toISOString()
  const created: Furniture = {
    id: newId('furn'),
    room_id: draft.room_id,
    name: draft.name.trim() || 'Untitled furniture',
    image_url: draft.image_url,
    price: draft.price,
    position_x: draft.position_x ?? 80,
    position_y: draft.position_y ?? 80,
    width: draft.width ?? 140,
    height: draft.height ?? 100,
    rotation: 0,
    z_index: furnitureStore.length + 1,
    external_url: draft.external_url,
    artwork_id: draft.artwork_id,
    status: 'available',
    created_at: now,
    updated_at: now,
  }
  furnitureStore = [...furnitureStore, created]
  return { ...created }
}

export async function updateFurniture(
  id: string,
  patch: Partial<
    Pick<
      Furniture,
      | 'name'
      | 'image_url'
      | 'price'
      | 'position_x'
      | 'position_y'
      | 'width'
      | 'height'
      | 'rotation'
      | 'z_index'
      | 'external_url'
      | 'artwork_id'
      | 'status'
      | 'room_id'
    >
  >,
): Promise<Furniture> {
  // return apiRequest<Furniture>(`/furniture/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
  await wait()
  const index = furnitureStore.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Furniture not found')
  const updated: Furniture = {
    ...furnitureStore[index],
    ...patch,
    updated_at: new Date().toISOString(),
  }
  furnitureStore[index] = updated
  return { ...updated }
}

export async function deleteFurniture(id: string): Promise<void> {
  // await apiRequest<void>(`/furniture/${id}`, { method: 'DELETE' })
  await wait()
  furnitureStore = furnitureStore.filter((item) => item.id !== id)
}

export async function updateFurniturePosition(
  id: string,
  position_x: number,
  position_y: number,
): Promise<Furniture> {
  // return apiRequest<Furniture>(`/furniture/${id}/position?position_x=${position_x}&position_y=${position_y}`, { method: 'PATCH' })
  return updateFurniture(id, { position_x, position_y })
}
