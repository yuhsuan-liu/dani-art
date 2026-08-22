import { clearDemoArtwork } from './artwork'
import { clearDemoBlog } from './blog'
import { clearDemoOrders } from './orders'
import { clearDemoRoomsAndFurniture } from './rooms'

/** Remove all seed demo records; keep anything the user created. */
export async function clearAllDemoData(): Promise<void> {
  await Promise.all([
    clearDemoArtwork(),
    clearDemoRoomsAndFurniture(),
    clearDemoOrders(),
    clearDemoBlog(),
  ])
}
