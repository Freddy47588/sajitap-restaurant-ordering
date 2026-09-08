import type { OrderStatus } from '../types/order'

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Menunggu Konfirmasi',
  confirmed: 'Pesanan Diterima',
  preparing: 'Sedang Disiapkan',
  ready: 'Siap Diantar',
  served: 'Sudah Diantar',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export const getOrderStatusLabel = (status: OrderStatus) =>
  orderStatusLabels[status]

export const allowedOrderTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['served'],
  served: ['completed'],
  completed: [],
  cancelled: [],
}

export const canTransitionOrder = (from: OrderStatus, to: OrderStatus) =>
  allowedOrderTransitions[from].includes(to)
