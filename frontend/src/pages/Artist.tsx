import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArtDetailModal } from '../components/art/ArtDetailModal'
import { ArtGridView } from '../components/art/ArtGridView'
import { ArtListView } from '../components/art/ArtListView'
import { DemoDataBanner } from '../components/common/DemoBadge'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ViewSwitch } from '../components/common/ViewSwitch'
import { useAuth } from '../contexts/AuthContext'
import { EditModeToolbar } from '../components/floor-map/EditModeToolbar'
import { FurnitureEditPanel } from '../components/floor-map/FurnitureEditPanel'
import { RoomCanvas } from '../components/floor-map/RoomCanvas'
import { RoomDecorControls } from '../components/floor-map/RoomDecorControls'
import { RoomNameDialog, RoomTabs } from '../components/floor-map/RoomTabs'
import { isDemoRecord } from '../data/mockRegistry'
import { getArtist } from '../lib/artists'
import { getArtworkByArtist } from '../lib/artwork'
import { clearAllDemoData } from '../lib/demo'
import { normalizeRoomDecor } from '../lib/roomDecor'
import {
  createFurniture,
  createRoom,
  deleteFurniture,
  deleteRoom,
  getFurnitureByArtist,
  getRoomsByArtist,
  updateFurniture,
  updateFurniturePosition,
  updateRoom,
  type FurnitureDraft,
} from '../lib/rooms'
import type { Artist as ArtistType, Artwork, Furniture, Room, RoomDecor } from '../types'

type GalleryLayout = 'grid' | 'list'
type RoomDialog =
  | { type: 'add' }
  | { type: 'rename'; room: Room }
  | null

export function Artist() {
  const { artistId = '' } = useParams()
  const { isArtist } = useAuth()
  const [artist, setArtist] = useState<ArtistType | undefined>()
  const [rooms, setRooms] = useState<Room[]>([])
  const [furniture, setFurniture] = useState<Furniture[]>([])
  const [artwork, setArtwork] = useState<Artwork[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string>()
  const [galleryLayout, setGalleryLayout] = useState<GalleryLayout>('grid')
  const [editMode, setEditMode] = useState(false)
  const [selectedFurniture, setSelectedFurniture] = useState<Furniture>()
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork>()
  const [editingFurniture, setEditingFurniture] = useState<Furniture | null>(null)
  const [addingFurniture, setAddingFurniture] = useState(false)
  const [roomDialog, setRoomDialog] = useState<RoomDialog>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef<number | null>(null)

  const refresh = useCallback(async () => {
    const [nextArtist, nextRooms, nextFurniture, nextArtwork] = await Promise.all([
      getArtist(artistId),
      getRoomsByArtist(artistId),
      getFurnitureByArtist(artistId),
      getArtworkByArtist(artistId),
    ])
    setArtist(nextArtist)
    setRooms(nextRooms)
    setFurniture(nextFurniture)
    setArtwork(nextArtwork)
    setActiveRoomId((current) =>
      current && nextRooms.some((room) => room.id === current)
        ? current
        : nextRooms[0]?.id,
    )
  }, [artistId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    refresh()
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load artist')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refresh])

  useEffect(() => {
    if (loading) return

    function scrollToHash() {
      const id = window.location.hash.replace('#', '')
      if (id === 'gallery' || id === 'registry') {
        window.requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
    }

    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [loading])

  const markSaving = useCallback(() => {
    setSaveStatus('saving')
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => setSaveStatus('saved'), 400)
  }, [])

  const artworkById = useMemo(
    () => Object.fromEntries(artwork.map((item) => [item.id, item])),
    [artwork],
  )
  const furnitureNameByArtId = useMemo(
    () =>
      Object.fromEntries(
        furniture
          .filter((item) => item.artwork_id)
          .map((item) => [item.artwork_id as string, item.name]),
      ),
    [furniture],
  )
  const furnitureByArtId = useMemo(
    () =>
      Object.fromEntries(
        furniture
          .filter((item) => item.artwork_id)
          .map((item) => [item.artwork_id as string, item]),
      ),
    [furniture],
  )

  const activeRoom = rooms.find((room) => room.id === activeRoomId)
  const roomFurniture = furniture.filter((item) => item.room_id === activeRoomId)
  const ownerId = artist?.id ?? 'dani'

  const modalArtwork =
    selectedArtwork ??
    (selectedFurniture?.artwork_id ? artworkById[selectedFurniture.artwork_id] : undefined)
  const modalFurniture =
    selectedFurniture ??
    (selectedArtwork ? furnitureByArtId[selectedArtwork.id] : undefined)

  function openFurniture(item: Furniture) {
    if (editMode) {
      setEditingFurniture(item)
      return
    }
    if (!item.artwork_id) return
    setSelectedFurniture(item)
    setSelectedArtwork(undefined)
  }

  function handleMove(id: string, x: number, y: number) {
    setFurniture((current) =>
      current.map((item) =>
        item.id === id ? { ...item, position_x: x, position_y: y } : item,
      ),
    )
  }

  async function handleMoveEnd(id: string, x: number, y: number) {
    try {
      markSaving()
      await updateFurniturePosition(id, x, y)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }

  async function handleFurnitureSubmit(draft: FurnitureDraft) {
    markSaving()
    if (editingFurniture) {
      await updateFurniture(editingFurniture.id, {
        name: draft.name,
        price: draft.price,
        image_url: draft.image_url,
        external_url: draft.external_url,
        artwork_id: draft.artwork_id || undefined,
      })
    } else {
      await createFurniture(draft)
    }
    await refresh()
    setEditingFurniture(null)
    setAddingFurniture(false)
    setSaveStatus('saved')
  }

  async function handleDecorChange(decor: RoomDecor) {
    if (!activeRoom) return

    if (isDemoRecord(activeRoom)) {
      setRooms((current) =>
        current.map((room) => (room.id === activeRoom.id ? { ...room, decor } : room)),
      )
      return
    }

    try {
      markSaving()
      await updateRoom(activeRoom.id, { decor })
      setRooms((current) =>
        current.map((room) => (room.id === activeRoom.id ? { ...room, decor } : room)),
      )
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading artist…" />
  }
  if (error || !artist) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <ErrorAlert
          message={error ?? 'Artist not found'}
          onRetry={() => {
            setError(null)
            setLoading(true)
            refresh()
              .catch((err: unknown) =>
                setError(err instanceof Error ? err.message : 'Could not load artist'),
              )
              .finally(() => setLoading(false))
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="btn-c">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Link to="/manage/art" className="btn-c hidden sm:inline-flex">
          Manage art
        </Link>
      </div>

      <section className="mt-6 flex items-center gap-4">
        <div className="avatar-lg flex items-center justify-center bg-amber-100 font-serif text-2xl text-amber-800">
          {artist.name.charAt(0)}
        </div>
        <div>
          <h1 className="font-serif text-2xl text-stone-900 sm:text-3xl">{artist.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-stone-600">{artist.bio}</p>
        </div>
      </section>

      <div className="mt-6">
        <DemoDataBanner
          hasDemo={
            rooms.some(isDemoRecord) ||
            furniture.some(isDemoRecord) ||
            artwork.some(isDemoRecord)
          }
          onClearDemo={async () => {
            if (!window.confirm('Remove all demo rooms, furniture, artwork, and orders? Your real uploads stay.')) {
              return
            }
            await clearAllDemoData()
            await refresh()
          }}
        />
      </div>

      <section id="gallery" className="mt-8 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-amber-700 uppercase">
              For sale
            </p>
            <h2 className="mt-2 font-serif text-2xl text-stone-900 sm:text-3xl">Artwork</h2>
            <p className="mt-2 max-w-2xl text-sm text-stone-600">
              Tap a piece to see details, price, and what furniture it funds.
            </p>
          </div>
          <ViewSwitch
            label="Gallery layout"
            value={galleryLayout}
            onChange={setGalleryLayout}
            compact
            options={[
              { id: 'grid', label: 'Grid' },
              { id: 'list', label: 'List' },
            ]}
          />
        </div>
        <div className="mt-6">
          {galleryLayout === 'grid' ? (
            <ArtGridView
              artwork={artwork}
              furnitureNameByArtId={furnitureNameByArtId}
              onSelect={(item) => {
                setSelectedArtwork(item)
                setSelectedFurniture(undefined)
              }}
            />
          ) : (
            <ArtListView
              artwork={artwork}
              furnitureNameByArtId={furnitureNameByArtId}
              onSelect={(item) => {
                setSelectedArtwork(item)
                setSelectedFurniture(undefined)
              }}
            />
          )}
        </div>
      </section>

      <section id="registry" className="mt-12 scroll-mt-24 border-t border-stone-200 pt-10">
        <p className="text-xs font-medium tracking-[0.2em] text-amber-700 uppercase">
          The registry
        </p>
        <h2 className="mt-2 font-serif text-2xl text-stone-900 sm:text-3xl">Floor plan</h2>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Each item is something Dani wants. Tap furniture to see the linked painting — buy
          the art, he gets the piece.
        </p>

        <div className="mt-6 space-y-4">
          {isArtist && (
            <EditModeToolbar
              editMode={editMode}
              saveStatus={saveStatus}
              onToggle={() => {
                setEditMode((value) => !value)
                setEditingFurniture(null)
                setAddingFurniture(false)
              }}
              onAddFurniture={() => {
                setAddingFurniture(true)
                setEditingFurniture(null)
              }}
            />
          )}

          {isArtist && editMode && activeRoom && (
            <RoomDecorControls
              decor={normalizeRoomDecor(activeRoom.decor)}
              onChange={handleDecorChange}
            />
          )}

          {rooms.length > 0 && activeRoom ? (
            <>
              <RoomTabs
                rooms={rooms}
                activeRoomId={activeRoom.id}
                editMode={editMode}
                onSelect={setActiveRoomId}
                onAddRoom={() => setRoomDialog({ type: 'add' })}
                onRenameRoom={(room) => setRoomDialog({ type: 'rename', room })}
                onDeleteRoom={async (room) => {
                  if (!window.confirm(`Delete room “${room.name}” and its furniture?`)) return
                  markSaving()
                  await deleteRoom(room.id)
                  await refresh()
                  setSaveStatus('saved')
                }}
              />
              <RoomCanvas
                room={activeRoom}
                furniture={roomFurniture}
                artworkById={artworkById}
                editMode={editMode}
                onSelectFurniture={openFurniture}
                onMoveFurniture={handleMove}
                onMoveFurnitureEnd={handleMoveEnd}
              />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
              <p className="text-stone-500">No rooms yet.</p>
              {editMode && (
                <button
                  type="button"
                  onClick={() => setRoomDialog({ type: 'add' })}
                  className="btn-a mt-4"
                >
                  Add a room
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {!editMode && modalArtwork && (
        <ArtDetailModal
          artwork={modalArtwork}
          furniture={modalFurniture}
          onClose={() => {
            setSelectedArtwork(undefined)
            setSelectedFurniture(undefined)
          }}
        />
      )}

      {(addingFurniture || editingFurniture) && activeRoom && (
        <FurnitureEditPanel
          roomId={activeRoom.id}
          artworkOptions={artwork}
          initial={editingFurniture ?? undefined}
          onClose={() => {
            setAddingFurniture(false)
            setEditingFurniture(null)
          }}
          onSubmit={handleFurnitureSubmit}
          onDelete={
            editingFurniture
              ? async () => {
                  markSaving()
                  await deleteFurniture(editingFurniture.id)
                  await refresh()
                  setEditingFurniture(null)
                  setSaveStatus('saved')
                }
              : undefined
          }
        />
      )}

      {roomDialog && (
        <RoomNameDialog
          title={roomDialog.type === 'add' ? 'Add room' : 'Rename room'}
          initialName={roomDialog.type === 'rename' ? roomDialog.room.name : ''}
          onCancel={() => setRoomDialog(null)}
          onConfirm={async (name) => {
            if (!name) return
            markSaving()
            if (roomDialog.type === 'add') {
              const created = await createRoom({ user_id: ownerId, name })
              await refresh()
              setActiveRoomId(created.id)
            } else {
              await updateRoom(roomDialog.room.id, { name })
              await refresh()
            }
            setRoomDialog(null)
            setSaveStatus('saved')
          }}
        />
      )}
    </div>
  )
}
