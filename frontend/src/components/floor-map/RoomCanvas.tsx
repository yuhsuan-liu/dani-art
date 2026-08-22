import { useEffect, useRef, useState, type TouchEvent, type TouchList, type WheelEvent } from 'react'
import { normalizeRoomDecor, roomDecorClasses } from '../../lib/roomDecor'
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

function touchDistance(touches: TouchList): number {
  if (touches.length < 2) return 0
  const a = touches.item(0)
  const b = touches.item(1)
  if (!a || !b) return 0
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
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
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null)
  const [fitScale, setFitScale] = useState(1)
  const [userZoom, setUserZoom] = useState(1)
  const decor = normalizeRoomDecor(room.decor)

  useEffect(() => {
    const el = frameRef.current
    if (!el) return

    const update = () => {
      const width = el.clientWidth
      if (width > 0) setFitScale(width / room.width)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [room.width])

  useEffect(() => {
    if (editMode) setUserZoom(1)
  }, [editMode])

  const scale = fitScale * userZoom

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (editMode) return
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.08 : 0.08
    setUserZoom((current) => Math.min(2.5, Math.max(0.75, current + delta)))
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (editMode || event.touches.length !== 2) return
    pinchRef.current = {
      distance: touchDistance(event.touches),
      zoom: userZoom,
    }
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (editMode || !pinchRef.current || event.touches.length !== 2) return
    const distance = touchDistance(event.touches)
    if (distance <= 0) return
    const ratio = distance / pinchRef.current.distance
    setUserZoom(Math.min(2.5, Math.max(0.75, pinchRef.current.zoom * ratio)))
  }

  function handleTouchEnd() {
    pinchRef.current = null
  }

  return (
    <div className="space-y-2">
      {!editMode && (
        <p className="text-center text-xs text-stone-500 sm:text-left">
          Pinch or scroll to zoom the floor plan
        </p>
      )}
      <div
        ref={frameRef}
        className={`room-frame ${editMode ? 'room-frame-edit' : 'room-frame-view'}`}
        style={{ maxHeight: editMode ? undefined : '70dvh' }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative p-3"
          style={{
            width: room.width * scale,
            height: room.height * scale,
            minWidth: '100%',
          }}
        >
          <div
            className={`room-shell absolute inset-3 ${roomDecorClasses(decor)}`}
            aria-hidden
          >
            <div className="room-window-light" />
            <div className="room-baseboard" />
          </div>
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
      </div>
    </div>
  )
}
