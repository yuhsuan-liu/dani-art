import type { Artwork, Furniture, Order, Room } from '../types'

/**
 * Demo seed data only.
 * - Every id is prefixed with `demo-` so it never collides with Supabase UUIDs.
 * - Every record has `is_demo: true` for UI badges / grey styling.
 * - When the live API is wired, stop seeding these into the DB; use them only
 *   as a local fallback. Real creates omit `is_demo` and use random UUIDs.
 *
 * Artwork photos: stock images from Unsplash, Unsplash License
 * (https://unsplash.com/license) — free to use, including commercially.
 */

/** Night Jazz used a removed Unsplash file; remap it wherever it still appears. */
const DEMO_IMAGE_REPLACEMENTS: Record<string, string> = {
  'photo-1511192336575-5a79af67a786':
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=1200&q=80',
}

export function fixDemoImageUrl(url: string | undefined | null): string {
  if (!url) return ''
  for (const [brokenId, next] of Object.entries(DEMO_IMAGE_REPLACEMENTS)) {
    if (url.includes(brokenId)) return next
  }
  return url
}

export const DEMO_ID_PREFIX = 'demo-'

export function isDemoId(id: string | undefined | null): boolean {
  return Boolean(id?.startsWith(DEMO_ID_PREFIX))
}

export function isDemoRecord(item: { is_demo?: boolean; id?: string } | null | undefined): boolean {
  if (!item) return false
  if (item.is_demo === true) return true
  return isDemoId(item.id)
}

export const MOCK_ROOMS: Room[] = [
  {
    id: 'demo-room-living',
    user_id: 'dani',
    name: 'Living Room',
    order: 0,
    width: 800,
    height: 560,
    created_at: '2026-08-01T00:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'demo-room-drum',
    user_id: 'dani',
    name: 'Drum Studio',
    order: 1,
    width: 800,
    height: 560,
    created_at: '2026-08-01T00:00:00.000Z',
    is_demo: true,
  },
]

export const MOCK_ARTWORK: Artwork[] = [
  {
    id: 'demo-art-sunset',
    user_id: 'dani',
    title: 'Sunset Over Monterey',
    description: 'Demo placeholder (Unsplash). Warm evening light over the water.',
    price: 400,
    image_url:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    medium: 'Oil on canvas',
    dimensions: '24x36 inches',
    status: 'sold',
    created_at: '2026-08-02T00:00:00.000Z',
    updated_at: '2026-08-15T00:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'demo-art-beach',
    user_id: 'dani',
    title: 'Beach Day',
    description: 'Demo placeholder (Unsplash). Figures on the sand, late afternoon.',
    price: 800,
    image_url:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    medium: 'Acrylic on canvas',
    dimensions: '30x40 inches',
    status: 'available',
    created_at: '2026-08-03T00:00:00.000Z',
    updated_at: '2026-08-03T00:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'demo-art-jazz',
    user_id: 'dani',
    title: 'Night Jazz',
    description: 'Demo placeholder (Unsplash). A small study from a late gig.',
    price: 50,
    image_url:
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=1200&q=80',
    medium: 'Ink on paper',
    dimensions: '8x10 inches',
    status: 'reserved',
    created_at: '2026-08-04T00:00:00.000Z',
    updated_at: '2026-08-10T00:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'demo-art-unlinked',
    user_id: 'dani',
    title: 'Untitled sketch',
    description: 'Demo placeholder (Unsplash). Needs a furniture match.',
    price: 120,
    image_url:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=80',
    medium: 'Graphite',
    dimensions: '9x12 inches',
    status: 'available',
    created_at: '2026-08-12T00:00:00.000Z',
    updated_at: '2026-08-12T00:00:00.000Z',
    is_demo: true,
  },
]

export const MOCK_FURNITURE: Furniture[] = [
  {
    id: 'demo-furn-bed',
    room_id: 'demo-room-living',
    name: 'Bed',
    image_url:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
    price: 800,
    position_x: 48,
    position_y: 72,
    width: 200,
    height: 120,
    rotation: 0,
    z_index: 1,
    artwork_id: 'demo-art-beach',
    status: 'available',
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-01T00:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'demo-furn-couch',
    room_id: 'demo-room-living',
    name: 'Cozy Couch',
    image_url:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    price: 400,
    position_x: 420,
    position_y: 90,
    width: 220,
    height: 120,
    rotation: 0,
    z_index: 2,
    external_url: 'https://www.ikea.com',
    artwork_id: 'demo-art-sunset',
    status: 'purchased',
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-15T00:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'demo-furn-lamp',
    room_id: 'demo-room-living',
    name: 'Lamp',
    image_url:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    price: 50,
    position_x: 310,
    position_y: 340,
    width: 90,
    height: 130,
    rotation: 0,
    z_index: 3,
    artwork_id: 'demo-art-jazz',
    status: 'reserved',
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-10T00:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'demo-furn-drums',
    room_id: 'demo-room-drum',
    name: 'Drum Kit',
    image_url:
      'https://images.unsplash.com/photo-1519892300165-cb5542fb47c0?auto=format&fit=crop&w=600&q=80',
    price: 600,
    position_x: 280,
    position_y: 180,
    width: 200,
    height: 150,
    rotation: 0,
    z_index: 1,
    status: 'available',
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-01T00:00:00.000Z',
    is_demo: true,
  },
]

export const MOCK_ORDERS: Order[] = [
  {
    id: 'demo-order-1',
    artwork_id: 'demo-art-sunset',
    furniture_id: 'demo-furn-couch',
    customer_name: 'Jordan Smith',
    customer_email: 'jordan@example.com',
    delivery_type: 'pickup',
    total_amount: 400,
    shipping_fee: 0,
    status: 'completed',
    payment_method: 'venmo',
    created_at: '2026-08-15T00:00:00.000Z',
    updated_at: '2026-08-16T00:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'demo-order-2',
    artwork_id: 'demo-art-jazz',
    furniture_id: 'demo-furn-lamp',
    customer_name: 'Maya Chen',
    customer_email: 'maya@example.com',
    delivery_type: 'local_delivery',
    total_amount: 65,
    shipping_fee: 15,
    status: 'pending',
    payment_method: 'paypal',
    created_at: '2026-08-18T00:00:00.000Z',
    updated_at: '2026-08-18T00:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'demo-order-3',
    artwork_id: 'demo-art-beach',
    furniture_id: 'demo-furn-bed',
    customer_name: 'Alex Rivera',
    customer_email: 'alex@example.com',
    delivery_type: 'shipping',
    total_amount: 830,
    shipping_fee: 30,
    status: 'confirmed',
    payment_method: 'venmo',
    created_at: '2026-08-20T00:00:00.000Z',
    updated_at: '2026-08-21T00:00:00.000Z',
    is_demo: true,
  },
]

export const MOCK_PURCHASE_NOTES: Record<string, string> = {
  'demo-furn-couch': 'Purchased by J.S. on Aug 15, 2026',
}
