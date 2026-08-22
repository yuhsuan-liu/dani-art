import { useEffect, useMemo, useState } from 'react'
import { ArtForm } from '../components/art/ArtForm'
import { ArtManagementTable } from '../components/art/ArtManagementTable'
import { DemoDataBanner } from '../components/common/DemoBadge'
import { useAuth } from '../contexts/AuthContext'
import { isDemoRecord } from '../data/mockRegistry'
import { getManagedArtistId } from '../lib/artists'
import {
  createArtwork,
  deleteArtwork,
  getArtworkByArtist,
  updateArtwork,
  type ArtworkDraft,
} from '../lib/artwork'
import { clearAllDemoData } from '../lib/demo'
import {
  cancelOrderAndRelease,
  getPendingOrdersByArtworkIds,
  markArtworkAvailable,
} from '../lib/orders'
import { getFurnitureByArtist } from '../lib/rooms'
import type { Artwork, Furniture, Order } from '../types'

export function ArtManagement() {
  const { user } = useAuth()
  const [artistId, setArtistId] = useState<string>('dani')

  const [artwork, setArtwork] = useState<Artwork[]>([])
  const [furniture, setFurniture] = useState<Furniture[]>([])
  const [pendingOrderByArtId, setPendingOrderByArtId] = useState<Record<string, Order>>({})
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editing, setEditing] = useState<Artwork>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionArtworkId, setActionArtworkId] = useState<string | null>(null)

  async function refresh() {
    const [nextArtwork, nextFurniture] = await Promise.all([
      getArtworkByArtist(artistId),
      getFurnitureByArtist(artistId),
    ])
    setArtwork(nextArtwork)
    setFurniture(nextFurniture)

    const artworkIds = nextArtwork.map((item) => item.id)
    const pending = await getPendingOrdersByArtworkIds(artworkIds)
    setPendingOrderByArtId(pending)
  }

  useEffect(() => {
    let cancelled = false
    getManagedArtistId(user).then((id) => {
      if (!cancelled) setArtistId(id)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (!artistId) return
    refresh()
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not load artwork')
      })
      .finally(() => setLoading(false))
  }, [artistId])

  const furnitureNameByArtId = useMemo(
    () =>
      Object.fromEntries(
        furniture
          .filter((item) => item.artwork_id)
          .map((item) => [item.artwork_id as string, item.name]),
      ),
    [furniture],
  )

  async function handleCreate(draft: ArtworkDraft) {
    await createArtwork(draft)
    await refresh()
    setMode('list')
  }

  async function handleEdit(draft: ArtworkDraft) {
    if (!editing) return
    await updateArtwork(editing.id, {
      title: draft.title,
      price: draft.price,
      description: draft.description,
      medium: draft.medium,
      dimensions: draft.dimensions,
      image_url: draft.image_url,
    })
    await refresh()
    setEditing(undefined)
    setMode('list')
  }

  async function handleDelete(item: Artwork) {
    const confirmed = window.confirm(`Delete “${item.title}”?`)
    if (!confirmed) return
    await deleteArtwork(item.id)
    await refresh()
  }

  function applyDemoRelease(artworkId: string) {
    setArtwork((prev) =>
      prev.map((item) =>
        item.id === artworkId ? { ...item, status: 'available' as const } : item,
      ),
    )
    setFurniture((prev) =>
      prev.map((item) =>
        item.artwork_id === artworkId
          ? { ...item, status: 'available' as const }
          : item,
      ),
    )
    setPendingOrderByArtId((prev) => {
      const next = { ...prev }
      delete next[artworkId]
      return next
    })
  }

  async function handleMarkAvailable(item: Artwork) {
    const confirmed = window.confirm(
      `Mark “${item.title}” as available again? Any pending order for this piece will be cancelled.`,
    )
    if (!confirmed) return

    setActionArtworkId(item.id)
    setError(null)
    try {
      if (isDemoRecord(item)) {
        applyDemoRelease(item.id)
        return
      }
      await markArtworkAvailable(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update artwork')
    } finally {
      setActionArtworkId(null)
    }
  }

  async function handleCancelOrder(item: Artwork, order: Order) {
    const confirmed = window.confirm(
      `Cancel the pending order from ${order.customer_name}? The artwork and linked furniture will become available again.`,
    )
    if (!confirmed) return

    setActionArtworkId(item.id)
    setError(null)
    try {
      if (isDemoRecord(item)) {
        applyDemoRelease(item.id)
        return
      }
      await cancelOrderAndRelease(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel order')
    } finally {
      setActionArtworkId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-amber-700 uppercase">Artist tools</p>
          <h1 className="font-serif text-3xl text-stone-900">Art Management</h1>
        </div>
        {mode === 'list' && (
          <button
            type="button"
            onClick={() => setMode('create')}
            className="btn-a"
          >
            Upload artwork
          </button>
        )}
      </div>

      {loading && <p className="mt-8 text-stone-500">Loading artwork…</p>}
      {error && <p className="mt-8 text-red-600">{error}</p>}

      {!loading && !error && mode === 'list' && (
        <div className="mt-8">
          <DemoDataBanner
            hasDemo={artwork.some(isDemoRecord)}
            onClearDemo={async () => {
              if (
                !window.confirm(
                  'Remove all demo data? Your real uploads stay.',
                )
              ) {
                return
              }
              await clearAllDemoData()
              await refresh()
            }}
          />
          <ArtManagementTable
            artwork={artwork}
            furnitureNameByArtId={furnitureNameByArtId}
            pendingOrderByArtId={pendingOrderByArtId}
            actionArtworkId={actionArtworkId}
            onEdit={(item) => {
              setEditing(item)
              setMode('edit')
            }}
            onDelete={handleDelete}
            onMarkAvailable={handleMarkAvailable}
            onCancelOrder={handleCancelOrder}
          />
        </div>
      )}

      {mode === 'create' && (
        <div className="mt-8 max-w-lg rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-serif text-xl text-stone-900">Upload a piece</h2>
          <p className="mt-1 text-sm text-stone-500">
            File upload will go to storage later. For now the preview stays in the browser.
          </p>
          <div className="mt-4">
            <ArtForm
              artistId={artistId}
              submitLabel="Save artwork"
              onSubmit={handleCreate}
              onCancel={() => setMode('list')}
            />
          </div>
        </div>
      )}

      {mode === 'edit' && editing && (
        <div className="mt-8 max-w-lg rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-serif text-xl text-stone-900">Edit details</h2>
          <div className="mt-4">
            <ArtForm
              artistId={artistId}
              initial={editing}
              submitLabel="Save changes"
              onSubmit={handleEdit}
              onCancel={() => {
                setEditing(undefined)
                setMode('list')
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
