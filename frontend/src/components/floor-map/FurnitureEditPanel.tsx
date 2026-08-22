import { useMemo, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import {
  FURNITURE_PRESETS,
  findPresetByImageUrl,
  type FurniturePreset,
} from '../../data/furniturePresets'
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

type ImageSource = 'preset' | 'upload'

export function FurnitureEditPanel({
  roomId,
  artworkOptions,
  initial,
  onSubmit,
  onDelete,
  onClose,
}: Props) {
  const matchedPreset = useMemo(
    () => findPresetByImageUrl(initial?.image_url),
    [initial?.image_url],
  )

  const [name, setName] = useState(initial?.name ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [externalUrl, setExternalUrl] = useState(initial?.external_url ?? '')
  const [artworkId, setArtworkId] = useState(initial?.artwork_id ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [selectedPresetId, setSelectedPresetId] = useState(matchedPreset?.id ?? '')
  const [imageSource, setImageSource] = useState<ImageSource>(
    initial?.image_url && !matchedPreset ? 'upload' : 'preset',
  )
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [presetSize, setPresetSize] = useState({
    width: initial?.width ?? matchedPreset?.defaultWidth ?? 140,
    height: initial?.height ?? matchedPreset?.defaultHeight ?? 100,
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function selectPreset(preset: FurniturePreset) {
    setImageSource('preset')
    setSelectedPresetId(preset.id)
    setPendingFile(null)
    setImageUrl(preset.imageUrl)
    setPresetSize({ width: preset.defaultWidth, height: preset.defaultHeight })
    if (!name.trim() || FURNITURE_PRESETS.some((p) => p.suggestedName === name)) {
      setName(preset.suggestedName)
    }
  }

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
      if (imageSource === 'upload' && pendingFile) {
        const uploaded = await uploadImage('furniture', pendingFile, roomId)
        nextImageUrl = uploaded.url
      }
      if (!nextImageUrl) {
        setError('Pick a stock photo or upload Dani’s hand-drawn PNG.')
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
        width: initial?.width ?? presetSize.width,
        height: initial?.height ?? presetSize.height,
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
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-stone-900">
            {initial ? 'Edit furniture' : 'Add furniture'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-stone-600">Choose a stock photo</p>
            <p className="mt-0.5 text-xs text-stone-400">
              Free Unsplash photos for now. Dani can replace any with a hand-drawn PNG later.
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {FURNITURE_PRESETS.map((preset) => {
                const selected =
                  imageSource === 'preset' && selectedPresetId === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className={`overflow-hidden rounded-lg border text-left ${
                      selected
                        ? 'border-amber-500 ring-2 ring-amber-200'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <img
                      src={preset.imageUrl}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                    <span className="block truncate px-1.5 py-1 text-[11px] text-stone-600">
                      {preset.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-3">
            <label className="block text-sm">
              <span className="font-medium text-stone-700">
                Or upload hand-drawn PNG
              </span>
              <input
                type="file"
                accept="image/png,image/webp,image/jpeg"
                className="mt-2 block w-full text-sm"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  setImageSource('upload')
                  setSelectedPresetId('')
                  setPendingFile(file)
                  setImageUrl(URL.createObjectURL(file))
                }}
              />
            </label>
            <p className="mt-1 text-xs text-stone-400">
              Preferred: transparent PNG. Saves to Supabase <code>furniture</code> when
              configured.
            </p>
          </div>

          {imageUrl && (
            <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
              <img
                src={imageUrl}
                alt=""
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div className="text-xs text-stone-500">
                {imageSource === 'preset' ? 'Using stock photo' : 'Using uploaded drawing'}
              </div>
            </div>
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
