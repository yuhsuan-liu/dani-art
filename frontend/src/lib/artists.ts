import { MOCK_FEATURED_ARTISTS } from '../data/mockArtists'
import type { Artist } from '../types'
// import { apiRequest } from './api'

/**
 * Featured artists for the homepage.
 *
 * Expected backend contract (to wire later):
 *   GET /artists          → Artist[]
 *   GET /artists/featured → Artist[]
 */
export async function getFeaturedArtists(): Promise<Artist[]> {
  // TODO: replace mock with backend call
  // return apiRequest<Artist[]>('/artists')

  await new Promise((resolve) => setTimeout(resolve, 200))
  return MOCK_FEATURED_ARTISTS
}

export async function getArtist(id: string): Promise<Artist | undefined> {
  // TODO: replace mock with backend call
  // return apiRequest<Artist>(`/artists/${id}`)

  const artists = await getFeaturedArtists()
  const normalized = id.trim().toLowerCase()
  return (
    artists.find((artist) => artist.id === id) ??
    artists.find((artist) => artist.name.toLowerCase() === normalized) ??
    artists.find((artist) => artist.id === 'dani')
  )
}
