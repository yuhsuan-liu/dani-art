import { useState, type FormEvent } from 'react'
import type { ArtworkDraft } from '../../lib/artwork'
import { uploadImage } from '../../lib/storage'
import type { Artwork } from '../../types'

type Props = {
  artistId: string
  initial?: Artwork
  submitLabel: string
  onSubmit: (draft: ArtworkDraft) => Promise<void>
  onCancel: () => void
}

export function ArtForm({ artistId, initial, submitLabel, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [medium, setMedium] = useState(initial?.medium ?? '')
  const [dimensions, setDimensions] = useState(initial?.dimensions ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const parsedPrice = Number(price)
    if (!title.trim()) {
      setError('Title is required.')
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
        const uploaded = await uploadImage('artwork', pendingFile, artistId)
        nextImageUrl = uploaded.url
      }
      await onSubmit({
        user_id: artistId,
        title,
        price: parsedPrice,
        description: description || undefined,
        medium: medium || undefined,
        dimensions: dimensions || undefined,
        image_url: nextImageUrl || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save artwork')
    } finally {
      setSaving(false)
    }
  }

  function onFileChange(file: File | undefined) {
    if (!file) return
    setPendingFile(file)
    setImageUrl(URL.createObjectURL(file))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="text-stone-600">Image</span>
        <input
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-sm"
          onChange={(event) => onFileChange(event.target.files?.[0])}
        />
        <span className="mt-1 block text-xs text-stone-400">
          Saved to Supabase Storage bucket <code>artwork</code> when configured.
        </span>
      </label>
      {imageUrl && (
        <img src={imageUrl} alt="" className="h-32 w-full rounded-lg object-cover" />
      )}
      <label className="block text-sm">
        <span className="text-stone-600">Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">Price (USD)</span>
        <input
          type="number"
          min="0"
          step="1"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">Medium</span>
        <input
          value={medium}
          onChange={(event) => setMedium(event.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">Dimensions</span>
        <input
          value={dimensions}
          onChange={(event) => setDimensions(event.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
