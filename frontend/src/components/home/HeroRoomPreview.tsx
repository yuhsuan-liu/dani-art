type FurniturePreview = {
  name: string
  price: string
  status: 'available' | 'purchased' | 'reserved'
  className: string
}

const pieces: FurniturePreview[] = [
  { name: 'Bed', price: '$800', status: 'available', className: 'left-[8%] top-[18%] w-[34%]' },
  { name: 'Couch', price: '$400', status: 'purchased', className: 'right-[8%] top-[22%] w-[42%]' },
  { name: 'Lamp', price: '$50', status: 'reserved', className: 'left-[38%] bottom-[12%] w-[22%]' },
]

const statusStyles: Record<FurniturePreview['status'], string> = {
  available: 'bg-white/95 text-stone-700',
  purchased: 'bg-white/95 text-stone-700',
  reserved: 'bg-white/95 text-stone-700',
}

export function HeroRoomPreview() {
  return (
    <div
      className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-stone-200 bg-[#f3efe6] shadow-sm"
      aria-label="Preview of a room floor map with furniture"
    >
      <div className="absolute inset-3 rounded-xl border border-dashed border-stone-300/80 bg-[linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />

      {pieces.map((piece) => (
        <div
          key={piece.name}
          className={`absolute flex flex-col items-center gap-1 ${piece.className}`}
        >
          <div className={piece.status === 'purchased' ? 'art-frame w-full' : 'w-full'}>
            <FurnitureIcon name={piece.name} />
          </div>
          <div className={`furn-tag ${statusStyles[piece.status]}`}>
            {piece.name} {piece.status === 'purchased' ? 'Sold' : piece.status === 'reserved' ? 'Hold' : piece.price}
          </div>
        </div>
      ))}
    </div>
  )
}

function FurnitureIcon({ name }: { name: string }) {
  const fill = '#c4a574'

  if (name === 'Bed') {
    return (
      <svg viewBox="0 0 120 70" className="w-full drop-shadow-sm" aria-hidden>
        <rect x="8" y="18" width="104" height="44" rx="8" fill={fill} opacity="0.85" />
        <rect x="14" y="8" width="28" height="22" rx="8" fill={fill} />
        <rect x="18" y="28" width="84" height="24" rx="6" fill="#fafaf9" opacity="0.7" />
      </svg>
    )
  }

  if (name === 'Couch') {
    return (
      <svg viewBox="0 0 140 70" className="w-full drop-shadow-sm" aria-hidden>
        <rect x="6" y="22" width="128" height="36" rx="12" fill={fill} />
        <rect x="18" y="10" width="48" height="28" rx="10" fill={fill} opacity="0.9" />
        <rect x="74" y="10" width="48" height="28" rx="10" fill={fill} opacity="0.9" />
        <rect x="16" y="38" width="108" height="14" rx="6" fill="#fafaf9" opacity="0.45" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 60 80" className="w-full drop-shadow-sm" aria-hidden>
      <circle cx="30" cy="18" r="14" fill={fill} />
      <rect x="28" y="30" width="4" height="36" fill={fill} />
      <ellipse cx="30" cy="70" rx="16" ry="5" fill={fill} opacity="0.5" />
    </svg>
  )
}
