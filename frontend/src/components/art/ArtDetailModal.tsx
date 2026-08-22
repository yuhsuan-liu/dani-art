import { X } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { isDemoRecord } from '../../data/mockRegistry'
import { formatPrice } from '../../lib/utils'
import type { Artwork, Furniture } from '../../types'
import { DemoBadge } from '../common/DemoBadge'
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

  const sold = artwork.status === 'sold' || furniture?.status === 'purchased'
  const hold = !sold && (artwork.status === 'reserved' || furniture?.status === 'reserved')
  const canPurchase = !sold && !hold && artwork.status === 'available'

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
        className="sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="btn-c" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={sold ? 'art-frame overflow-hidden' : undefined}>
          <ArtworkPreview artwork={artwork} />
        </div>

        <h2 id="art-detail-title" className="mt-4 font-serif text-2xl text-stone-900">
          {artwork.title}
          {isDemoRecord(artwork) && <DemoBadge className="ml-2 align-middle" />}
        </h2>
        <p className="mt-1 text-lg text-stone-700">{formatPrice(artwork.price)}</p>
        {sold && <p className="mt-1 text-sm text-stone-500">Sold</p>}
        {hold && <p className="mt-1 text-sm text-amber-800">On hold — someone is buying this piece.</p>}
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
            <p className="text-sm font-medium text-stone-900">
              {sold || hold ? 'This piece was linked to:' : 'Your purchase helps Dani get:'}
            </p>
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

        {canPurchase ? (
          <Link to={`/order/${artwork.id}`} className="btn-a mt-6 w-full">
            Purchase this artwork
          </Link>
        ) : (
          <p className="mt-6 text-center text-sm text-stone-500">
            {sold ? 'This painting already has a home.' : 'This one is on hold.'}
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
        className="h-56 w-full object-cover sm:rounded-xl"
      />
    )
  }

  return (
    <div className="flex h-56 items-center justify-center bg-gradient-to-br from-amber-100 to-stone-200 font-serif text-xl text-stone-600 sm:rounded-xl">
      {artwork.title}
    </div>
  )
}
