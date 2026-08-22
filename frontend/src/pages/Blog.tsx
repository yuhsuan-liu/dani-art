import { useEffect, useState } from 'react'
import { CalendarSection } from '../components/blog/CalendarSection'
import { UpdateFeed, type FeedAuthor } from '../components/blog/UpdateFeed'
import { useAuth } from '../contexts/AuthContext'
import { getArtist } from '../lib/artists'
import {
  createCalendarEvent,
  createUpdate,
  deleteCalendarEvent,
  deleteUpdate,
  getCalendarEvents,
  getUpdates,
} from '../lib/blog'
import { uploadMedia } from '../lib/storage'
import type { CalendarEvent, UpdatePost } from '../types'

const DEFAULT_AUTHOR: FeedAuthor = {
  name: 'Dani',
  username: 'dani',
}

export function Blog() {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [posts, setPosts] = useState<UpdatePost[]>([])
  const [author, setAuthor] = useState(DEFAULT_AUTHOR)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canEdit = true
  const artistId = user?.id ?? 'dani'

  async function refresh() {
    const [nextEvents, nextPosts, artist] = await Promise.all([
      getCalendarEvents(),
      getUpdates(),
      getArtist('dani'),
    ])
    setEvents(nextEvents)
    setPosts(nextPosts)
    if (artist) {
      const handle = artist.name.trim().split(/\s+/)[0]?.toLowerCase() || 'dani'
      setAuthor({
        name: artist.name,
        username: handle,
        photoUrl: artist.profile_pic_url,
      })
    }
  }

  useEffect(() => {
    refresh()
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not load updates')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="frame p-8 text-stone-400">Loading…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="frame p-8 text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="frame">
        <div className="space-y-3">
          <CalendarSection
            events={events}
            canEdit={canEdit}
            onAdd={async ({ date, title }) => {
              await createCalendarEvent({ user_id: artistId, date, title })
              await refresh()
            }}
            onDelete={async (event) => {
              await deleteCalendarEvent(event.id)
              await refresh()
            }}
          />

          <UpdateFeed
            posts={posts}
            canEdit={canEdit}
            author={author}
            onCreate={async ({ text, files }) => {
              const media = await Promise.all(
                files.map(async (file) => {
                  const uploaded = await uploadMedia('blog', file, artistId)
                  return { url: uploaded.url, kind: uploaded.kind }
                }),
              )
              await createUpdate({ user_id: artistId, text, media })
              await refresh()
            }}
            onDelete={async (post) => {
              await deleteUpdate(post.id)
              await refresh()
            }}
          />
        </div>
      </div>
    </div>
  )
}
