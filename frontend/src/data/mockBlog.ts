import type { CalendarEvent, UpdatePost } from '../types'

export const MOCK_CALENDAR: CalendarEvent[] = [
  {
    id: 'demo-cal-artfare',
    user_id: 'dani',
    date: '2027-05-06',
    title: 'artfare at...',
    created_at: '2026-08-22T00:00:00.000Z',
    updated_at: '2026-08-22T00:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'demo-cal-release',
    user_id: 'dani',
    date: '2027-05-10',
    title: 'new artwork release',
    created_at: '2026-08-22T00:00:00.000Z',
    updated_at: '2026-08-22T00:00:00.000Z',
    is_demo: true,
  },
]

export const MOCK_UPDATES: UpdatePost[] = [
  {
    id: 'demo-update-studio',
    user_id: 'dani',
    text: 'new piece on the wall today.',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=80',
        kind: 'image',
      },
    ],
    created_at: '2026-08-20T16:00:00.000Z',
    updated_at: '2026-08-20T16:00:00.000Z',
    is_demo: true,
  },
  {
    id: 'demo-update-packing',
    user_id: 'dani',
    text: 'packing for artfare.',
    media: [],
    created_at: '2026-08-18T12:00:00.000Z',
    updated_at: '2026-08-18T12:00:00.000Z',
    is_demo: true,
  },
]
