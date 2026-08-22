import { printReceiptById } from './printReceipt'

type Props = {
  receiptId: string
  label?: string
  className?: string
}

export function PrintReceiptButton({
  receiptId,
  label = 'Print receipt',
  className = 'btn-b',
}: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 ${className}`}
      onClick={() => printReceiptById(receiptId)}
    >
      <span aria-hidden>🖨</span>
      {label}
    </button>
  )
}
