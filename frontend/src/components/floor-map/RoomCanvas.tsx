import { useEffect, useRef, useState } from 'react'
import type { Artwork, Furniture, Room } from '../../types'
import { FurnitureItem } from './FurnitureItem'

type Props = {
  room: Room
  furniture: Furniture[]
  artworkById: Record<string, Artwork>
  editMode?: boolean
  onSelectFurniture: (item: Furniture) => void
  onMoveFurniture?: (id: string, x: number, y: number) => void
  onMoveFurnitureEnd?: (id: string, x: number, y: number) => void
}

export function RoomCanvas({
  room,
  furniture,
  artworkById,
  editMode = false,
  onSelectFurniture,
  onMoveFurniture,
  onMoveFurnitureEnd,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = frameRef.current
    if (!el) return

    const update = () => {
      const width = el.clientWidth
      if (width > 0) setScale(width / room.width)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [room.width])

  return (
    <div
      ref={frameRef}
      className={`relative w-full rounded-2xl border bg-[#f3efe6] ${
        editMode ? 'overflow-hidden border-amber-300 ring-2 ring-amber-200' : 'overflow-visible border-stone-200'
      }`}
      style={{ aspectRatio: `${room.width} / ${room.height}` }}
    >
      <div
        className="absolute inset-3 rounded-xl border border-dashed border-stone-300/80 bg-[linear-gradient(90deg,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.035)_1px,transparent_1px)] bg-[size:28px_28px]"
        aria-hidden
      />
      {furniture.map((item) => (
        <FurnitureItem
          key={item.id}
          item={item}
          scale={scale}
          artwork={item.artwork_id ? artworkById[item.artwork_id] : undefined}
          editMode={editMode}
          onSelect={onSelectFurniture}
          onMove={onMoveFurniture}
          onMoveEnd={onMoveFurnitureEnd}
        />
      ))}
    </div>
  )
}
