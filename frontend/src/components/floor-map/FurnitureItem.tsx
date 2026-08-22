import { Check } from 'lucide-react'
import { MOCK_PURCHASE_NOTES } from '../../data/mockRegistry'
import { formatPrice } from '../../lib/utils'
import type { Artwork, Furniture } from '../../types'
import { FurnitureSilhouette } from './FurnitureSilhouette'

const statusClass: Record<Furniture['status'], string> = {
  available: 'grayscale opacity-80 hover:opacity-100',
  reserved: 'ring-2 ring-orange-400',
  purchased: 'ring-2 ring-amber-400',
}

type Props = {
  item: Furniture
  scale: number
  artwork?: Artwork
  onSelect: (item: Furniture) => void
}

export function FurnitureItem({ item, scale, artwork, onSelect }: Props) {
  const width = (item.width ?? 120) * scale
  const height = (item.height ?? 80) * scale
  const purchaseNote = MOCK_PURCHASE_NOTES[item.id]

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`group absolute text-left ${statusClass[item.status]}`}
      style={{
        left: item.position_x * scale,
        top: item.position_y * scale,
        width,
        height,
        zIndex: item.z_index,
        transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
      }}
      aria-label={`${item.name}, ${formatPrice(item.price)}`}
    >
      {item.image_url ? (
        <img
          src={item.image_url}
          alt=""
          className="h-[70%] w-full object-contain"
        />
      ) : (
        <div className="h-[70%] w-full">
          <FurnitureSilhouette name={item.name} status={item.status} />
        </div>
      )}
      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-stone-700 shadow-sm">
        {item.name} {formatPrice(item.price)}
        {item.status === 'purchased' && <Check className="h-3 w-3 text-amber-700" />}
      </span>

      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-52 -translate-x-1/2 rounded-lg border border-stone-200 bg-white p-3 text-xs shadow-lg group-hover:block group-focus-visible:block">
        <p className="font-medium text-stone-900">{item.name}</p>
        <p className="text-stone-600">{formatPrice(item.price)}</p>
        {artwork && (
          <p className="mt-1 truncate text-stone-500">{artwork.title}</p>
        )}
        {item.status === 'available' && (
          <p className="mt-2 text-amber-800">Click to view artwork</p>
        )}
        {item.status === 'purchased' && (
          <p className="mt-2 text-stone-500">{purchaseNote ?? 'Already purchased'}</p>
        )}
        {item.status === 'reserved' && (
          <p className="mt-2 text-orange-700">Reserved / in progress</p>
        )}
      </div>
    </button>
  )
}
