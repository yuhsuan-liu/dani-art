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
  if (!hasDemo) return null

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-stone-300 bg-stone-100/80 px-4 py-3 text-sm text-stone-600">
      <p>
        Grey items marked <DemoBadge className="align-middle" /> are sample data for
        layout testing. Anything Dani adds is saved as real (no demo flag) and
        will not collide with these <code className="text-xs">demo-*</code> IDs.
      </p>
      {onClearDemo && (
        <button
          type="button"
          onClick={onClearDemo}
          className="shrink-0 rounded-lg border border-stone-400 px-3 py-1.5 text-xs text-stone-700 hover:bg-white"
        >
          Remove all demo data
        </button>
      )}
    </div>
  )
}

export function demoRowClass(item: { is_demo?: boolean; id?: string }): string {
  return isDemoRecord(item) ? 'bg-stone-50/80 opacity-75' : ''
}
