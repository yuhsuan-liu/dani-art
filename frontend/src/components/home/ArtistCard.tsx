import { Link } from 'react-router-dom'
import type { Artist } from '../../types'

export function ArtistCard({ artist }: { artist: Artist }) {
  const initial = artist.name.charAt(0).toUpperCase()

  return (
    <article className="flex max-w-sm flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        {artist.profile_pic_url ? (
          <img
            src={artist.profile_pic_url}
            alt={`${artist.name} profile`}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 font-serif text-2xl text-amber-800"
            aria-hidden
          >
            {initial}
          </div>
        )}
        <div>
          <h3 className="font-serif text-xl text-stone-900">{artist.name}</h3>
          <p className="text-sm text-stone-500">Featured artist</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-4 flex-1 text-sm leading-relaxed text-stone-600">
        {artist.bio ?? 'Artist on the registry.'}
      </p>
      <Link
        to={`/artists/${artist.id}`}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm text-white hover:bg-stone-800"
      >
        View wishlist
      </Link>
    </article>
  )
}
