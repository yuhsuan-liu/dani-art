import { isDemoRecord } from '../../data/mockRegistry'

export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-stone-200 text-stone-500 ${className}`}
    >
      Demo
    </span>
  )
}

type BannerProps = {
  hasDemo: boolean
  onClearDemo?: () => void
}

export function DemoDataBanner({ hasDemo, onClearDemo }: BannerProps) {
  if (!hasDemo || !onClearDemo) return null

  return (
    <div className="mb-6 flex justify-end">
      <button
        type="button"
        onClick={onClearDemo}
        className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs text-stone-600 hover:bg-white"
      >
        Remove demo data
      </button>
    </div>
  )
}

export function demoRowClass(item: { is_demo?: boolean; id?: string }): string {
  return isDemoRecord(item) ? 'bg-stone-50/80 opacity-75' : ''
}
