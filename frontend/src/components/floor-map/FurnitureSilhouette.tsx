import type { Furniture } from '../../types'

const fills: Record<Furniture['status'], string> = {
  available: '#c4a574',
  reserved: '#c4a574',
  purchased: '#c4a574',
}

export function FurnitureSilhouette({
  name,
  status,
}: {
  name: string
  status: Furniture['status']
}) {
  const fill = fills[status]
  const key = name.toLowerCase()

  if (key.includes('bed')) {
    return (
      <svg viewBox="0 0 120 70" className="h-full w-full" aria-hidden>
        <rect x="8" y="18" width="104" height="44" rx="8" fill={fill} opacity="0.9" />
        <rect x="14" y="8" width="28" height="22" rx="8" fill={fill} />
        <rect x="18" y="28" width="84" height="24" rx="6" fill="#fafaf9" opacity="0.65" />
      </svg>
    )
  }

  if (key.includes('couch')) {
    return (
      <svg viewBox="0 0 140 70" className="h-full w-full" aria-hidden>
        <rect x="6" y="22" width="128" height="36" rx="12" fill={fill} />
        <rect x="18" y="10" width="48" height="28" rx="10" fill={fill} opacity="0.9" />
        <rect x="74" y="10" width="48" height="28" rx="10" fill={fill} opacity="0.9" />
      </svg>
    )
  }

  if (key.includes('lamp')) {
    return (
      <svg viewBox="0 0 60 80" className="h-full w-full" aria-hidden>
        <circle cx="30" cy="18" r="14" fill={fill} />
        <rect x="28" y="30" width="4" height="36" fill={fill} />
        <ellipse cx="30" cy="70" rx="16" ry="5" fill={fill} opacity="0.5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" aria-hidden>
      <ellipse cx="36" cy="52" rx="18" ry="18" fill={fill} />
      <ellipse cx="84" cy="52" rx="18" ry="18" fill={fill} />
      <ellipse cx="60" cy="28" rx="16" ry="16" fill={fill} opacity="0.9" />
      <rect x="56" y="48" width="8" height="30" fill={fill} />
    </svg>
  )
}
