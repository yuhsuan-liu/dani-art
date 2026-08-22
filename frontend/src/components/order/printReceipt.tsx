type Props = {
  forArtist?: boolean
  className?: string
}

export function PrintReceiptReminder({ forArtist = false, className = '' }: Props) {
  return (
    <div
      className={`rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 ${className}`}
      role="note"
    >
      <p className="font-medium">Please print this receipt</p>
      <p className="mt-1 text-amber-900/90">
        {forArtist
          ? 'Print a copy for your records when you confirm payment or prepare delivery.'
          : 'Print this page for your records. Bring it if you pick up in person.'}
      </p>
    </div>
  )
}

export function printReceiptById(receiptId: string) {
  const node = document.getElementById(receiptId)
  if (!node) return

  document.body.classList.add('printing-receipt')
  node.classList.add('order-receipt-print-target')

  window.print()

  window.setTimeout(() => {
    document.body.classList.remove('printing-receipt')
    node.classList.remove('order-receipt-print-target')
  }, 500)
}
