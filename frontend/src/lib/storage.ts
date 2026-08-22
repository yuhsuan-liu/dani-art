import { supabase } from './supabase'

export type StorageBucket = 'furniture' | 'artwork' | 'profiles' | 'blog'

/**
 * Upload an image to Supabase Storage.
 *
 * Buckets (from PRD): furniture, artwork, profiles, blog
 * On success returns a public URL. If Supabase is not configured or upload
 * fails, falls back to a local object URL so the UI still works in mock mode.
 */
export async function uploadImage(
  bucket: StorageBucket,
  file: File,
  folder = 'uploads',
): Promise<{ url: string; source: 'supabase' | 'local' }> {
  const supabaseConfigured =
    Boolean(import.meta.env.VITE_SUPABASE_URL) &&
    Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

  if (supabaseConfigured) {
    const ext = file.name.split('.').pop() || 'png'
    const path = `${folder}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/png',
    })

    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return { url: data.publicUrl, source: 'supabase' }
    }

    console.warn(`Supabase upload to "${bucket}" failed, using local preview:`, error.message)
  }

  return { url: URL.createObjectURL(file), source: 'local' }
}
