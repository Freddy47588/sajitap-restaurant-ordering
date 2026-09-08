import { describe, expect, it } from 'vitest'
import {
  canTransitionOrder,
  getOrderStatusLabel,
  orderStatusLabels,
} from './orderStatus'
import { orderStatuses } from '../types/order'

describe('order status labels', () => {
  it('defines an Indonesian label for every internal status', () => {
    expect(Object.keys(orderStatusLabels)).toEqual([...orderStatuses])
    expect(getOrderStatusLabel('preparing')).toBe('Sedang Disiapkan')
  })
  it('allows only explicit forward workflow transitions', () => {
    expect(canTransitionOrder('pending', 'confirmed')).toBe(true)
    expect(canTransitionOrder('confirmed', 'ready')).toBe(false)
    expect(canTransitionOrder('completed', 'pending')).toBe(false)
  })
})
