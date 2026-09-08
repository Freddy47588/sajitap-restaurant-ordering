import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { tableFromUrl } from '../../lib/table'
import { normalizeTableNumber, useTableStore } from '../../store/tableStore'

export function TableContextSync() {
  const location = useLocation()
  const setTableContext = useTableStore((state) => state.setTableContext)

  useEffect(() => {
    const rawTable = tableFromUrl(location.pathname, location.search)
    if (rawTable !== null)
      setTableContext(
        normalizeTableNumber(rawTable),
        new URLSearchParams(location.search).get('token') ?? undefined,
      )
  }, [location.pathname, location.search, setTableContext])

  return null
}
