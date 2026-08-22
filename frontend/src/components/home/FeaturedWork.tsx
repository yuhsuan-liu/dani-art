import { Link } from 'react-router-dom'
import { formatPrice } from '../../lib/utils'
import type { Artwork } from '../../types'

const PREVIEW_COUNT = 4

export function FeaturedWork({ artwork }: { artwork: Artwork[] }) {
  const pieces = artwork.filter((item) => item.image_url)
  const preview = pieces.slice(0, PREVIEW_COUNT)

  if (preview.length === 0) return null

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
          <Link to="/artists/dani#registry" className="btn-c text-sm">
            View registry →
          </Link>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {preview.map((item) => (
            <li key={item.id}>
              <Link
                to="/artists/dani#gallery"
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

        {pieces.length > PREVIEW_COUNT && (
          <div className="mt-8 text-center">
            <Link to="/artists/dani#gallery" className="btn-b">
              View more artwork →
            </Link>
          </div>
        )}
        {pieces.length <= PREVIEW_COUNT && pieces.length > 0 && (
          <div className="mt-8 text-center">
            <Link to="/artists/dani#gallery" className="btn-b">
              View full gallery →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
