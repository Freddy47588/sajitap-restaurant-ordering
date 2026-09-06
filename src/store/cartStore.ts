import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
import type { CartItem, MenuItem } from '../types/menu'
interface CartState {
  items: CartItem[]
  addItem: (item: MenuItem, quantity: number, note: string) => void
  removeItem: (cartId: string) => void
  setQuantity: (cartId: string, quantity: number) => void
  clearCart: () => void
}

const memoryStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
export const cartItemCount = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity, note) =>
        set((state) => {
          const normalizedNote = note.trim()
          const existing = state.items.find(
            (entry) => entry.id === item.id && entry.note === normalizedNote,
          )
          return existing
            ? {
                items: state.items.map((entry) =>
                  entry.cartId === existing.cartId
                    ? { ...entry, quantity: entry.quantity + quantity }
                    : entry,
                ),
              }
            : {
                items: [
                  ...state.items,
                  {
                    ...item,
                    quantity,
                    note: normalizedNote,
                    cartId: `${item.id}-${crypto.randomUUID()}`,
                  },
                ],
              }
        }),
      removeItem: (cartId) =>
        set((state) => ({
          items: state.items.filter((item) => item.cartId !== cartId),
        })),
      setQuantity: (cartId, quantity) =>
        set((state) => ({
          items:
            quantity < 1
              ? state.items.filter((item) => item.cartId !== cartId)
              : state.items.map((item) =>
                  item.cartId === cartId ? { ...item, quantity } : item,
                ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'sajitap-cart',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? memoryStorage : window.localStorage,
      ),
    },
  ),
)
