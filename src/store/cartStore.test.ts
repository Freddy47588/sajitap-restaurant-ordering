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
  preparationTime: '10–15 menit',
  price: 10000,
  quantity: 2,
  note: '',
  cartId: 'a-1',
  selectedOptions: [],
}
describe('cart calculations', () => {
  it('calculates total and item count', () => {
    expect(cartTotal([item])).toBe(20000)
    expect(cartItemCount([item])).toBe(2)
  })

  it('includes selected option prices in the total', () => {
    const customized = {
      ...item,
      selectedOptions: [
        {
          groupId: 'addons',
          groupName: 'Tambahan',
          optionId: 'egg',
          optionName: 'Extra Telur',
          priceDelta: 5000,
        },
      ],
    }
    expect(cartTotal([customized])).toBe(30000)
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

  it('keeps different customizations as separate cart entries', () => {
    useCartStore.setState({ items: [] })
    useCartStore.getState().addItem(item, 1, '', [])
    useCartStore.getState().addItem(item, 1, '', [
      {
        groupId: 'addons',
        groupName: 'Tambahan',
        optionId: 'egg',
        optionName: 'Extra Telur',
        priceDelta: 5000,
      },
    ])
    expect(useCartStore.getState().items).toHaveLength(2)
  })
})
