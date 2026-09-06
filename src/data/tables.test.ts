import { describe, expect, it } from 'vitest'
import { getRestaurantTable, restaurantTables } from './tables'

describe('restaurant table catalog', () => {
  it('uses unique table numbers and QR tokens', () => {
    expect(new Set(restaurantTables.map((table) => table.number)).size).toBe(
      restaurantTables.length,
    )
    expect(new Set(restaurantTables.map((table) => table.qrToken)).size).toBe(
      restaurantTables.length,
    )
  })

  it('distinguishes active, inactive, and unknown tables', () => {
    expect(getRestaurantTable('12')?.active).toBe(true)
    expect(getRestaurantTable('8')?.active).toBe(false)
    expect(getRestaurantTable('99')).toBeUndefined()
  })
})
