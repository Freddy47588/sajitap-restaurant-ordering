import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
import type { CartItem, MenuItem, SelectedOption } from '../types/menu'
interface CartState {
  items: CartItem[]
  addItem: (
    item: MenuItem,
    quantity: number,
    note: string,
    selectedOptions?: SelectedOption[],
  ) => void
  updateItem: (
    cartId: string,
    quantity: number,
    note: string,
    selectedOptions: SelectedOption[],
  ) => void
  removeItem: (cartId: string) => void
  setQuantity: (cartId: string, quantity: number) => void
  clearCart: () => void
}

const memoryStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

export const optionTotal = (options: SelectedOption[]) =>
  options.reduce((sum, option) => sum + option.priceDelta, 0)
export const cartItemUnitPrice = (item: CartItem) =>
  item.price + optionTotal(item.selectedOptions ?? [])
export const cartItemSubtotal = (item: CartItem) =>
  cartItemUnitPrice(item) * item.quantity
export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + cartItemSubtotal(item), 0)
export const cartItemCount = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity, note, selectedOptions = []) =>
        set((state) => {
          const normalizedNote = note.trim()
          const optionKey = selectedOptions
            .map((option) => option.optionId)
            .sort()
            .join('|')
          const existing = state.items.find(
            (entry) =>
              entry.id === item.id &&
              entry.note === normalizedNote &&
              (entry.selectedOptions ?? [])
                .map((option) => option.optionId)
                .sort()
                .join('|') === optionKey,
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
                    selectedOptions,
                    cartId: `${item.id}-${crypto.randomUUID()}`,
                  },
                ],
              }
        }),
      updateItem: (cartId, quantity, note, selectedOptions) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.cartId === cartId
              ? { ...item, quantity, note: note.trim(), selectedOptions }
              : item,
          ),
        })),
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
