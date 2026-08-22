import { isDemoRecord } from '../data/mockRegistry'
import { MOCK_CALENDAR, MOCK_UPDATES } from '../data/mockBlog'
import { newId, wait } from './utils'
import type { CalendarEvent, MediaItem, UpdatePost } from '../types'

let calendarStore: CalendarEvent[] = MOCK_CALENDAR.map((item) => ({ ...item }))
let updateStore: UpdatePost[] = MOCK_UPDATES.map((item) => ({
  ...item,
  media: item.media.map((media) => ({ ...media })),
}))

/**
 * Notes feed (in-memory for now).
 * Public posts will load from the backend later: GET /api/blog (calendar + updates).
 */

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  await wait()
  return calendarStore
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at))
    .map((item) => ({ ...item }))
}

export async function createCalendarEvent(input: {
  user_id: string
  date: string
  title: string
}): Promise<CalendarEvent> {
  await wait()
  const now = new Date().toISOString()
  const created: CalendarEvent = {
    id: newId('cal'),
    user_id: input.user_id,
    date: input.date,
    title: input.title.trim(),
    created_at: now,
    updated_at: now,
    is_demo: false,
  }
  calendarStore = [...calendarStore, created]
  return { ...created }
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await wait()
  calendarStore = calendarStore.filter((item) => item.id !== id)
}

export async function updateCalendarEvent(
  id: string,
  patch: { date?: string; title?: string },
): Promise<CalendarEvent> {
  await wait()
  const index = calendarStore.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Event not found')
  const updated: CalendarEvent = {
    ...calendarStore[index],
    ...patch,
    title: patch.title?.trim() ?? calendarStore[index].title,
    updated_at: new Date().toISOString(),
  }
  calendarStore = calendarStore.map((item) => (item.id === id ? updated : item))
  return { ...updated }
}

export async function getUpdates(): Promise<UpdatePost[]> {
  await wait()
  return updateStore
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((item) => ({
      ...item,
      media: item.media.map((media) => ({ ...media })),
    }))
}

export async function createUpdate(input: {
  user_id: string
  text: string
  media: MediaItem[]
}): Promise<UpdatePost> {
  await wait()
  const now = new Date().toISOString()
  const created: UpdatePost = {
    id: newId('update'),
    user_id: input.user_id,
    text: input.text.trim(),
    media: input.media.map((media) => ({ ...media })),
    created_at: now,
    updated_at: now,
    is_demo: false,
  }
  updateStore = [created, ...updateStore]
  return {
    ...created,
    media: created.media.map((media) => ({ ...media })),
  }
}

export async function deleteUpdate(id: string): Promise<void> {
  await wait()
  updateStore = updateStore.filter((item) => item.id !== id)
}

export async function updateUpdate(
  id: string,
  patch: { text?: string; media?: MediaItem[] },
): Promise<UpdatePost> {
  await wait()
  const index = updateStore.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Post not found')
  const updated: UpdatePost = {
    ...updateStore[index],
    text: patch.text?.trim() ?? updateStore[index].text,
    media: patch.media ?? updateStore[index].media,
    updated_at: new Date().toISOString(),
  }
  updateStore = updateStore.map((item) => (item.id === id ? updated : item))
  return {
    ...updated,
    media: updated.media.map((media) => ({ ...media })),
  }
}

export async function clearDemoBlog(): Promise<void> {
  await wait()
  calendarStore = calendarStore.filter((item) => !isDemoRecord(item))
  updateStore = updateStore.filter((item) => !isDemoRecord(item))
}
