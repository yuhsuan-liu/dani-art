import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { OrderForm, type OrderFormData } from '../components/order/OrderForm'
import { PaymentRedirect } from '../components/order/PaymentRedirect'
import { OrderConfirmation } from '../components/order/OrderConfirmation'
import type { Artwork, Furniture, Order } from '../types'

type OrderStep = 'form' | 'payment' | 'confirmation'

const SHIPPING_FEES = {
  pickup: 0,
  local_delivery: 15,
  shipping: 30,
}

export function OrderPage() {
  const { artworkId } = useParams<{ artworkId: string }>()
  const navigate = useNavigate()
  
  const [step, setStep] = useState<OrderStep>('form')
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [furniture, setFurniture] = useState<Furniture | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'venmo' | 'paypal'>('venmo')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (artworkId) {
      fetchArtworkAndFurniture()
    }
  }, [artworkId])

  async function fetchArtworkAndFurniture() {
    try {
      // Fetch artwork
      const { data: artworkData, error: artworkError } = await supabase
        .from('artwork')
        .select('*')
        .eq('id', artworkId)
        .single()

      if (artworkError) throw artworkError
      if (!artworkData) throw new Error('Artwork not found')
      if (artworkData.status !== 'available') throw new Error('Artwork is no longer available')

      setArtwork(artworkData)

      // Find furniture linked to this artwork
      const { data: furnitureData } = await supabase
        .from('furniture')
        .select('*')
        .eq('artwork_id', artworkId)
        .single()

      setFurniture(furnitureData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artwork')
    } finally {
      setLoading(false)
    }
  }

  async function handleOrderSubmit(formData: OrderFormData) {
    if (!artwork || !furniture) return

    const shippingFee = SHIPPING_FEES[formData.deliveryType]
    const totalAmount = Number(artwork.price) + shippingFee

    const orderData = {
      artwork_id: artwork.id,
      furniture_id: furniture.id,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      customer_phone: formData.customerPhone || null,
      delivery_type: formData.deliveryType,
      shipping_address: formData.deliveryType !== 'pickup' ? formData.shippingAddress : null,
      special_instructions: formData.specialInstructions || null,
      total_amount: totalAmount,
      shipping_fee: shippingFee,
      status: 'pending',
      payment_method: paymentMethod,
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (error) throw error

    // Update artwork status to reserved
    await supabase
      .from('artwork')
      .update({ status: 'reserved' })
      .eq('id', artwork.id)

    // Update furniture status to reserved
    await supabase
      .from('furniture')
      .update({ status: 'reserved' })
      .eq('id', furniture.id)

    setOrder(data)
    setStep('payment')
  }

  function handlePaymentComplete() {
    setStep('confirmation')
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-stone-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-stone-900">Oops!</h1>
        <p className="mt-4 text-stone-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 rounded-lg border border-stone-300 px-4 py-2 text-stone-700 hover:bg-stone-50"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!artwork) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Progress indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {['Details', 'Payment', 'Confirmation'].map((label, i) => {
          const stepIndex = ['form', 'payment', 'confirmation'].indexOf(step)
          const isActive = i <= stepIndex
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isActive ? 'bg-stone-900' : 'bg-stone-300'
                }`}
              />
              <span className={`text-sm ${isActive ? 'text-stone-900' : 'text-stone-400'}`}>
                {label}
              </span>
              {i < 2 && <div className="w-8 h-px bg-stone-300" />}
            </div>
          )
        })}
      </div>

      {/* Artwork preview */}
      {step === 'form' && (
        <div className="mb-8 flex gap-4 rounded-lg border border-stone-200 p-4">
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="h-24 w-24 rounded-lg object-cover"
          />
          <div>
            <h2 className="font-medium text-stone-900">{artwork.title}</h2>
            <p className="text-lg font-semibold text-stone-900">${Number(artwork.price).toFixed(2)}</p>
            {furniture && (
              <p className="text-sm text-stone-500 mt-1">
                Helps Dani get: {furniture.name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Payment method selection */}
      {step === 'form' && (
        <div className="mb-6">
          <h3 className="font-medium text-stone-900 mb-3">Payment Method</h3>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('venmo')}
              className={`flex-1 rounded-lg border p-3 ${
                paymentMethod === 'venmo'
                  ? 'border-stone-900 bg-stone-50'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              Venmo
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('paypal')}
              className={`flex-1 rounded-lg border p-3 ${
                paymentMethod === 'paypal'
                  ? 'border-stone-900 bg-stone-50'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              PayPal
            </button>
          </div>
        </div>
      )}

      {step === 'form' && artwork && furniture && (
        <OrderForm
          artwork={artwork}
          furniture={furniture}
          onSubmit={handleOrderSubmit}
          onCancel={() => navigate(-1)}
        />
      )}

      {step === 'payment' && order && artwork && (
        <PaymentRedirect
          amount={Number(order.total_amount)}
          artworkTitle={artwork.title}
          orderId={order.id}
          paymentMethod={paymentMethod}
          onComplete={handlePaymentComplete}
        />
      )}

      {step === 'confirmation' && order && artwork && furniture && (
        <OrderConfirmation
          order={order}
          artwork={artwork}
          furniture={furniture}
        />
      )}
    </div>
  )
}
