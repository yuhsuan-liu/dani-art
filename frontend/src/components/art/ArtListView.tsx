import { formatPrice } from '../../lib/utils'
import type { Artwork } from '../../types'

type Props = {
  artwork: Artwork[]
  furnitureNameByArtId: Record<string, string>
  onSelect: (artwork: Artwork) => void
}

export function ArtListView({ artwork, furnitureNameByArtId, onSelect }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
          <tr>
            <th className="px-4 py-3 font-medium">Artwork</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Supports</th>
          </tr>
        </thead>
        <tbody>
          {artwork.map((item) => (
            <tr
              key={item.id}
              className="cursor-pointer border-b border-stone-100 last:border-0 hover:bg-stone-50"
              onClick={() => onSelect(item)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <ArtThumb artwork={item} />
                  <span className="font-medium text-stone-900">{item.title}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-stone-600">{formatPrice(item.price)}</td>
              <td className="px-4 py-3 capitalize text-stone-600">{item.status}</td>
              <td className="px-4 py-3 text-stone-600">
                {furnitureNameByArtId[item.id] ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ArtThumb({ artwork }: { artwork: Artwork }) {
  if (artwork.image_url) {
    return (
      <img
        src={artwork.image_url}
        alt=""
        className="h-10 w-10 rounded object-cover"
      />
    )
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded bg-amber-100 text-xs text-amber-800">
      {artwork.title.charAt(0)}
    </div>
  )
}
