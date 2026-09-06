import { create } from 'zustand'
import type { CompletedOrder } from '../types/menu'
interface OrderState { latestOrder: CompletedOrder | null; setLatestOrder: (order: CompletedOrder) => void }
export const useOrderStore = create<OrderState>((set) => ({ latestOrder: null, setLatestOrder: (latestOrder) => set({ latestOrder }) }))
