import { restaurantTables } from '../data/tables'
import { requireSupabase } from '../lib/supabase'
import type { RestaurantTable } from '../types/table'

export const tableService = {
  async list(): Promise<RestaurantTable[]> {
    if (
      import.meta.env.VITE_DATA_MODE === 'local' ||
      (!import.meta.env.VITE_DATA_MODE && import.meta.env.DEV)
    ) {
      return structuredClone(restaurantTables)
    }
    const { data, error } = await requireSupabase()
      .from('restaurant_tables')
      .select('id, table_number, label, qr_token, active')
      .order('table_number')
    if (error) throw new Error(`Data meja gagal dimuat: ${error.message}`)
    return data.map((table) => ({
      id: table.id,
      number: table.table_number,
      label: table.label,
      qrToken: table.qr_token,
      active: table.active,
    }))
  },
}
