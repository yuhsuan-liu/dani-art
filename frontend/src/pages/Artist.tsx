import { Link, useParams } from 'react-router-dom'

/** Artist profile + floor map will live here. */
export function Artist() {
  const { artistId } = useParams()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="text-sm text-stone-500">Artist profile</p>
      <h1 className="mt-2 font-serif text-3xl text-stone-900">
        {artistId ?? 'Artist'}
      </h1>
      <p className="mt-4 text-stone-600">
        Floor map, wishlist, and list view are coming next. This route is ready
        for <code className="text-sm">GET /artists/{'{id}'}</code> and room data.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
      >
        Back home
      </Link>
    </div>
  )
}
