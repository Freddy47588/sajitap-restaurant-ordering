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
export type PaymentStatus = 'unpaid' | 'paid'

export interface OrderOptionSnapshot {
  name: string
  priceDelta: number
}

export interface OrderItemSnapshot {
  id: string
  name: string
  category: string
  unitPrice: number
  quantity: number
  note: string
  subtotal: number
  options: OrderOptionSnapshot[]
}

export interface PersistedOrder {
  id: string
  orderCode: string
  trackingToken: string
  customerName: string
  customerNote: string
  tableNumber: string
  total: number
  itemCount: number
  preparationTime: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: string
  items: OrderItemSnapshot[]
}

export interface RecentOrderReference {
  orderCode: string
  trackingToken: string
  tableNumber: string
  total: number
  status: OrderStatus
  createdAt: string
}

export interface CreateOrderInput {
  restaurantSlug: string
  tableNumber: string
  customerName: string
  customerNote: string
  items: import('./menu').CartItem[]
}
