import { isDemoRecord, MOCK_ORDERS } from '../data/mockRegistry'
import { useMockFallback } from './dataMode'
import { supabase } from './supabase'
import type { Order } from '../types'

export type GuestOrderInput = {
  artwork_id: string
  furniture_id: string
  customer_name: string
  customer_email: string
  customer_phone?: string | null
  delivery_type: 'pickup' | 'local_delivery' | 'shipping'
  shipping_address?: {
    street: string
    city: string
    state: string
    zip: string
  } | null
  special_instructions?: string | null
  total_amount: number
  shipping_fee: number
  payment_method: 'venmo' | 'paypal'
}

export async function createGuestOrder(input: GuestOrderInput): Promise<Order> {
  if (useMockFallback()) {
    const mock: Order = {
      id: `demo-order-${Date.now()}`,
      artwork_id: input.artwork_id,
      furniture_id: input.furniture_id,
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone ?? undefined,
      delivery_type: input.delivery_type,
      shipping_address: input.shipping_address ?? undefined,
      special_instructions: input.special_instructions ?? undefined,
      total_amount: input.total_amount,
      shipping_fee: input.shipping_fee,
      status: 'pending',
      payment_method: input.payment_method,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_demo: true,
    }
    return mock
  }

  const { data, error } = await supabase.rpc('create_guest_order', {
    p_artwork_id: input.artwork_id,
    p_furniture_id: input.furniture_id,
    p_customer_name: input.customer_name,
    p_customer_email: input.customer_email,
    p_customer_phone: input.customer_phone ?? '',
    p_delivery_type: input.delivery_type,
    p_shipping_address: input.shipping_address ?? null,
    p_special_instructions: input.special_instructions ?? '',
    p_total_amount: input.total_amount,
    p_shipping_fee: input.shipping_fee,
    p_payment_method: input.payment_method,
  })

  if (error) {
    if (error.message.includes('create_guest_order')) {
      throw new Error(
        'Checkout is not set up yet. Run supabase/migrations/003_fix_users_rls_and_orders.sql in the Supabase SQL Editor.',
      )
    }
    throw new Error(error.message)
  }

  return data as Order
}

export async function getRecentOrders(limit = 10, userId?: string): Promise<Order[]> {
  if (useMockFallback()) {
    return MOCK_ORDERS.slice(0, limit).map((item) => ({ ...item }))
  }

  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (userId) {
    const { data: artwork } = await supabase
      .from('artwork')
      .select('id')
      .eq('user_id', userId)

    const artworkIds = artwork?.map((item) => item.id) ?? []
    if (artworkIds.length === 0) return []
    query = query.in('artwork_id', artworkIds)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getDashboardStats(userId: string) {
  if (useMockFallback()) {
    const orderStore = MOCK_ORDERS.map((item) => ({ ...item }))
    const sold = orderStore.filter(
      (o) => o.status === 'completed' || o.status === 'confirmed',
    )
    return {
      totalRevenue: sold.reduce((sum, order) => sum + order.total_amount, 0),
      activeListings: 2,
      soldCount: sold.length,
      pendingOrders: orderStore.filter((o) => o.status === 'pending').length,
      includesDemo: orderStore.some((o) => isDemoRecord(o)),
    }
  }

  const { data: artwork, error: artworkError } = await supabase
    .from('artwork')
    .select('id, status')
    .eq('user_id', userId)

  if (artworkError) throw new Error(artworkError.message)

  const artworkIds = artwork?.map((item) => item.id) ?? []
  let orders: Order[] = []

  if (artworkIds.length > 0) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('artwork_id', artworkIds)

    if (error) throw new Error(error.message)
    orders = data ?? []
  }

  const sold = orders.filter(
    (o) => o.status === 'completed' || o.status === 'confirmed',
  )

  return {
    totalRevenue: sold.reduce((sum, order) => sum + order.total_amount, 0),
    activeListings: artwork?.filter((item) => item.status === 'available').length ?? 0,
    soldCount: sold.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    includesDemo: false,
  }
}

export async function clearDemoOrders(): Promise<void> {
  // Demo orders only exist in mock mode.
}
