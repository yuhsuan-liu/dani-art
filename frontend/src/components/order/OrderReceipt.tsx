import { formatDate, formatPrice } from '../../lib/utils'
import type { Artwork, Furniture, Order } from '../../types'

type Props = {
  order: Order
  artwork: Artwork
  furniture: Furniture
  receiptId?: string
}

export function OrderReceipt({ order, artwork, furniture, receiptId }: Props) {
  const id = receiptId ?? `receipt-${order.id}`

  return (
    <div id={id} className="order-receipt rounded-lg border border-stone-200 bg-white p-6 text-left text-stone-900">
      <div className="border-b border-stone-200 pb-4">
        <p className="text-xs font-medium tracking-[0.2em] text-stone-500 uppercase">
          Dani&apos;s Art Registry
        </p>
        <h2 className="mt-1 font-serif text-2xl">Order Receipt</h2>
        <p className="mt-1 text-sm text-stone-500">{formatDate(order.created_at)}</p>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Order ID" value={order.id} mono />
        <Row label="Status" value={order.status.replace('_', ' ')} capitalize />
        <Row label="Customer" value={order.customer_name} />
        <Row label="Email" value={order.customer_email} />
        {order.customer_phone ? <Row label="Phone" value={order.customer_phone} /> : null}
        <Row label="Artwork" value={artwork.title} />
        <Row label="Helps Dani get" value={furniture.name} />
        <Row label="Delivery" value={order.delivery_type.replace('_', ' ')} capitalize />
        {order.delivery_type !== 'pickup' && order.shipping_address ? (
          <Row
            label="Ship to"
            value={`${order.shipping_address.street}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip}`}
          />
        ) : null}
        {order.payment_method ? (
          <Row label="Payment" value={order.payment_method} capitalize />
        ) : null}
        {order.payment_reference ? (
          <Row label="Payment ref" value={order.payment_reference} mono />
        ) : null}
        <Row label="Art price" value={formatPrice(Number(artwork.price))} />
        <Row label="Shipping / delivery" value={formatPrice(Number(order.shipping_fee))} />
        <Row label="Total paid" value={formatPrice(Number(order.total_amount))} strong />
      </dl>

      {order.special_instructions ? (
        <div className="mt-4 rounded-lg bg-stone-50 p-3 text-sm">
          <p className="font-medium text-stone-700">Special instructions</p>
          <p className="mt-1 text-stone-600">{order.special_instructions}</p>
        </div>
      ) : null}

      <p className="mt-6 border-t border-stone-200 pt-4 text-xs text-stone-500">
        Thank you for supporting Dani. Keep this receipt for your records. Dani will confirm
        payment and contact you about delivery or pickup.
      </p>
    </div>
  )
}

function Row({
  label,
  value,
  mono,
  capitalize: cap,
  strong,
}: {
  label: string
  value: string
  mono?: boolean
  capitalize?: boolean
  strong?: boolean
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-stone-500">{label}</dt>
      <dd
        className={`text-right ${mono ? 'font-mono text-xs' : ''} ${cap ? 'capitalize' : ''} ${
          strong ? 'font-semibold text-stone-900' : 'text-stone-800'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}
