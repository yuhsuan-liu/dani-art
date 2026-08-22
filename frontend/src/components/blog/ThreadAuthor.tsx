import type { ReactNode } from 'react'

type Props = {
  name?: string
  username?: string
  photoUrl?: string
  time?: string
  children?: ReactNode
}

export function ThreadAuthor({
  name = 'Dani',
  username = 'dani',
  photoUrl,
  time,
  children,
}: Props) {
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="thread-head">
      {photoUrl ? (
        <img src={photoUrl} alt="" className="avatar" />
      ) : (
        <div className="avatar flex items-center justify-center bg-amber-100 font-serif text-sm text-amber-800">
          {initial}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="thread-name">{name}</p>
        <p className="thread-meta">
          @{username}
          {time ? ` · ${time}` : ''}
        </p>
        {children}
      </div>
    </div>
  )
}
