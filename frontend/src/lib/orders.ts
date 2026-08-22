import { isDemoRecord, MOCK_ORDERS } from '../data/mockRegistry'
import { useMockFallback } from './dataMode'
import { supabase } from './supabase'
import type { Order } from '../types'

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
