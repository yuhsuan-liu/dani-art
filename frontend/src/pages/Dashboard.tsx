import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface DashboardStats {
  totalArtwork: number
  availableArtwork: number
  soldArtwork: number
  totalRevenue: number
  pendingOrders: number
}

export function Dashboard() {
  const { artist } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalArtwork: 0,
    availableArtwork: 0,
    soldArtwork: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (artist) {
      fetchStats()
    }
  }, [artist])

  async function fetchStats() {
    if (!artist) return

    try {
      // Fetch artwork stats
      const { data: artwork } = await supabase
        .from('artwork')
        .select('id, price, status')
        .eq('artist_id', artist.id)

      const totalArtwork = artwork?.length ?? 0
      const availableArtwork = artwork?.filter(a => a.status === 'available').length ?? 0
      const soldArtwork = artwork?.filter(a => a.status === 'sold').length ?? 0
      const totalRevenue = artwork
        ?.filter(a => a.status === 'sold')
        .reduce((sum, a) => sum + Number(a.price), 0) ?? 0

      // Fetch pending orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'pending')

      setStats({
        totalArtwork,
        availableArtwork,
        soldArtwork,
        totalRevenue,
        pendingOrders: orders?.length ?? 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

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
          Welcome back, {artist?.name}
        </h1>
        <p className="mt-2 text-stone-600">Here's an overview of your art registry</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Artwork" value={stats.totalArtwork} />
        <StatCard label="Available" value={stats.availableArtwork} />
        <StatCard label="Sold" value={stats.soldArtwork} />
        <StatCard
          label="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
        />
      </div>

      {/* Pending Orders Alert */}
      {stats.pendingOrders > 0 && (
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-amber-800">
            You have <strong>{stats.pendingOrders}</strong> pending order(s) awaiting confirmation.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAction
          to={`/artists/${artist?.id}`}
          title="View Floor Map"
          description="See your art registry as visitors see it"
        />
        <QuickAction
          to="/manage/art"
          title="Manage Artwork"
          description="Upload, edit, and link artwork to furniture"
        />
        <QuickAction
          to="/blog"
          title="Write Blog Post"
          description="Share updates about art fairs and drumming"
        />
      </div>
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
