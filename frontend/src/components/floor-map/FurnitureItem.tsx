import { Check } from 'lucide-react'
import { useRef, type PointerEvent } from 'react'
import { isDemoRecord, MOCK_PURCHASE_NOTES } from '../../data/mockRegistry'
import { formatPrice } from '../../lib/utils'
import type { Artwork, Furniture } from '../../types'
import { FurnitureSilhouette } from './FurnitureSilhouette'

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
  const width = Math.max((item.width ?? 120) * scale, 44)
  const height = Math.max((item.height ?? 80) * scale, 44)
  const purchaseNote = MOCK_PURCHASE_NOTES[item.id]
  const demo = isDemoRecord(item)
  const sold = item.status === 'purchased'
  const hold = item.status === 'reserved'
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

  const statusLabel = sold ? 'Sold' : hold ? 'Hold' : formatPrice(item.price)

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragRef.current = null
      }}
      className={`furn-piece ${editMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{
        left: item.position_x * scale,
        top: item.position_y * scale,
        width,
        height,
        zIndex: item.z_index,
        transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
      }}
      aria-label={`${item.name}, ${statusLabel}${artwork ? `, ${artwork.title}` : ''}`}
    >
      <div className={`relative h-[70%] w-full overflow-hidden rounded-md ${sold ? 'art-frame' : ''}`}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt=""
            className="pointer-events-none h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <FurnitureSilhouette name={item.name} status={item.status} />
        )}
        {!editMode && !sold && artwork?.image_url && (
          <img
            src={artwork.image_url}
            alt=""
            className="furn-art-preview"
            draggable={false}
          />
        )}
      </div>
      <span className="furn-tag">
        {item.name} {sold ? 'Sold' : hold ? 'Hold' : formatPrice(item.price)}
        {sold && <Check className="h-3 w-3 shrink-0 text-amber-800" />}
      </span>
      {demo && purchaseNote ? (
        <span className="sr-only">{purchaseNote}</span>
      ) : null}
    </button>
  )
}
