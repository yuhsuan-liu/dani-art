import { formatPrice } from '../../lib/utils'
import { isDemoRecord } from '../../data/mockRegistry'
import type { Artwork, Order } from '../../types'
import { DemoBadge, demoRowClass } from '../common/DemoBadge'
import { ArtThumb } from './ArtListView'

const STATUS_COLORS: Record<Artwork['status'], string> = {
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-amber-100 text-amber-800',
  sold: 'bg-stone-100 text-stone-700',
}

type Props = {
  artwork: Artwork[]
  furnitureNameByArtId: Record<string, string>
  pendingOrderByArtId: Record<string, Order>
  actionArtworkId: string | null
  onEdit: (artwork: Artwork) => void
  onDelete: (artwork: Artwork) => void
  onMarkAvailable: (artwork: Artwork) => void
  onCancelOrder: (artwork: Artwork, order: Order) => void
}

export function ArtManagementTable({
  artwork,
  furnitureNameByArtId,
  pendingOrderByArtId,
  actionArtworkId,
  onEdit,
  onDelete,
  onMarkAvailable,
  onCancelOrder,
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
          {artwork.map((item) => {
            const pendingOrder = pendingOrderByArtId[item.id]
            const busy = actionArtworkId === item.id
            const showMarkAvailable = item.status === 'reserved'
            const showCancelOrder =
              item.status === 'reserved' || Boolean(pendingOrder)

            return (
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
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[item.status]}`}
                  >
                    {item.status}
                  </span>
                  {pendingOrder && (
                    <p className="mt-1 text-xs text-amber-700">
                      Pending order · {pendingOrder.customer_name}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-3">
                    {showMarkAvailable && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onMarkAvailable(item)}
                        className="text-amber-800 underline disabled:opacity-50"
                      >
                        {busy ? 'Updating…' : 'Mark available'}
                      </button>
                    )}
                    {showCancelOrder && pendingOrder && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onCancelOrder(item, pendingOrder)}
                        className="text-red-700 underline disabled:opacity-50"
                      >
                        {busy ? 'Cancelling…' : 'Cancel order'}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onEdit(item)}
                      className="text-stone-900 underline disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy || item.status !== 'available'}
                      onClick={() => onDelete(item)}
                      className="text-red-700 underline disabled:opacity-50"
                      title={
                        item.status !== 'available'
                          ? 'Only available artwork can be deleted'
                          : undefined
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
