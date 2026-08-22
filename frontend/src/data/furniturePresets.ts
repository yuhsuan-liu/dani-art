/**
 * License-free furniture stand-ins (Unsplash License: https://unsplash.com/license).
 * Dani can pick one as a placeholder icon until he uploads his own hand-drawn PNG.
 */

export type FurniturePreset = {
  id: string
  label: string
  /** Suggested default name when selecting this preset */
  suggestedName: string
  imageUrl: string
  defaultWidth: number
  defaultHeight: number
}

export const FURNITURE_PRESETS: FurniturePreset[] = [
  {
    id: 'preset-bed',
    label: 'Bed',
    suggestedName: 'Bed',
    imageUrl:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
    defaultWidth: 200,
    defaultHeight: 120,
  },
  {
    id: 'preset-couch',
    label: 'Couch',
    suggestedName: 'Cozy Couch',
    imageUrl:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    defaultWidth: 220,
    defaultHeight: 120,
  },
  {
    id: 'preset-lamp',
    label: 'Lamp',
    suggestedName: 'Lamp',
    imageUrl:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    defaultWidth: 90,
    defaultHeight: 130,
  },
  {
    id: 'preset-drums',
    label: 'Drums',
    suggestedName: 'Drum Kit',
    imageUrl:
      'https://images.unsplash.com/photo-1519892300165-cb5542fb47c0?auto=format&fit=crop&w=600&q=80',
    defaultWidth: 200,
    defaultHeight: 150,
  },
  {
    id: 'preset-chair',
    label: 'Chair',
    suggestedName: 'Chair',
    imageUrl:
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=600&q=80',
    defaultWidth: 100,
    defaultHeight: 120,
  },
  {
    id: 'preset-table',
    label: 'Table',
    suggestedName: 'Coffee Table',
    imageUrl:
      'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=600&q=80',
    defaultWidth: 160,
    defaultHeight: 100,
  },
  {
    id: 'preset-bookshelf',
    label: 'Bookshelf',
    suggestedName: 'Bookshelf',
    imageUrl:
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=600&q=80',
    defaultWidth: 140,
    defaultHeight: 160,
  },
  {
    id: 'preset-plant',
    label: 'Plant',
    suggestedName: 'Plant',
    imageUrl:
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
    defaultWidth: 90,
    defaultHeight: 120,
  },
]

export function findPresetByImageUrl(url: string | undefined): FurniturePreset | undefined {
  if (!url) return undefined
  return FURNITURE_PRESETS.find((preset) => preset.imageUrl === url)
}
