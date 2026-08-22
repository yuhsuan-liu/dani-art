import { Link } from 'react-router-dom'
import { formatPrice } from '../../lib/utils'
import type { Artwork } from '../../types'

export function HeroArtGrid({ artwork }: { artwork: Artwork[] }) {
  const pieces = artwork.filter((item) => item.image_url).slice(0, 4)

  if (pieces.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-stone-100 text-stone-400">
        Artwork coming soon
      </div>
    )
  }

  return (
    <Link
      to="/artists/dani"
      className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-3xl"
      aria-label="Dani's artwork"
    >
      {pieces.map((item) => (
        <img
          key={item.id}
          src={item.image_url}
          alt={item.title}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ))}
    </Link>
  )
}

export function FeaturedWork({ artwork }: { artwork: Artwork[] }) {
  const pieces = artwork.filter((item) => item.image_url)

  if (pieces.length === 0) return null

  return (
    <section className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-amber-700 uppercase">
              The work
            </p>
            <h2 className="mt-2 font-serif text-3xl text-stone-900">
              Dani's artwork
            </h2>
          </div>
          <Link to="/artists/dani" className="btn-c">
            See the registry →
          </Link>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pieces.map((item) => (
            <li key={item.id}>
              <Link
                to="/artists/dani"
                className="group block overflow-hidden rounded-3xl bg-stone-100"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                />
                <div className="px-4 py-3">
                  <p className="font-medium text-stone-900">{item.title}</p>
                  <p className="mt-0.5 text-sm text-stone-500">
                    {formatPrice(item.price)}
                    {item.medium ? ` · ${item.medium}` : ''}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
