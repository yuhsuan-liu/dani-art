import { Check } from 'lucide-react'
import { useRef, type PointerEvent } from 'react'
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
  editMode?: boolean
  onSelect: (item: Furniture) => void
  onMove?: (id: string, x: number, y: number) => void
  onMoveEnd?: (id: string, x: number, y: number) => void
}

export function FurnitureItem({
  item,
  scale,
  artwork,
  editMode = false,
  onSelect,
  onMove,
  onMoveEnd,
}: Props) {
  const width = (item.width ?? 120) * scale
  const height = (item.height ?? 80) * scale
  const purchaseNote = MOCK_PURCHASE_NOTES[item.id]
  const dragRef = useRef<{
    startClientX: number
    startClientY: number
    originX: number
    originY: number
    moved: boolean
  } | null>(null)

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (!editMode) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      originX: item.position_x,
      originY: item.position_y,
      moved: false,
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!editMode || !dragRef.current) return
    const dx = (event.clientX - dragRef.current.startClientX) / scale
    const dy = (event.clientY - dragRef.current.startClientY) / scale
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      dragRef.current.moved = true
    }
    onMove?.(
      item.id,
      Math.round(dragRef.current.originX + dx),
      Math.round(dragRef.current.originY + dy),
    )
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (!editMode || !dragRef.current) {
      onSelect(item)
      return
    }
    const { moved, originX, originY } = dragRef.current
    const dx = (event.clientX - dragRef.current.startClientX) / scale
    const dy = (event.clientY - dragRef.current.startClientY) / scale
    const nextX = Math.round(originX + dx)
    const nextY = Math.round(originY + dy)
    dragRef.current = null
    if (moved) {
      onMoveEnd?.(item.id, nextX, nextY)
    } else {
      onSelect(item)
    }
  }

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragRef.current = null
      }}
      className={`group absolute touch-none text-left ${statusClass[item.status]} ${
        editMode ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
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
          className="pointer-events-none h-[70%] w-full object-contain"
          draggable={false}
        />
      ) : (
        <div className="pointer-events-none h-[70%] w-full">
          <FurnitureSilhouette name={item.name} status={item.status} />
        </div>
      )}
      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-stone-700 shadow-sm">
        {item.name} {formatPrice(item.price)}
        {item.status === 'purchased' && <Check className="h-3 w-3 text-amber-700" />}
      </span>

      {!editMode && (
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
      )}
    </button>
  )
}
