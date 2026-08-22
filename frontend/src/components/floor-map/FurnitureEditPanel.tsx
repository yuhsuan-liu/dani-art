import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { FurnitureDraft } from '../../lib/rooms'
import { uploadImage } from '../../lib/storage'
import type { Artwork, Furniture } from '../../types'

type Props = {
  roomId: string
  artworkOptions: Artwork[]
  initial?: Furniture
  onSubmit: (draft: FurnitureDraft) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
}

export function FurnitureEditPanel({
  roomId,
  artworkOptions,
  initial,
  onSubmit,
  onDelete,
  onClose,
}: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [externalUrl, setExternalUrl] = useState(initial?.external_url ?? '')
  const [artworkId, setArtworkId] = useState(initial?.artwork_id ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const parsedPrice = Number(price)
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError('Enter a valid price.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      let nextImageUrl = imageUrl
      if (pendingFile) {
        const uploaded = await uploadImage('furniture', pendingFile, roomId)
        nextImageUrl = uploaded.url
      }
      if (!nextImageUrl && !initial) {
        setError('Upload a furniture drawing (PNG with transparency preferred).')
        setSaving(false)
        return
      }

      await onSubmit({
        room_id: roomId,
        name,
        price: parsedPrice,
        image_url: nextImageUrl,
        external_url: externalUrl || undefined,
        artwork_id: artworkId || undefined,
        width: initial?.width ?? 140,
        height: initial?.height ?? 100,
        position_x: initial?.position_x,
        position_y: initial?.position_y,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save furniture')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-stone-900">
            {initial ? 'Edit furniture' : 'Add furniture'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="text-stone-600">Hand-drawn image</span>
            <input
              type="file"
              accept="image/png,image/webp,image/jpeg"
              className="mt-1 block w-full text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setPendingFile(file)
                setImageUrl(URL.createObjectURL(file))
              }}
            />
            <span className="mt-1 block text-xs text-stone-400">
              Uploads to Supabase Storage bucket <code>furniture</code> when
              configured; otherwise a local preview is used.
            </span>
          </label>

          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              className="mx-auto h-28 w-auto object-contain"
            />
          )}

          <label className="block text-sm">
            <span className="text-stone-600">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
              placeholder="Cozy Couch"
            />
          </label>

          <label className="block text-sm">
            <span className="text-stone-600">Target price (USD)</span>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="text-stone-600">External listing URL</span>
            <input
              value={externalUrl}
              onChange={(event) => setExternalUrl(event.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
              placeholder="https://…"
            />
          </label>

          <label className="block text-sm">
            <span className="text-stone-600">Linked artwork</span>
            <select
              value={artworkId}
              onChange={(event) => setArtworkId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
            >
              <option value="">None</option>
              {artworkOptions.map((art) => (
                <option key={art.id} value={art.id}>
                  {art.title} (${art.price})
                </option>
              ))}
            </select>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            {initial && onDelete && (
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm(`Delete “${initial.name}”?`)) return
                  await onDelete()
                }}
                className="ml-auto rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
