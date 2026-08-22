import { fixDemoImageUrl, MOCK_ARTWORK, MOCK_FURNITURE, MOCK_ROOMS } from '../data/mockRegistry'
import type { Artwork, Furniture, Room } from '../types'

export function demoArtworkList(): Artwork[] {
  return MOCK_ARTWORK.map((item) => ({
    ...item,
    image_url: fixDemoImageUrl(item.image_url),
  }))
}

export function demoRoomList(): Room[] {
  return MOCK_ROOMS.map((room) => ({ ...room }))
}

export function demoFurnitureList(): Furniture[] {
  return MOCK_FURNITURE.map((item) => ({ ...item }))
}
