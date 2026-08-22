type Props = {
  label?: string
  className?: string
}

export function LoadingSpinner({ label = 'Loading…', className = '' }: Props) {
  return (
    <div
      className={`flex min-h-[40vh] flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-800" />
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  )
}
