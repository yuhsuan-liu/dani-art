import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FeaturedWork, HeroArtGrid } from '../components/home/FeaturedWork'
import { HowItWorks } from '../components/home/HowItWorks'
import { getArtworkByArtist } from '../lib/artwork'
import type { Artwork } from '../types'

export function Home() {
  const [artwork, setArtwork] = useState<Artwork[]>([])

  useEffect(() => {
    getArtworkByArtist('dani').then(setArtwork).catch(() => setArtwork([]))
  }, [])

  const portrait = artwork.find((item) => item.image_url)

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <p className="text-xs font-medium tracking-[0.2em] text-amber-700 uppercase">
              Artwork first, then the floor plan
            </p>
            <h1 className="mt-4 font-serif text-3xl leading-snug text-stone-900 sm:text-4xl sm:leading-tight lg:text-5xl">
              Dani's paintings, on a floor map
            </h1>
            <p className="mt-5 text-base leading-relaxed text-stone-600 sm:text-lg">
              Buy a piece of original art. Each painting is tied to furniture
              Dani needs — mattress, couch, drums — so you can see exactly
              what your support gets him.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link to="/artists/dani" className="btn-a w-full sm:w-auto">
                View the work
              </Link>
              <Link to="/blog" className="btn-b w-full sm:w-auto">
                Notes
              </Link>
            </div>
          </div>
          <HeroArtGrid artwork={artwork} />
        </div>
      </section>

      <FeaturedWork artwork={artwork} />

      <HowItWorks />

      <section className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl text-stone-900">Meet Dani</h2>
            <p className="mt-2 text-sm font-medium text-stone-500">
              Artist & jazz drummer · Monterey
            </p>
            <p className="mt-4 leading-relaxed text-stone-600">
              Dani paints and plays jazz in Monterey. This site is his
              registry: you take home a painting, and he gets the furniture
              on the map. Not a typical gallery — the room is the wishlist.
            </p>
            <Link to="/artists/dani" className="btn-b mt-6">
              Browse the registry →
            </Link>
          </div>
          <img
            src={portrait?.image_url || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"}
            alt={portrait?.title || "Cozy furniture"}
            className="mx-auto w-full max-w-md rounded-3xl object-cover aspect-[4/3]"
          />
        </div>
      </section>
    </>
  )
}
