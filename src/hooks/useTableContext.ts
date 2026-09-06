import { useLocation } from 'react-router-dom'
import { tableFromUrl, withTable } from '../lib/table'
import { normalizeTableNumber, useTableStore } from '../store/tableStore'

export function useTableContext() {
  const location = useLocation()
  const storedTable = useTableStore((state) => state.tableNumber)
  const urlValue = tableFromUrl(location.pathname, location.search)
  const tableNumber =
    urlValue === null ? storedTable : normalizeTableNumber(urlValue)

  return {
    tableNumber,
    to: (path: string) => withTable(path, tableNumber),
  }
}
