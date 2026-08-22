import { Link } from 'react-router-dom'
import { FeaturedArtists } from '../components/home/FeaturedArtists'
import { HeroRoomPreview } from '../components/home/HeroRoomPreview'
import { HowItWorks } from '../components/home/HowItWorks'

export function Home() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <p className="text-xs font-medium tracking-[0.2em] text-amber-700 uppercase">
              An art registry with a floor plan
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
              Support your favorite artist like an art registry
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-stone-600">
              Each furniture drawing on the map is something Dani needs. Buy the
              artwork on that piece, and you help him get it — mattress, couch,
              lamp, and the rest of the room.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/artists/dani"
                className="inline-flex w-full items-center justify-center rounded-lg bg-stone-900 px-6 py-3 text-white hover:bg-stone-800 sm:w-auto"
              >
                Get Started
              </Link>
              <Link
                to="/blog"
                className="inline-flex w-full items-center justify-center rounded-lg border border-stone-300 px-6 py-3 text-stone-700 hover:bg-stone-50 sm:w-auto"
              >
                Read the blog
              </Link>
            </div>
          </div>
          <HeroRoomPreview />
        </div>
      </section>

      <HowItWorks />
      <FeaturedArtists />
    </>
  )
}
