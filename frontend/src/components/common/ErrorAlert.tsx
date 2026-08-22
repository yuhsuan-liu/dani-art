type Props = {
  message: string
  onRetry?: () => void
}

export function ErrorAlert({ message, onRetry }: Props) {
  return (
    <div
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      role="alert"
    >
      <p>{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="btn-c mt-3">
          Try again
        </button>
      ) : null}
    </div>
  )
}
