import { useCallback, useEffect, useMemo, useState } from 'react'
import { MenuCatalogContext } from '../hooks/useMenuCatalog'
import { menuService } from '../services/menuService'
import type { MenuItem } from '../types/menu'

export function MenuCatalogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [request, setRequest] = useState(0)
  const retry = useCallback(() => setRequest((value) => value + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    menuService.list().then(
      (menu) => {
        if (active) {
          setItems(menu)
          setLoading(false)
        }
      },
      (reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : 'Menu gagal dimuat.',
          )
          setLoading(false)
        }
      },
    )
    return () => {
      active = false
    }
  }, [request])

  const value = useMemo(
    () => ({
      items,
      loading,
      error,
      retry,
      getById: (id: string) => items.find((item) => item.id === id),
    }),
    [error, items, loading, retry],
  )
  return (
    <MenuCatalogContext.Provider value={value}>
      {children}
    </MenuCatalogContext.Provider>
  )
}
