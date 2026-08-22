import { Link } from 'react-router-dom'
import type { Order, Artwork, Furniture } from '../../types'
import { OrderReceipt } from './OrderReceipt'
import { PrintReceiptButton } from './PrintReceiptButton'
import { PrintReceiptReminder } from './printReceipt'

interface OrderConfirmationProps {
  order: Order
  artwork: Artwork
  furniture: Furniture
}

export function OrderConfirmation({ order, artwork, furniture }: OrderConfirmationProps) {
  const receiptId = `receipt-${order.id}`

  return (
    <div className="py-8 text-center">
      <div className="mb-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h2 className="mb-2 text-2xl font-medium text-stone-900">Order Submitted!</h2>

      <p className="mb-6 text-stone-600">Thank you for supporting Dani! Your order is being processed.</p>

      <PrintReceiptReminder className="mx-auto mb-6 max-w-md text-left" />

      <div className="mx-auto mb-6 max-w-md">
        <OrderReceipt
          order={order}
          artwork={artwork}
          furniture={furniture}
          receiptId={receiptId}
        />
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-3">
        <PrintReceiptButton receiptId={receiptId} className="btn-a" />
        <Link to="/" className="btn-b">
          Back to Home
        </Link>
      </div>

      <div className="mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
        <p className="text-sm text-amber-800">
          <strong>Status:</strong>{' '}
          {order.status === 'pending' ? 'Awaiting payment confirmation' : order.status}
        </p>
        <p className="mt-1 text-xs text-amber-700">
          Dani will confirm your payment and reach out about delivery.
        </p>
      </div>
    </div>
  )
}
