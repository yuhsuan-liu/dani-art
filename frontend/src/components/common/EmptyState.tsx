import type { ReactNode } from 'react'

type Props = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-6 py-12 text-center">
      <h3 className="font-serif text-lg text-stone-900">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
