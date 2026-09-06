export const orderStatuses = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'served',
  'completed',
  'cancelled',
] as const

export type OrderStatus = (typeof orderStatuses)[number]
