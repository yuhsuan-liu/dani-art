import { isSupabaseConfigured } from './supabase'

/** Mock seed data when Supabase env vars are missing (local dev without .env). */
export function useMockFallback(): boolean {
  return !isSupabaseConfigured()
}

/**
 * Show Unsplash demo content when the live DB has no rows yet.
 * Keeps GitHub Pages usable before seed data is loaded.
 */
export function usePublicDemoWhenEmpty(liveCount: number): boolean {
  return liveCount === 0
}
