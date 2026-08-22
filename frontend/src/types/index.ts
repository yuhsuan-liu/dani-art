export type UserRole = 'admin' | 'artist' | 'customer'

export interface User {
  id: string
  email: string
  name: string
  bio?: string
  profile_pic_url?: string
  role: UserRole
  created_at: string
}

// Alias for backward compatibility
export type Artist = User

export interface Room {
  id: string
  user_id: string
  name: string
  order: number
  background_url?: string
  width: number
  height: number
  created_at: string
  /** Frontend-only flag for seed data. Never write to production DB. */
  is_demo?: boolean
}

export interface Furniture {
  id: string
  room_id: string
  name: string
  image_url: string
  price: number
  position_x: number
  position_y: number
  width?: number
  height?: number
  rotation: number
  z_index: number
  external_url?: string
  artwork_id?: string
  status: 'available' | 'reserved' | 'purchased'
  created_at: string
  updated_at: string
  artwork?: Artwork
  is_demo?: boolean
}

export interface Artwork {
  id: string
  user_id: string
  title: string
  description?: string
  price: number
  image_url: string
  medium?: string
  dimensions?: string
  status: 'available' | 'reserved' | 'sold'
  created_at: string
  updated_at: string
  is_demo?: boolean
}

export interface Order {
  id: string
  artwork_id: string
  furniture_id: string
  customer_id?: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  delivery_type: 'pickup' | 'local_delivery' | 'shipping'
  shipping_address?: {
    street: string
    city: string
    state: string
    zip: string
  }
  special_instructions?: string
  total_amount: number
  shipping_fee: number
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'
  payment_method?: 'venmo' | 'paypal'
  payment_reference?: string
  created_at: string
  updated_at: string
  is_demo?: boolean
}

export interface BlogPost {
  id: string
  user_id: string
  title: string
  content: string
  featured_image_url?: string
  category?: 'art_fair' | 'drumming' | 'general'
  is_published: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

/** Dated note on the public blog, e.g. "5/6 artfare at..." */
export interface CalendarEvent {
  id: string
  user_id: string
  date: string
  title: string
  created_at: string
  updated_at: string
  is_demo?: boolean
}

export type MediaKind = 'image' | 'video'

export interface MediaItem {
  url: string
  kind: MediaKind
}

/** Short update with optional photos/video — tweet-like, not a long post. */
export interface UpdatePost {
  id: string
  user_id: string
  text: string
  media: MediaItem[]
  created_at: string
  updated_at: string
  is_demo?: boolean
}
