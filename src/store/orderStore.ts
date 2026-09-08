import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
import type {
  OrderStatus,
  PersistedOrder,
  RecentOrderReference,
} from '../types/order'

interface OrderState {
  latestOrder: PersistedOrder | null
  recentOrders: RecentOrderReference[]
  setLatestOrder: (order: PersistedOrder) => void
  updateStatus: (orderCode: string, status: OrderStatus) => void
}

const memoryStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      latestOrder: null,
      recentOrders: [],
      setLatestOrder: (latestOrder) =>
        set((state) => ({
          latestOrder,
          recentOrders: [
            {
              orderCode: latestOrder.orderCode,
              trackingToken: latestOrder.trackingToken,
              tableNumber: latestOrder.tableNumber,
              total: latestOrder.total,
              status: latestOrder.status,
              createdAt: latestOrder.createdAt,
            },
            ...state.recentOrders.filter(
              (order) => order.orderCode !== latestOrder.orderCode,
            ),
          ].slice(0, 10),
        })),
      updateStatus: (orderCode, status) =>
        set((state) => ({
          latestOrder:
            state.latestOrder?.orderCode === orderCode
              ? { ...state.latestOrder, status }
              : state.latestOrder,
          recentOrders: state.recentOrders.map((order) =>
            order.orderCode === orderCode ? { ...order, status } : order,
          ),
        })),
    }),
    {
      name: 'sajitap-orders',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? memoryStorage : localStorage,
      ),
    },
  ),
)
