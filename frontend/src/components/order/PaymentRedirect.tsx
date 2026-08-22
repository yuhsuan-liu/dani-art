import { useEffect, useState } from 'react'

interface PaymentRedirectProps {
  amount: number
  artworkTitle: string
  orderId: string
  paymentMethod: 'venmo' | 'paypal'
  recipientVenmo?: string
  recipientPaypal?: string
  onComplete: () => void
}

export function PaymentRedirect({
  amount,
  artworkTitle,
  orderId,
  paymentMethod,
  recipientVenmo = 'DaniArtist',
  recipientPaypal = 'dani@example.com',
  onComplete,
}: PaymentRedirectProps) {
  const [countdown, setCountdown] = useState(5)

  const note = `Art: ${artworkTitle} (Order: ${orderId.slice(0, 8)})`

  const venmoUrl = `https://venmo.com/${recipientVenmo}?txn=pay&amount=${amount}&note=${encodeURIComponent(note)}`
  const paypalUrl = `https://paypal.me/${recipientPaypal}/${amount}`

  const paymentUrl = paymentMethod === 'venmo' ? venmoUrl : paypalUrl

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          window.open(paymentUrl, '_blank')
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentUrl])

  return (
    <div className="text-center py-8">
      <div className="mb-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
          {paymentMethod === 'venmo' ? (
            <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-3.75 5.25c.15.45.225.9.225 1.35 0 2.85-2.4 6.45-4.35 9H7.5l-1.5-9 3-.3.75 5.85c.9-1.5 2.025-3.9 2.025-5.55 0-.45-.075-.75-.15-1.05l3.15-.3z"/>
            </svg>
          ) : (
            <svg className="h-8 w-8 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 3.72a.78.78 0 01.771-.657h6.035c2.398 0 4.203.665 5.368 1.977 1.165 1.311 1.562 3.087 1.181 5.279-.508 2.915-1.967 5.072-4.342 6.41-1.578.89-3.374 1.336-5.34 1.336H6.483l-1.16 5.94a.641.641 0 01-.633.74h-.614v-3.408zm12.01-14.11c.124-.719.186-1.377.186-1.973 0-1.573-.562-2.813-1.67-3.686C16.393.684 14.832.24 12.822.24H5.715a1.92 1.92 0 00-1.895 1.62L.714 19.854a.96.96 0 00.948 1.11h4.607l1.16-5.94a.96.96 0 01.948-.81h2.134c3.963 0 7.105-1.621 8.575-5.987z"/>
            </svg>
          )}
        </div>
      </div>

      <h2 className="text-xl font-medium text-stone-900 mb-2">
        Redirecting to {paymentMethod === 'venmo' ? 'Venmo' : 'PayPal'}
      </h2>
      
      <p className="text-stone-600 mb-4">
        You'll be redirected in <strong>{countdown}</strong> seconds...
      </p>

      <div className="bg-stone-50 rounded-lg p-4 mb-6 text-left">
        <p className="text-sm text-stone-600">
          <strong>Amount:</strong> ${amount.toFixed(2)}
        </p>
        <p className="text-sm text-stone-600 mt-1">
          <strong>For:</strong> {artworkTitle}
        </p>
        <p className="text-sm text-stone-500 mt-2">
          After payment, return to this page to see your confirmation.
        </p>
      </div>

      <div className="flex gap-3 justify-center">
        <a
          href={paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-stone-900 px-6 py-3 text-white hover:bg-stone-800"
        >
          Open {paymentMethod === 'venmo' ? 'Venmo' : 'PayPal'} Now
        </a>
        <button
          onClick={onComplete}
          className="rounded-lg border border-stone-300 px-6 py-3 text-stone-700 hover:bg-stone-50"
        >
          I've Paid
        </button>
      </div>
    </div>
  )
}
