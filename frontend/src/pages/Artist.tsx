import { ArrowLeft, LayoutGrid, List } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArtDetailModal } from '../components/art/ArtDetailModal'
import { ArtListView } from '../components/art/ArtListView'
import { RoomCanvas } from '../components/floor-map/RoomCanvas'
import { RoomTabs } from '../components/floor-map/RoomTabs'
import { getArtist } from '../lib/artists'
import { getArtworkByArtist } from '../lib/artwork'
import { getFurnitureByArtist, getRoomsByArtist } from '../lib/rooms'
import type { Artist as ArtistType, Artwork, Furniture, Room } from '../types'

export function Artist() {
  const { artistId = '' } = useParams()
  const [artist, setArtist] = useState<ArtistType | undefined>()
  const [rooms, setRooms] = useState<Room[]>([])
  const [furniture, setFurniture] = useState<Furniture[]>([])
  const [artwork, setArtwork] = useState<Artwork[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string>()
  const [view, setView] = useState<'map' | 'list'>('map')
  const [selectedFurniture, setSelectedFurniture] = useState<Furniture>()
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork>()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([
      getArtist(artistId),
      getRoomsByArtist(artistId),
      getFurnitureByArtist(artistId),
      getArtworkByArtist(artistId),
    ])
      .then(([nextArtist, nextRooms, nextFurniture, nextArtwork]) => {
        if (cancelled) return
        setArtist(nextArtist)
        setRooms(nextRooms)
        setFurniture(nextFurniture)
        setArtwork(nextArtwork)
        setActiveRoomId(nextRooms[0]?.id)
      })
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
  }, [artistId])

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

  const modalArtwork =
    selectedArtwork ??
    (selectedFurniture?.artwork_id ? artworkById[selectedFurniture.artwork_id] : undefined)
  const modalFurniture =
    selectedFurniture ??
    (selectedArtwork ? furnitureByArtId[selectedArtwork.id] : undefined)

  function openFurniture(item: Furniture) {
    if (!item.artwork_id) return
    setSelectedFurniture(item)
    setSelectedArtwork(undefined)
  }

  if (loading) {
    return <p className="px-4 py-16 text-center text-stone-500">Loading floor map…</p>
  }
  if (error || !artist) {
    return (
      <p className="px-4 py-16 text-center text-red-600">
        {error ?? 'Artist not found'}
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="font-serif text-xl text-stone-900 sm:text-2xl">
          {artist.name}'s Art Registry
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/manage/art"
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
          >
            Manage art
          </Link>
          <button
            type="button"
            onClick={() => setView((current) => (current === 'map' ? 'list' : 'map'))}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700"
          >
            {view === 'map' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            {view === 'map' ? 'List view' : 'Floor map'}
          </button>
        </div>
      </div>

      <section className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 font-serif text-2xl text-amber-800">
          {artist.name.charAt(0)}
        </div>
        <div>
          <h2 className="font-serif text-2xl text-stone-900">{artist.name}</h2>
          <p className="mt-1 max-w-2xl text-sm text-stone-600">{artist.bio}</p>
        </div>
      </section>

      {view === 'map' && (
        <section className="mt-8 space-y-4">
          {rooms.length > 0 && activeRoom ? (
            <>
              <RoomTabs
                rooms={rooms}
                activeRoomId={activeRoom.id}
                onSelect={setActiveRoomId}
              />
              <RoomCanvas
                room={activeRoom}
                furniture={roomFurniture}
                artworkById={artworkById}
                onSelectFurniture={openFurniture}
              />
            </>
          ) : (
            <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
              No rooms yet. Floor map data will load from the backend soon.
            </p>
          )}
        </section>
      )}

      {view === 'list' && (
        <section className="mt-8">
          <ArtListView
            artwork={artwork}
            furnitureNameByArtId={furnitureNameByArtId}
            onSelect={(item) => {
              setSelectedArtwork(item)
              setSelectedFurniture(undefined)
            }}
          />
        </section>
      )}

      {modalArtwork && (
        <ArtDetailModal
          artwork={modalArtwork}
          furniture={modalFurniture}
          onClose={() => {
            setSelectedArtwork(undefined)
            setSelectedFurniture(undefined)
          }}
        />
      )}
    </div>
  )
}
