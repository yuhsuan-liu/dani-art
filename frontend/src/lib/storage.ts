import { supabase } from './supabase'
import type { MediaKind } from '../types'

export type StorageBucket = 'furniture' | 'artwork' | 'profiles' | 'blog'

export function mediaKindFromFile(file: File): MediaKind {
  return file.type.startsWith('video/') ? 'video' : 'image'
}

/**
 * Upload an image or video to Supabase Storage.
 *
 * Buckets (from PRD): furniture, artwork, profiles, blog
 * On success returns a public URL. If Supabase is not configured or upload
 * fails, falls back to a local object URL so the UI still works in mock mode.
 */
export async function uploadMedia(
  bucket: StorageBucket,
  file: File,
  folder = 'uploads',
): Promise<{ url: string; source: 'supabase' | 'local'; kind: MediaKind }> {
  const kind = mediaKindFromFile(file)
  const supabaseConfigured =
    Boolean(import.meta.env.VITE_SUPABASE_URL) &&
    Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

  if (supabaseConfigured) {
    const ext = file.name.split('.').pop() || (kind === 'video' ? 'mp4' : 'png')
    const path = `${folder}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || (kind === 'video' ? 'video/mp4' : 'image/png'),
    })

    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return { url: data.publicUrl, source: 'supabase', kind }
    }

    console.warn(`Supabase upload to "${bucket}" failed, using local preview:`, error.message)
  }

  return { url: URL.createObjectURL(file), source: 'local', kind }
}

export async function uploadImage(
  bucket: StorageBucket,
  file: File,
  folder = 'uploads',
): Promise<{ url: string; source: 'supabase' | 'local' }> {
  const uploaded = await uploadMedia(bucket, file, folder)
  return { url: uploaded.url, source: uploaded.source }
}
