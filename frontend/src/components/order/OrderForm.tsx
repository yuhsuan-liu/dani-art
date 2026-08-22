import { useState } from 'react'
import type { Artwork, Furniture } from '../../types'

interface OrderFormProps {
  artwork: Artwork
  furniture: Furniture
  onSubmit: (orderData: OrderFormData) => Promise<void>
  onCancel: () => void
}

export interface OrderFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryType: 'pickup' | 'local_delivery' | 'shipping'
  shippingAddress?: {
    street: string
    city: string
    state: string
    zip: string
  }
  specialInstructions: string
}

const SHIPPING_FEES = {
  pickup: 0,
  local_delivery: 15,
  shipping: 30,
}

export function OrderForm({ artwork, furniture, onSubmit, onCancel }: OrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryType: 'pickup',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zip: '',
    },
    specialInstructions: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shippingFee = SHIPPING_FEES[formData.deliveryType]
  const totalAmount = Number(artwork.price) + shippingFee

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit order')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-medium text-stone-900">Contact Information</h3>
        <div className="mt-3 space-y-3">
          <input
            type="text"
            placeholder="Full Name *"
            required
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email *"
            required
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none"
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={formData.customerPhone}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <h3 className="font-medium text-stone-900">Delivery Method</h3>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-3 rounded-lg border border-stone-200 p-3 cursor-pointer hover:bg-stone-50">
            <input
              type="radio"
              name="delivery"
              value="pickup"
              checked={formData.deliveryType === 'pickup'}
              onChange={() => setFormData({ ...formData, deliveryType: 'pickup' })}
              className="text-stone-900"
            />
            <div className="flex-1">
              <span className="font-medium">Pickup in Monterey</span>
              <span className="ml-2 text-green-600">Free</span>
            </div>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-stone-200 p-3 cursor-pointer hover:bg-stone-50">
            <input
              type="radio"
              name="delivery"
              value="local_delivery"
              checked={formData.deliveryType === 'local_delivery'}
              onChange={() => setFormData({ ...formData, deliveryType: 'local_delivery' })}
              className="text-stone-900"
            />
            <div className="flex-1">
              <span className="font-medium">Local Delivery</span>
              <span className="text-stone-500 text-sm"> (within 30 min of Monterey)</span>
              <span className="ml-2 text-stone-600">$15</span>
            </div>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-stone-200 p-3 cursor-pointer hover:bg-stone-50">
            <input
              type="radio"
              name="delivery"
              value="shipping"
              checked={formData.deliveryType === 'shipping'}
              onChange={() => setFormData({ ...formData, deliveryType: 'shipping' })}
              className="text-stone-900"
            />
            <div className="flex-1">
              <span className="font-medium">Shipping</span>
              <span className="ml-2 text-stone-600">$30</span>
            </div>
          </label>
        </div>
      </div>

      {formData.deliveryType !== 'pickup' && (
        <div>
          <h3 className="font-medium text-stone-900">Shipping Address</h3>
          <div className="mt-3 space-y-3">
            <input
              type="text"
              placeholder="Street Address *"
              required
              value={formData.shippingAddress?.street || ''}
              onChange={(e) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress!, street: e.target.value }
              })}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City *"
                required
                value={formData.shippingAddress?.city || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  shippingAddress: { ...formData.shippingAddress!, city: e.target.value }
                })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="State *"
                required
                value={formData.shippingAddress?.state || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  shippingAddress: { ...formData.shippingAddress!, state: e.target.value }
                })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="ZIP Code *"
              required
              value={formData.shippingAddress?.zip || ''}
              onChange={(e) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress!, zip: e.target.value }
              })}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      <div>
        <h3 className="font-medium text-stone-900">Special Instructions (optional)</h3>
        <textarea
          placeholder="Any special requests or notes..."
          value={formData.specialInstructions}
          onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
          rows={3}
          className="mt-3 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none"
        />
      </div>

      {/* Order Summary */}
      <div className="rounded-lg bg-stone-50 p-4">
        <h3 className="font-medium text-stone-900">Order Summary</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600">Artwork: {artwork.title}</span>
            <span>${Number(artwork.price).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600">Shipping</span>
            <span>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
          </div>
          <div className="border-t border-stone-200 pt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Helps Dani get: <strong>{furniture.name}</strong>
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-stone-300 px-4 py-3 text-stone-700 hover:bg-stone-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-lg bg-stone-900 px-4 py-3 text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {submitting ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </form>
  )
}
