import { useFeaturedArtists } from '../../hooks/useFeaturedArtists'
import { ArtistCard } from './ArtistCard'

export function FeaturedArtists() {
  const { artists, isLoading, error } = useFeaturedArtists()

  return (
    <section id="featured-artists" className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-serif text-2xl text-stone-900 sm:text-3xl">
          Featured Artists
        </h2>
        <p className="mt-2 text-stone-600">
          Start with Dani. More artists can join later.
        </p>

        {isLoading && (
          <p className="mt-8 text-sm text-stone-500">Loading artists…</p>
        )}
        {error && (
          <p className="mt-8 text-sm text-red-600">{error}</p>
        )}
        {!isLoading && !error && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
