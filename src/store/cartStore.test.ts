import { beforeEach, describe, expect, it } from 'vitest'
import { cartItemCount, cartTotal, useCartStore } from './cartStore'
import type { CartItem } from '../types/menu'
const item: CartItem = {
  id: 'a',
  code: 'A',
  name: 'Test',
  description: '',
  category: 'Camilan',
  image: '',
  available: true,
  featured: false,
  price: 10000,
  quantity: 2,
  note: '',
  cartId: 'a-1',
}
describe('cart calculations', () => {
  it('calculates total and item count', () => {
    expect(cartTotal([item])).toBe(20000)
    expect(cartItemCount([item])).toBe(2)
  })
})

describe('cart store behavior', () => {
  beforeEach(() => useCartStore.setState({ items: [item] }))

  it('updates quantity without duplicating the item', () => {
    useCartStore.getState().setQuantity(item.cartId, 4)

    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().items[0]?.quantity).toBe(4)
  })

  it('removes an item explicitly or when quantity reaches zero', () => {
    useCartStore.getState().setQuantity(item.cartId, 0)
    expect(useCartStore.getState().items).toEqual([])

    useCartStore.setState({ items: [item] })
    useCartStore.getState().removeItem(item.cartId)
    expect(useCartStore.getState().items).toEqual([])
  })
})
