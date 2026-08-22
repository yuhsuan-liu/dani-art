import { formatPrice } from '../../lib/utils'
import type { Artwork } from '../../types'

type Props = {
  artwork: Artwork[]
  furnitureNameByArtId: Record<string, string>
  onSelect: (artwork: Artwork) => void
}

export function ArtGridView({ artwork, furnitureNameByArtId, onSelect }: Props) {
  return (
    <ul className="gallery-grid">
      {artwork.map((item) => {
        const sold = item.status === 'sold'
        const hold = item.status === 'reserved'
        return (
          <li key={item.id}>
            <button type="button" className="gallery-card w-full" onClick={() => onSelect(item)}>
              <div className={sold ? 'art-frame' : undefined}>
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt=""
                    className="aspect-[4/5] w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center bg-amber-100 font-serif text-stone-600">
                    {item.title}
                  </div>
                )}
              </div>
              <div className="px-3 py-2 text-left">
                <p className="truncate font-medium text-stone-900">{item.title}</p>
                <p className="mt-0.5 text-sm text-stone-500">
                  {formatPrice(item.price)}
                  {hold ? ' · Hold' : sold ? ' · Sold' : ''}
                </p>
                <p className="mt-0.5 truncate text-xs text-stone-400">
                  {furnitureNameByArtId[item.id] ?? 'Unlinked'}
                </p>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
