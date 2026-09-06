import { describe, expect, it } from 'vitest'
import { cartItemCount, cartTotal } from './cartStore'
import type { CartItem } from '../types/menu'
const item: CartItem = { id: 'a', code: 'A', name: 'Test', description: '', category: 'Camilan', image: '', available: true, featured: false, price: 10000, quantity: 2, note: '', cartId: 'a-1' }
describe('cart calculations', () => { it('calculates total and item count', () => { expect(cartTotal([item])).toBe(20000); expect(cartItemCount([item])).toBe(2) }) })
