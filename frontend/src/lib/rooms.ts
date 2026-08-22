import { isDemoRecord, MOCK_FURNITURE, MOCK_ROOMS } from '../data/mockRegistry'
import { useMockFallback, usePublicDemoWhenEmpty } from './dataMode'
import { resolveArtistUserId } from './artists'
import { supabase, isSupabaseConfigured } from './supabase'
import type { Furniture, Room } from '../types'

/**
 * Room and Furniture API using Supabase
 */

export async function getRoomsByArtist(userIdOrSlug: string): Promise<Room[]> {
  const userId = await resolveArtistUserId(userIdOrSlug)

  if (isSupabaseConfigured() && userId) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('user_id', userId)
      .order('order')

    if (!error && data) {
      if (data.length > 0) return data
      if (usePublicDemoWhenEmpty(0)) return MOCK_ROOMS.map((room) => ({ ...room }))
      return []
    }
  }

  return useMockFallback() ? MOCK_ROOMS.map((room) => ({ ...room })) : []
}

export async function createRoom(input: {
  user_id: string
  name: string
  width?: number
  height?: number
}): Promise<Room> {
  // Get max order for this user's rooms
  const { data: existing } = await supabase
    .from('rooms')
    .select('order')
    .eq('user_id', input.user_id)
    .order('order', { ascending: false })
    .limit(1)

  const maxOrder = existing?.[0]?.order ?? -1

  const { data, error } = await supabase
    .from('rooms')
    .insert({
      user_id: input.user_id,
      name: input.name.trim() || 'New Room',
      order: maxOrder + 1,
      width: input.width ?? 800,
      height: input.height ?? 560,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateRoom(
  id: string,
  patch: Partial<Pick<Room, 'name' | 'order' | 'background_url' | 'width' | 'height'>>,
): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteRoom(id: string): Promise<void> {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function getFurnitureByRoom(roomId: string): Promise<Furniture[]> {
  const { data, error } = await supabase
    .from('furniture')
    .select('*, artwork(*)')
    .eq('room_id', roomId)
    .order('z_index')

  if (error) {
    console.error('Error fetching furniture:', error)
    return []
  }
  return data ?? []
}

export async function getFurnitureByArtist(userIdOrSlug: string): Promise<Furniture[]> {
  const rooms = await getRoomsByArtist(userIdOrSlug)
  if (rooms.length === 0) return []

  if (rooms.some(isDemoRecord)) {
    return useMockFallback() || usePublicDemoWhenEmpty(rooms.filter((r) => !isDemoRecord(r)).length)
      ? MOCK_FURNITURE.map((item) => ({ ...item }))
      : []
  }

  const roomIds = rooms.map((room) => room.id)

  const { data, error } = await supabase
    .from('furniture')
    .select('*, artwork(*)')
    .in('room_id', roomIds)
    .order('z_index')

  if (error) {
    console.error('Error fetching furniture:', error)
    return useMockFallback() ? MOCK_FURNITURE.map((item) => ({ ...item })) : []
  }
  if (!data || data.length === 0) {
    return usePublicDemoWhenEmpty(0) ? MOCK_FURNITURE.map((item) => ({ ...item })) : []
  }
  return data
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
  // Get max z_index
  const { data: existing } = await supabase
    .from('furniture')
    .select('z_index')
    .eq('room_id', draft.room_id)
    .order('z_index', { ascending: false })
    .limit(1)

  const maxZIndex = existing?.[0]?.z_index ?? 0

  const { data, error } = await supabase
    .from('furniture')
    .insert({
      room_id: draft.room_id,
      name: draft.name.trim() || 'Untitled furniture',
      image_url: draft.image_url,
      price: draft.price,
      position_x: draft.position_x ?? 80,
      position_y: draft.position_y ?? 80,
      width: draft.width ?? 140,
      height: draft.height ?? 100,
      rotation: 0,
      z_index: maxZIndex + 1,
      external_url: draft.external_url || null,
      artwork_id: draft.artwork_id || null,
      status: 'available',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
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
  const { data, error } = await supabase
    .from('furniture')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteFurniture(id: string): Promise<void> {
  const { error } = await supabase
    .from('furniture')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function updateFurniturePosition(
  id: string,
  position_x: number,
  position_y: number,
): Promise<Furniture> {
  return updateFurniture(id, { position_x, position_y })
}

/** Drop demo data (if any) - keeping for compatibility */
export async function clearDemoRoomsAndFurniture(): Promise<void> {
  // No-op for now - demo data is handled separately
}
