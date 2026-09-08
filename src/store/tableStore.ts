import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface TableState {
  tableNumber: string | null
  qrToken: string | null
  setTableContext: (tableNumber: string | null, qrToken?: string | null) => void
}

export const normalizeTableNumber = (value: string | null | undefined) => {
  const normalized = value?.trim()
  return normalized && /^\d{1,3}$/.test(normalized)
    ? String(Number(normalized))
    : null
}

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      tableNumber: null,
      qrToken: null,
      setTableContext: (tableNumber, qrToken) =>
        set((state) => ({
          tableNumber,
          qrToken: qrToken === undefined ? state.qrToken : qrToken,
        })),
    }),
    {
      name: 'sajitap-table',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
