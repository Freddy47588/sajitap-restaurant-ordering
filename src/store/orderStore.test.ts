import { beforeEach, describe, expect, it } from 'vitest'
import { useOrderStore } from './orderStore'
import type { PersistedOrder } from '../types/order'

const order: PersistedOrder = {
  id: 'internal-1',
  orderCode: 'ST-ABC123',
  trackingToken: 'secret-token',
  customerName: 'Budi',
  customerNote: '',
  tableNumber: '12',
  total: 22000,
  itemCount: 1,
  preparationTime: '10–15 menit',
  status: 'pending',
  paymentStatus: 'unpaid',
  createdAt: '2026-09-08T10:00:00.000Z',
  items: [],
}

describe('customer order history', () => {
  beforeEach(() =>
    useOrderStore.setState({ latestOrder: null, recentOrders: [] }),
  )

  it('stores a device-scoped reference and updates its status', () => {
    useOrderStore.getState().setLatestOrder(order)
    expect(useOrderStore.getState().recentOrders[0]?.trackingToken).toBe(
      'secret-token',
    )
    useOrderStore.getState().updateStatus(order.orderCode, 'preparing')
    expect(useOrderStore.getState().recentOrders[0]?.status).toBe('preparing')
  })
})
