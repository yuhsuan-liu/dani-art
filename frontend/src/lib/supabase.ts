import { createClient } from '@supabase/supabase-js'
import type { User, Artwork, Room, Furniture, Order, BlogPost } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
}

export interface Database {
  public: {
    Tables: {
      users: { Row: User; Insert: Omit<User, 'id' | 'created_at'>; Update: Partial<User> }
      artwork: { Row: Artwork; Insert: Omit<Artwork, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Artwork> }
      rooms: { Row: Room; Insert: Omit<Room, 'id' | 'created_at'>; Update: Partial<Room> }
      furniture: { Row: Furniture; Insert: Omit<Furniture, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Furniture> }
      orders: { Row: Order; Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Order> }
      blog_posts: { Row: BlogPost; Insert: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>; Update: Partial<BlogPost> }
    }
  }
}

/** Where Google OAuth should return after sign-in (works on GitHub Pages + local dev). */
export function getAuthRedirectUrl(): string {
  const base = import.meta.env.BASE_URL || '/'
  const path = base.endsWith('/') ? base : `${base}/`
  return `${window.location.origin}${path}`
}

/**
 * supabase-js serializes auth work behind a Web Locks lock, and every PostgREST
 * query awaits the session before it sends a request. A lock that is never
 * released therefore hangs all reads with no network activity at all, so use a
 * pass-through lock instead.
 */
async function passthroughLock<R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>,
): Promise<R> {
  return fn()
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      detectSessionInUrl: true,
      flowType: 'pkce',
      persistSession: true,
      lock: passthroughLock,
    },
  },
)

/**
 * Anonymous client for public reads (galleries, rooms, furniture). It never
 * touches auth storage, so browsing cannot be blocked by the auth layer.
 */
export const supabasePublic = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      lock: passthroughLock,
      storageKey: 'sb-dani-art-public',
    },
  },
)

type QueryResult<T> = {
  data: T | null
  error: { message: string; code?: string } | null
}

/** Surface a stalled query as an error so callers fall back instead of hanging. */
export async function withTimeout<T>(
  query: PromiseLike<QueryResult<T>>,
  ms = 8000,
): Promise<QueryResult<T>> {
  let timer: number | undefined
  const timeout = new Promise<QueryResult<T>>((resolve) => {
    timer = window.setTimeout(
      () => resolve({ data: null, error: { message: `Timed out after ${ms}ms` } }),
      ms,
    )
  })
  try {
    return await Promise.race([Promise.resolve(query), timeout])
  } finally {
    if (timer) window.clearTimeout(timer)
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl) && Boolean(supabaseAnonKey)
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Sign-in is not configured on this site yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to GitHub Actions secrets, then redeploy.',
    )
  }

  const redirectTo = getAuthRedirectUrl()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
