import { MOCK_FEATURED_ARTISTS } from '../data/mockArtists'
import { useMockFallback, usePublicDemoWhenEmpty } from './dataMode'
import { isSupabaseConfigured, supabasePublic, withTimeout } from './supabase'
import { isUuid } from './utils'
import type { User } from '../types'

export type Artist = User

export const DANI_SLUG = 'dani'

function mockDani(): Artist {
  return { ...MOCK_FEATURED_ARTISTS[0] }
}

function isDaniSlug(idOrSlug: string): boolean {
  const value = idOrSlug.trim().toLowerCase()
  return value === DANI_SLUG || value === 'danny'
}

export { isDaniSlug }

/**
 * Map a URL slug ("dani") or UUID to a users.id.
 * Returns undefined when the live DB has no matching artist.
 */
export async function resolveArtistUserId(
  idOrSlug: string,
): Promise<string | undefined> {
  if (isUuid(idOrSlug)) return idOrSlug
  if (!isSupabaseConfigured()) return undefined

  try {
    const { data: byName, error: nameError } = await withTimeout<{ id: string }>(
      supabasePublic
        .from('users')
        .select('id')
        .eq('role', 'artist')
        .ilike('name', `%${idOrSlug}%`)
        .limit(1)
        .maybeSingle(),
    )

    if (nameError) console.warn('Artist lookup failed:', nameError.message)
    if (byName?.id) return byName.id

    if (isDaniSlug(idOrSlug)) {
      const { data: firstArtist } = await withTimeout<{ id: string }>(
        supabasePublic
          .from('users')
          .select('id')
          .eq('role', 'artist')
          .limit(1)
          .maybeSingle(),
      )
      return firstArtist?.id
    }

    return undefined
  } catch (err) {
    console.warn('Artist lookup threw:', err)
    return undefined
  }
}

export async function getArtists(): Promise<Artist[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await withTimeout(
      supabasePublic.from('users').select('*').eq('role', 'artist'),
    )

    if (!error && data) return data
    if (!useMockFallback()) return []
  }
  return MOCK_FEATURED_ARTISTS.map((artist) => ({ ...artist }))
}

export async function getArtist(idOrSlug: string): Promise<Artist | undefined> {
  if (isSupabaseConfigured()) {
    if (isUuid(idOrSlug)) {
      const { data } = await withTimeout(
        supabasePublic.from('users').select('*').eq('id', idOrSlug).maybeSingle(),
      )
      if (data) return data
    } else {
      const { data } = await withTimeout(
        supabasePublic
          .from('users')
          .select('*')
          .eq('role', 'artist')
          .ilike('name', `%${idOrSlug}%`)
          .limit(1)
          .maybeSingle(),
      )
      if (data) return data

      const userId = await resolveArtistUserId(idOrSlug)
      if (userId && isUuid(userId)) {
        const { data: byId } = await withTimeout(
          supabasePublic.from('users').select('*').eq('id', userId).maybeSingle(),
        )
        if (byId) return byId
      }
    }
  }

  if (isDaniSlug(idOrSlug) || idOrSlug === mockDani().id) {
    if (useMockFallback() || usePublicDemoWhenEmpty(0)) return mockDani()
    return undefined
  }

  const fromMock = MOCK_FEATURED_ARTISTS.find(
    (artist) =>
      artist.id === idOrSlug ||
      artist.name.toLowerCase() === idOrSlug.toLowerCase(),
  )
  if (fromMock && useMockFallback()) return { ...fromMock }
  return isDaniSlug(idOrSlug) && useMockFallback() ? mockDani() : undefined
}

export async function getFeaturedArtists(): Promise<Artist[]> {
  return getArtists()
}
