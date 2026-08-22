import { MOCK_ORDERS } from '../data/mockRegistry'
import { wait } from './utils'
import type { Order } from '../types'
// import { apiRequest } from './api'

/**
 * Expected backend contract:
 *   GET /orders → Order[]
 */
export async function getRecentOrders(limit = 10): Promise<Order[]> {
  // return apiRequest<Order[]>(`/orders?limit=${limit}`)
  await wait()
  return [...MOCK_ORDERS]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
    .map((order) => ({ ...order }))
}

export async function getDashboardStats(userId: string) {
  // Prefer live Supabase later; mock for now.
  await wait()
  void userId
  const sold = MOCK_ORDERS.filter((o) => o.status === 'completed' || o.status === 'confirmed')
  return {
    totalRevenue: sold.reduce((sum, order) => sum + order.total_amount, 0),
    activeListings: 2,
    soldCount: sold.length,
    pendingOrders: MOCK_ORDERS.filter((o) => o.status === 'pending').length,
  }
}
