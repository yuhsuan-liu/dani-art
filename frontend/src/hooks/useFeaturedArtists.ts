import { useEffect, useState } from 'react'
import { getFeaturedArtists } from '../lib/artists'
import type { Artist } from '../types'

export function useFeaturedArtists() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getFeaturedArtists()
      .then((data) => {
        if (!cancelled) setArtists(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load artists')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { artists, isLoading, error }
}
