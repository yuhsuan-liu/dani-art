import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getArtworkById } from '../lib/artwork'
import { getDashboardStats, getRecentOrders } from '../lib/orders'
import { formatDate, formatPrice } from '../lib/utils'
import type { Order } from '../types'

interface DashboardStats {
  totalRevenue: number
  activeListings: number
  soldCount: number
  pendingOrders: number
}

type OrderRow = Order & { artworkTitle?: string }

export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeListings: 0,
    soldCount: 0,
    pendingOrders: 0,
  })
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  const displayName = user?.name ?? 'Dani'
  const artistId = user?.id ?? 'dani'

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [nextStats, recent] = await Promise.all([
          getDashboardStats(artistId),
          getRecentOrders(8),
        ])
        const withTitles = await Promise.all(
          recent.map(async (order) => {
            const art = await getArtworkById(order.artwork_id)
            return { ...order, artworkTitle: art?.title }
          }),
        )
        if (!cancelled) {
          setStats(nextStats)
          setOrders(withTitles)
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [artistId])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-stone-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-900">
          Welcome back, {displayName}
        </h1>
        <p className="mt-2 text-stone-600">Here's an overview of your art registry</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatPrice(stats.totalRevenue)} />
        <StatCard label="Active listings" value={stats.activeListings} />
        <StatCard label="Sold" value={stats.soldCount} />
        <StatCard label="Pending orders" value={stats.pendingOrders} />
      </div>

      {stats.pendingOrders > 0 && (
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-amber-800">
            You have <strong>{stats.pendingOrders}</strong> pending order(s) awaiting confirmation.
          </p>
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-3 font-serif text-xl text-stone-900">Recent orders</h2>
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Artwork</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                    No orders yet.
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 text-stone-900">{order.customer_name}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {order.artworkTitle ?? order.artwork_id}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="px-4 py-3 capitalize text-stone-600">{order.status}</td>
                  <td className="px-4 py-3 text-stone-500">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-xl text-stone-900">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            to={`/artists/${artistId}`}
            title="View Floor Map"
            description="Edit rooms, drag furniture, link artwork"
          />
          <QuickAction
            to="/manage/art"
            title="Manage Artwork"
            description="Upload, edit, and delete pieces"
          />
          <QuickAction
            to="/manage/orders"
            title="Manage Orders"
            description="View and update customer orders"
          />
          <QuickAction
            to="/blog"
            title="Write Blog Post"
            description="Share updates about art fairs and drumming"
          />
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-stone-900">{value}</p>
    </div>
  )
}

function QuickAction({
  to,
  title,
  description,
}: {
  to: string
  title: string
  description: string
}) {
  return (
    <Link
      to={to}
      className="block rounded-lg border border-stone-200 bg-white p-4 transition-colors hover:border-stone-300 hover:bg-stone-50"
    >
      <h3 className="font-medium text-stone-900">{title}</h3>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
    </Link>
  )
}
