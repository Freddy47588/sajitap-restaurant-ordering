import type { RestaurantTable } from '../types/table'

export const restaurantTables: RestaurantTable[] = Array.from(
  { length: 12 },
  (_, index) => {
    const number = String(index + 1)
    return {
      id: `table-${number.padStart(2, '0')}`,
      number,
      label: `Meja ${number}`,
      qrToken: `sajitap-demo-${number.padStart(2, '0')}`,
      active: number !== '8',
    }
  },
)

export const getRestaurantTable = (number: string | null) =>
  restaurantTables.find((table) => table.number === number)
