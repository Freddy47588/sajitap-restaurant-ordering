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
