import { MOCK_ARTWORK, MOCK_FURNITURE } from '../data/mockRegistry'
import { newId, wait } from './utils'
import type { Artwork } from '../types'
// import { apiRequest } from './api'

let artworkStore: Artwork[] = MOCK_ARTWORK.map((item) => ({ ...item }))

export type ArtworkDraft = {
  title: string
  price: number
  description?: string
  medium?: string
  dimensions?: string
  image_url?: string
  user_id: string
}

/**
 * Expected backend contract:
 *   GET    /artists/:userId/artwork → Artwork[]
 *   GET    /artwork/:id             → Artwork
 *   POST   /artwork                 → Artwork
 *   PATCH  /artwork/:id             → Artwork
 *   DELETE /artwork/:id             → void
 */
export async function getArtworkByArtist(userId: string): Promise<Artwork[]> {
  // return apiRequest<Artwork[]>(`/artists/${userId}/artwork`)
  await wait()
  const matched = artworkStore.filter((item) => item.user_id === userId)
  const list =
    matched.length > 0
      ? matched
      : artworkStore.filter((item) => item.user_id === 'dani')
  return list.map((item) => ({ ...item }))
}

export async function getArtworkById(id: string): Promise<Artwork | undefined> {
  // return apiRequest<Artwork>(`/artwork/${id}`)
  await wait()
  const found = artworkStore.find((item) => item.id === id)
  return found ? { ...found } : undefined
}

export async function createArtwork(draft: ArtworkDraft): Promise<Artwork> {
  // return apiRequest<Artwork>('/artwork', { method: 'POST', body: JSON.stringify(draft) })
  await wait()
  const now = new Date().toISOString()
  const created: Artwork = {
    id: newId('art'),
    user_id: draft.user_id,
    title: draft.title.trim() || `Untitled ${now}`,
    description: draft.description,
    price: draft.price,
    image_url: draft.image_url ?? '',
    medium: draft.medium,
    dimensions: draft.dimensions,
    status: 'available',
    created_at: now,
    updated_at: now,
  }
  artworkStore = [created, ...artworkStore]
  return { ...created }
}

export async function updateArtwork(
  id: string,
  patch: Partial<
    Pick<Artwork, 'title' | 'price' | 'description' | 'medium' | 'dimensions' | 'status' | 'image_url'>
  >,
): Promise<Artwork> {
  // return apiRequest<Artwork>(`/artwork/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
  await wait()
  const index = artworkStore.findIndex((item) => item.id === id)
  if (index === -1) {
    throw new Error('Artwork not found')
  }
  const updated: Artwork = {
    ...artworkStore[index],
    ...patch,
    updated_at: new Date().toISOString(),
  }
  artworkStore[index] = updated
  return { ...updated }
}

export async function deleteArtwork(id: string): Promise<void> {
  // await apiRequest<void>(`/artwork/${id}`, { method: 'DELETE' })
  await wait()
  artworkStore = artworkStore.filter((item) => item.id !== id)
}

export function getLinkedFurnitureName(artworkId: string): string | undefined {
  return MOCK_FURNITURE.find((item) => item.artwork_id === artworkId)?.name
}
