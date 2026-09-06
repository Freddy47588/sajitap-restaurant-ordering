import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { tableFromUrl } from '../../lib/table'
import { normalizeTableNumber, useTableStore } from '../../store/tableStore'

export function TableContextSync() {
  const location = useLocation()
  const setTableNumber = useTableStore((state) => state.setTableNumber)

  useEffect(() => {
    const rawTable = tableFromUrl(location.pathname, location.search)
    if (rawTable !== null) setTableNumber(normalizeTableNumber(rawTable))
  }, [location.pathname, location.search, setTableNumber])

  return null
}
