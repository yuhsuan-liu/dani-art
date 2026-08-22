import { useEffect, useRef, useState } from 'react'
import type { Artwork, Furniture, Room } from '../../types'
import { FurnitureItem } from './FurnitureItem'

type Props = {
  room: Room
  furniture: Furniture[]
  artworkById: Record<string, Artwork>
  onSelectFurniture: (item: Furniture) => void
}

export function RoomCanvas({ room, furniture, artworkById, onSelectFurniture }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = frameRef.current
    if (!el) return

    const update = () => {
      setScale(el.clientWidth / room.width)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [room.width])

  return (
    <div
      ref={frameRef}
      className="relative w-full overflow-visible rounded-2xl border border-stone-200 bg-[#f3efe6]"
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
          onSelect={onSelectFurniture}
        />
      ))}
    </div>
  )
}
