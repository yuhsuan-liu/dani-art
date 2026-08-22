import { formatPrice } from '../../lib/utils'
import { isDemoRecord } from '../../data/mockRegistry'
import type { Artwork } from '../../types'
import { DemoBadge, demoRowClass } from '../common/DemoBadge'
import { ArtThumb } from './ArtListView'

type Props = {
  artwork: Artwork[]
  furnitureNameByArtId: Record<string, string>
  onEdit: (artwork: Artwork) => void
  onDelete: (artwork: Artwork) => void
}

export function ArtManagementTable({
  artwork,
  furnitureNameByArtId,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
          <tr>
            <th className="px-4 py-3 font-medium">Thumbnail</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Linked Furniture</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {artwork.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                No artwork yet. Upload a piece to get started.
              </td>
            </tr>
          )}
          {artwork.map((item) => (
            <tr
              key={item.id}
              className={`border-b border-stone-100 last:border-0 ${demoRowClass(item)}`}
            >
              <td className="px-4 py-3">
                <ArtThumb artwork={item} />
              </td>
              <td className="px-4 py-3 font-medium text-stone-900">
                {item.title}
                {isDemoRecord(item) && <DemoBadge className="ml-2 align-middle" />}
              </td>
              <td className="px-4 py-3 text-stone-600">{formatPrice(item.price)}</td>
              <td className="px-4 py-3 text-stone-600">
                {furnitureNameByArtId[item.id] ?? (
                  <span className="text-amber-700">Unlinked</span>
                )}
              </td>
              <td className="px-4 py-3 capitalize text-stone-600">{item.status}</td>
              <td className="px-4 py-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="text-stone-900 underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="text-red-700 underline"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
