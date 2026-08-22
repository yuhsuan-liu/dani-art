import { isDemoRecord, MOCK_ORDERS } from '../data/mockRegistry'
import { wait } from './utils'
import type { Order } from '../types'
// import { apiRequest } from './api'

let orderStore: Order[] = MOCK_ORDERS.map((item) => ({ ...item }))

/**
 * Expected backend contract:
 *   GET /orders → Order[]
 */
export async function getRecentOrders(limit = 10): Promise<Order[]> {
  // return apiRequest<Order[]>(`/orders?limit=${limit}`)
  await wait()
  return [...orderStore]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
    .map((order) => ({ ...order }))
}

export async function getDashboardStats(userId: string) {
  // Prefer live Supabase later; mock for now.
  await wait()
  void userId
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

export async function clearDemoOrders(): Promise<void> {
  await wait()
  orderStore = orderStore.filter((order) => !isDemoRecord(order))
}
