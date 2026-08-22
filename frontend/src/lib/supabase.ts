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

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Auth helpers
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
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
