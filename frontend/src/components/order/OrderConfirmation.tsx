import { Link } from 'react-router-dom'
import type { Order, Artwork, Furniture } from '../../types'

interface OrderConfirmationProps {
  order: Order
  artwork: Artwork
  furniture: Furniture
}

export function OrderConfirmation({ order, artwork, furniture }: OrderConfirmationProps) {
  return (
    <div className="text-center py-8">
      <div className="mb-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-medium text-stone-900 mb-2">
        Order Submitted!
      </h2>
      
      <p className="text-stone-600 mb-6">
        Thank you for supporting Dani! Your order is being processed.
      </p>

      <div className="bg-stone-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
        <h3 className="font-medium text-stone-900 mb-3">Order Details</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Order ID</span>
            <span className="font-mono">{order.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Artwork</span>
            <span>{artwork.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Helps Dani Get</span>
            <span>{furniture.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Delivery</span>
            <span className="capitalize">{order.delivery_type.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-2 mt-2">
            <span className="font-medium">Total</span>
            <span className="font-medium">${Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
        <p className="text-amber-800 text-sm">
          <strong>Status:</strong> {order.status === 'pending' ? 'Awaiting Payment Confirmation' : order.status}
        </p>
        <p className="text-amber-700 text-xs mt-1">
          Dani will confirm your payment and reach out about delivery.
        </p>
      </div>

      <div className="flex gap-3 justify-center">
        <Link
          to="/"
          className="rounded-lg border border-stone-300 px-6 py-3 text-stone-700 hover:bg-stone-50"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
