import { X } from 'lucide-react'
import { useEffect } from 'react'
import { formatPrice } from '../../lib/utils'
import type { Artwork, Furniture } from '../../types'
import { FurnitureSilhouette } from '../floor-map/FurnitureSilhouette'

type Props = {
  artwork: Artwork
  furniture?: Furniture
  onClose: () => void
}

export function ArtDetailModal({ artwork, furniture, onClose }: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const canPurchase = artwork.status === 'available'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="art-detail-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-stone-500 hover:bg-stone-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ArtworkPreview artwork={artwork} />

        <h2 id="art-detail-title" className="mt-4 font-serif text-2xl text-stone-900">
          {artwork.title}
        </h2>
        <p className="mt-1 text-lg text-stone-700">{formatPrice(artwork.price)}</p>
        {(artwork.medium || artwork.dimensions) && (
          <p className="mt-2 text-sm text-stone-500">
            {[artwork.medium, artwork.dimensions].filter(Boolean).join(', ')}
          </p>
        )}
        {artwork.description && (
          <p className="mt-3 text-sm leading-relaxed text-stone-600">{artwork.description}</p>
        )}

        {furniture && (
          <div className="mt-6 border-t border-stone-200 pt-4">
            <p className="text-sm font-medium text-stone-900">Your purchase helps Dani get:</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="h-16 w-20">
                {furniture.image_url ? (
                  <img src={furniture.image_url} alt="" className="h-full w-full object-contain" />
                ) : (
                  <FurnitureSilhouette name={furniture.name} status={furniture.status} />
                )}
              </div>
              <div>
                <p className="text-sm text-stone-800">{furniture.name}</p>
                {furniture.external_url && (
                  <a
                    href={furniture.external_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-amber-800 underline"
                  >
                    View listing
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={!canPurchase}
          className="mt-6 w-full rounded-lg bg-stone-900 px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canPurchase ? 'Purchase This Artwork' : 'Not available'}
        </button>
        {canPurchase && (
          <p className="mt-2 text-center text-xs text-stone-400">
            Order form will connect to the backend in a later phase.
          </p>
        )}
      </div>
    </div>
  )
}

function ArtworkPreview({ artwork }: { artwork: Artwork }) {
  if (artwork.image_url) {
    return (
      <img
        src={artwork.image_url}
        alt={artwork.title}
        className="h-56 w-full rounded-xl object-cover"
      />
    )
  }

  return (
    <div className="flex h-56 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-stone-200 font-serif text-xl text-stone-600">
      {artwork.title}
    </div>
  )
}
