import type { Artist } from '../types'

/** Placeholder data until GET /artists is live. */
export const MOCK_FEATURED_ARTISTS: Artist[] = [
  {
    id: 'dani',
    email: 'dani@example.com',
    name: 'Dani',
    bio: 'Painter and drummer in Monterey. Buy a piece and help furnish the studio — mattress, couch, and all.',
    profile_pic_url: undefined,
    created_at: '2026-08-01T00:00:00.000Z',
  },
]
