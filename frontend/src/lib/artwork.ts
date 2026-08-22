import { fixDemoImageUrl } from '../data/mockRegistry'
import { isDaniSlug, resolveArtistUserId } from './artists'
import { demoArtworkList } from './demoContent'
import { useMockFallback } from './dataMode'
import { supabase, isSupabaseConfigured } from './supabase'
import type { Artwork } from '../types'

export type ArtworkDraft = {
  title: string
  price: number
  description?: string
  medium?: string
  dimensions?: string
  image_url?: string
  user_id: string
}

function shouldShowDemoForSlug(slug: string): boolean {
  return isDaniSlug(slug) || slug === 'dani'
}

/**
 * Artwork API using Supabase
 */

export async function getArtworkByArtist(userIdOrSlug: string): Promise<Artwork[]> {
  console.log('[artwork] getArtworkByArtist called with:', userIdOrSlug)
  console.log('[artwork] useMockFallback:', useMockFallback())
  
  if (useMockFallback()) {
    console.log('[artwork] Using mock fallback')
    return demoArtworkList()
  }

  const showDemo = shouldShowDemoForSlug(userIdOrSlug)
  const userId = await resolveArtistUserId(userIdOrSlug)
  console.log('[artwork] Resolved userId:', userId, 'showDemo:', showDemo)

  if (!userId) {
    console.log('[artwork] No userId, returning demo:', showDemo)
    return showDemo ? demoArtworkList() : []
  }

  const { data, error } = await supabase
    .from('artwork')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  console.log('[artwork] Supabase response - data:', data?.length, 'error:', error?.message)

  if (error) {
    console.warn('Artwork fetch failed, using demo content:', error.message)
    return showDemo ? demoArtworkList() : []
  }

  if (!data?.length) {
    console.log('[artwork] No data, returning demo')
    return showDemo ? demoArtworkList() : []
  }

  console.log('[artwork] Returning', data.length, 'artworks from database')
  return data.map((item) => ({
    ...item,
    image_url: fixDemoImageUrl(item.image_url),
  }))
}

export async function getArtworkById(id: string): Promise<Artwork | undefined> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('artwork')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (!error && data) {
      return { ...data, image_url: fixDemoImageUrl(data.image_url) }
    }
  }

  if (useMockFallback()) {
    const mock = demoArtworkList().find((item) => item.id === id)
    return mock ? { ...mock } : undefined
  }
  return undefined
}

export async function createArtwork(draft: ArtworkDraft): Promise<Artwork> {
  const { data, error } = await supabase
    .from('artwork')
    .insert({
      user_id: draft.user_id,
      title: draft.title.trim() || 'Untitled',
      description: draft.description || null,
      price: draft.price,
      image_url: draft.image_url || '',
      medium: draft.medium || null,
      dimensions: draft.dimensions || null,
      status: 'available',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateArtwork(
  id: string,
  patch: Partial<
    Pick<Artwork, 'title' | 'price' | 'description' | 'medium' | 'dimensions' | 'status' | 'image_url'>
  >,
): Promise<Artwork> {
  const { data, error } = await supabase
    .from('artwork')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteArtwork(id: string): Promise<void> {
  const { error } = await supabase
    .from('artwork')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function getLinkedFurnitureName(artworkId: string): Promise<string | undefined> {
  const { data } = await supabase
    .from('furniture')
    .select('name')
    .eq('artwork_id', artworkId)
    .single()

  return data?.name
}

/** Keep for compatibility */
export async function clearDemoArtwork(): Promise<void> {
  // No-op
}
