import { createContext, useContext } from 'react'
import type { MenuItem } from '../types/menu'

export interface MenuCatalogValue {
  items: MenuItem[]
  loading: boolean
  error: string | null
  retry: () => void
  getById: (id: string) => MenuItem | undefined
}

export const MenuCatalogContext = createContext<MenuCatalogValue | null>(null)

export function useMenuCatalog() {
  const value = useContext(MenuCatalogContext)
  if (!value)
    throw new Error(
      'useMenuCatalog harus digunakan di dalam MenuCatalogProvider.',
    )
  return value
}
