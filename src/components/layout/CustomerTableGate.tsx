import { useLocation } from 'react-router-dom'
import { getRestaurantTable } from '../../data/tables'
import { tableFromUrl } from '../../lib/table'
import { normalizeTableNumber } from '../../store/tableStore'
import { InvalidTablePage } from '../../pages/InvalidTablePage'

export function CustomerTableGate({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const rawTable = tableFromUrl(location.pathname, location.search)
  if (rawTable === null) return children

  const number = normalizeTableNumber(rawTable)
  const table = getRestaurantTable(number)
  if (!number || !table || !table.active) {
    return (
      <InvalidTablePage
        tableNumber={number ?? rawTable}
        inactive={Boolean(table && !table.active)}
      />
    )
  }
  return children
}
