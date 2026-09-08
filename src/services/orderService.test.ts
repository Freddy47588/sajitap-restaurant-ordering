import { beforeEach, describe, expect, it } from 'vitest'
import { menuItems } from '../data/menu'
import type { CartItem } from '../types/menu'
import type { PersistedOrder } from '../types/order'
import { orderService } from './orderService'

const values = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  },
  configurable: true,
})

describe('order service local development adapter', () => {
  beforeEach(() => values.clear())

  it('recalculates prices from the catalog and persists the order', async () => {
    const menu = menuItems.find((item) => item.id === 'sate-ayam')!
    const item: CartItem = {
      ...menu,
      price: 1,
      quantity: 2,
      note: '',
      cartId: 'test-cart-item',
      selectedOptions: [
        {
          groupId: 'spice-level',
          groupName: 'Tingkat Pedas',
          optionId: 'no-spice',
          optionName: 'Tidak Pedas',
          priceDelta: 0,
        },
      ],
    }
    const order = await orderService.create({
      restaurantSlug: 'sajitap-demo',
      tableNumber: '12',
      customerName: 'Budi',
      customerNote: '',
      items: [item],
    })
    expect(order.total).toBe(44000)
    expect(order.status).toBe('pending')
    expect(order.items[0]?.name).toBe('Sate Ayam')
    expect(order.trackingToken).toBeTruthy()
    expect(JSON.parse(values.get('sajitap-dev-orders') ?? '[]')).toHaveLength(1)
  })

  it('rejects inactive tables and unavailable products', async () => {
    const item = {
      ...menuItems.find((menu) => menu.id === 'bakso')!,
      quantity: 1,
      note: '',
      cartId: 'bakso-test',
      selectedOptions: [],
    }
    await expect(
      orderService.create({
        restaurantSlug: 'sajitap-demo',
        tableNumber: '8',
        customerName: 'Budi',
        customerNote: '',
        items: [item],
      }),
    ).rejects.toThrow('Meja tidak tersedia')
    await expect(
      orderService.create({
        restaurantSlug: 'sajitap-demo',
        tableNumber: '12',
        customerName: 'Budi',
        customerNote: '',
        items: [item],
      }),
    ).rejects.toThrow('sedang tidak tersedia')
  })

  it('rejects missing, duplicate, and unknown menu options', async () => {
    const menu = menuItems.find((entry) => entry.id === 'sate-ayam')!
    const base: CartItem = {
      ...menu,
      quantity: 1,
      note: '',
      cartId: 'validation-test',
      selectedOptions: [],
    }
    const input = {
      restaurantSlug: 'sajitap-demo',
      tableNumber: '12',
      customerName: 'Budi',
      customerNote: '',
    }

    await expect(
      orderService.create({ ...input, items: [base] }),
    ).rejects.toThrow('Tingkat Pedas')

    const valid = {
      groupId: 'spice-level',
      groupName: 'Tingkat Pedas',
      optionId: 'no-spice',
      optionName: 'Tidak Pedas',
      priceDelta: 999999,
    }
    await expect(
      orderService.create({
        ...input,
        items: [{ ...base, selectedOptions: [valid, valid] }],
      }),
    ).rejects.toThrow('berulang')
    await expect(
      orderService.create({
        ...input,
        items: [
          {
            ...base,
            selectedOptions: [valid, { ...valid, optionId: 'forged-option' }],
          },
        ],
      }),
    ).rejects.toThrow('tidak tersedia')
  })

  it('enforces status transitions in the development adapter', async () => {
    const stored = JSON.parse(values.get('sajitap-dev-orders') ?? '[]')
    const base: PersistedOrder = {
      id: 'order-1',
      orderCode: 'ST-1',
      trackingToken: 'token',
      customerName: 'Budi',
      customerNote: '',
      tableNumber: '12',
      total: 10000,
      itemCount: 1,
      preparationTime: '10–15 menit',
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      items: [],
    }
    values.set('sajitap-dev-orders', JSON.stringify([base, ...stored]))
    const confirmed = await orderService.transitionStatus(base, 'confirmed')
    expect(confirmed.status).toBe('confirmed')
    await expect(orderService.transitionStatus(base, 'ready')).rejects.toThrow(
      'tidak valid',
    )
  })
})
