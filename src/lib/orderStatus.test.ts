import { describe, expect, it } from 'vitest'
import { getOrderStatusLabel, orderStatusLabels } from './orderStatus'
import { orderStatuses } from '../types/order'

describe('order status labels', () => {
  it('defines an Indonesian label for every internal status', () => {
    expect(Object.keys(orderStatusLabels)).toEqual([...orderStatuses])
    expect(getOrderStatusLabel('preparing')).toBe('Sedang Disiapkan')
  })
})
