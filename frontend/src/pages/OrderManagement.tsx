import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { OrderReceipt } from '../components/order/OrderReceipt'
import { PrintReceiptButton } from '../components/order/PrintReceiptButton'
import { PrintReceiptReminder } from '../components/order/printReceipt'
import { supabase } from '../lib/supabase'
import type { Order, Artwork, Furniture } from '../types'

interface OrderWithDetails extends Order {
  artwork: Artwork
  furniture: Furniture
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-stone-100 text-stone-800',
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled']

export function OrderManagement() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  async function fetchOrders() {
    try {
      // First get all artwork IDs for this user
      const { data: userArtwork } = await supabase
        .from('artwork')
        .select('id')
        .eq('user_id', user?.id)

      if (!userArtwork?.length) {
        setOrders([])
        setLoading(false)
        return
      }

      const artworkIds = userArtwork.map(a => a.id)

      // Then get orders for those artworks
      const { data, error } = await supabase
        .from('orders')
        .select('*, artwork(*), furniture(*)')
        .in('artwork_id', artworkIds)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data as OrderWithDetails[])
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdating(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      // Update local state
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
      ))

      // If confirmed, update artwork and furniture status
      const order = orders.find(o => o.id === orderId)
      if (newStatus === 'confirmed' && order) {
        await supabase.from('artwork').update({ status: 'sold' }).eq('id', order.artwork_id)
        await supabase.from('furniture').update({ status: 'purchased' }).eq('id', order.furniture_id)
      } else if (newStatus === 'cancelled' && order) {
        await supabase.from('artwork').update({ status: 'available' }).eq('id', order.artwork_id)
        await supabase.from('furniture').update({ status: 'available' }).eq('id', order.furniture_id)
      }
    } catch (err) {
      console.error('Error updating order:', err)
    } finally {
      setUpdating(null)
    }
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter)

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return <LoadingSpinner label="Loading orders…" />
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-900">Order Management</h1>
        <p className="mt-2 text-stone-600">Manage and track your orders</p>
      </div>

      <PrintReceiptReminder forArtist className="mb-6" />

      {/* Stats */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-4 py-1.5 text-sm ${
            filter === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          All ({orders.length})
        </button>
        {STATUS_OPTIONS.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${
              filter === status ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {status} ({statusCounts[status] || 0})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-lg border border-stone-200 p-8 text-center">
          <p className="text-stone-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="rounded-lg border border-stone-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Order info */}
                <div className="flex gap-4">
                  {order.artwork?.image_url && (
                    <img
                      src={order.artwork.image_url}
                      alt={order.artwork.title}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-stone-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="mt-1 font-medium text-stone-900">
                      {order.artwork?.title || 'Unknown Artwork'}
                    </h3>
                    <p className="text-sm text-stone-500">
                      {order.customer_name} • {order.customer_email}
                    </p>
                    <p className="text-sm text-stone-500 capitalize">
                      {order.delivery_type.replace('_', ' ')}
                      {order.delivery_type !== 'pickup' && order.shipping_address && (
                        <> • {order.shipping_address.city}, {order.shipping_address.state}</>
                      )}
                    </p>
                  </div>
                </div>

                {/* Price and actions */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-stone-900">
                    ${Number(order.total_amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-stone-500">
                    For: {order.furniture?.name || 'Unknown'}
                  </p>
                  
                  {/* Status update */}
                  <div className="mt-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className="rounded-lg border border-stone-300 px-2 py-1 text-sm focus:border-stone-500 focus:outline-none disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status} className="capitalize">
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Special instructions */}
              {order.special_instructions && (
                <div className="mt-3 rounded-lg bg-stone-50 p-3">
                  <p className="text-xs font-medium text-stone-500 mb-1">Special Instructions</p>
                  <p className="text-sm text-stone-700">{order.special_instructions}</p>
                </div>
              )}

              {/* Customer contact */}
              {order.customer_phone && (
                <div className="mt-2 text-sm text-stone-500">
                  Phone: {order.customer_phone}
                </div>
              )}

              {order.artwork && order.furniture ? (
                <details className="mt-4 group">
                  <summary className="cursor-pointer text-sm font-medium text-stone-700">
                    View & print receipt
                  </summary>
                  <div className="mt-3 space-y-3">
                    <OrderReceipt
                      order={order}
                      artwork={order.artwork}
                      furniture={order.furniture}
                      receiptId={`receipt-${order.id}`}
                    />
                    <PrintReceiptButton receiptId={`receipt-${order.id}`} />
                  </div>
                </details>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
