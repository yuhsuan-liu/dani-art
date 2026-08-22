import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArtDetailModal } from '../components/art/ArtDetailModal'
import { ArtGridView } from '../components/art/ArtGridView'
import { ArtListView } from '../components/art/ArtListView'
import { DemoDataBanner } from '../components/common/DemoBadge'
import { ViewSwitch } from '../components/common/ViewSwitch'
import { useAuth } from '../contexts/AuthContext'
import { EditModeToolbar } from '../components/floor-map/EditModeToolbar'
import { FurnitureEditPanel } from '../components/floor-map/FurnitureEditPanel'
import { RoomCanvas } from '../components/floor-map/RoomCanvas'
import { RoomNameDialog, RoomTabs } from '../components/floor-map/RoomTabs'
import { isDemoRecord } from '../data/mockRegistry'
import { getArtist } from '../lib/artists'
import { getArtworkByArtist } from '../lib/artwork'
import { clearAllDemoData } from '../lib/demo'
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
import type { Artist as ArtistType, Artwork, Furniture, Room } from '../types'

type CatalogView = 'gallery' | 'plan'
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
  const [catalog, setCatalog] = useState<CatalogView>('gallery')
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

  if (loading) {
    return <p className="px-4 py-16 text-center text-stone-500">Loading…</p>
  }
  if (error || !artist) {
    return (
      <p className="px-4 py-16 text-center text-red-600">
        {error ?? 'Artist not found'}
      </p>
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

      <div className="mt-6 space-y-3">
        <ViewSwitch
          label="Catalog view"
          value={catalog}
          onChange={(next) => {
            setCatalog(next)
            setEditMode(false)
          }}
          options={[
            { id: 'gallery', label: 'Gallery' },
            { id: 'plan', label: 'Floor plan' },
          ]}
        />
        {catalog === 'gallery' && (
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
        )}
      </div>

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

      {catalog === 'plan' && (
        <section className="mt-6 space-y-4">
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
        </section>
      )}

      {catalog === 'gallery' && (
        <section className="mt-6">
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
        </section>
      )}

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
