import { restaurantConfig } from '../config/restaurant'
import { categories as localCategoryNames } from '../data/menu'
import { restaurantTables } from '../data/tables'
import type { MenuItem } from '../types/menu'
import type { StaffProfile } from '../types/staff'
import type { RestaurantTable } from '../types/table'
import { menuService } from './menuService'
import { authService } from './authService'

export interface ManagedCategory {
  id: string
  name: string
  sortOrder: number
  active: boolean
}
const usesLocalData = () =>
  import.meta.env.VITE_DATA_MODE === 'local' ||
  (!import.meta.env.VITE_DATA_MODE && import.meta.env.DEV)
const assertWritableAdmin = async () => {
  const profile = await authService.getCurrentStaff()
  if (profile?.role === 'admin' && profile.isDemo)
    throw new Error('Admin demo hanya memiliki akses baca.')
}
const restaurantId = async () => {
  const { requireSupabase } = await import('../lib/supabase')
  const { data, error } = await requireSupabase()
    .from('restaurants')
    .select('id')
    .eq('slug', restaurantConfig.slug)
    .single()
  if (error) throw new Error(error.message)
  return data.id
}

export const adminService = {
  async saveMenu(item: MenuItem): Promise<void> {
    if (usesLocalData()) {
      const items = await menuService.list()
      localStorage.setItem(
        'sajitap-dev-menu',
        JSON.stringify([
          ...items.filter((entry) => entry.id !== item.id),
          item,
        ]),
      )
      return
    }
    await assertWritableAdmin()
    const { requireSupabase } = await import('../lib/supabase')
    const client = requireSupabase()
    const ownerId = await restaurantId()
    const { data: category, error: categoryError } = await client
      .from('categories')
      .select('id')
      .eq('restaurant_id', ownerId)
      .eq('name', item.category)
      .single()
    if (categoryError) throw new Error(categoryError.message)
    const { data: savedMenu, error } = await client
      .from('menu_items')
      .upsert(
        {
          restaurant_id: ownerId,
          category_id: category.id,
          code: item.code,
          slug: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.image,
          available: item.available,
          featured: item.featured,
          preparation_time: item.preparationTime,
        },
        { onConflict: 'restaurant_id,slug' },
      )
      .select('id')
      .single()
    if (error) throw new Error(`Menu gagal disimpan: ${error.message}`)
    for (const [groupIndex, group] of (item.optionGroups ?? []).entries()) {
      const groupPayload = {
        menu_item_id: savedMenu.id,
        name: group.name,
        required: group.required,
        min_select: group.minSelect,
        max_select: group.maxSelect,
        sort_order: groupIndex,
      }
      const groupIsUuid = /^[0-9a-f-]{36}$/i.test(group.id)
      const groupQuery = groupIsUuid
        ? client
            .from('menu_option_groups')
            .update(groupPayload)
            .eq('id', group.id)
        : client.from('menu_option_groups').insert(groupPayload)
      const { data: savedGroups, error: groupError } =
        await groupQuery.select('id')
      if (groupError) throw new Error(groupError.message)
      const groupId = groupIsUuid ? group.id : savedGroups?.[0]?.id
      for (const [optionIndex, option] of group.options.entries()) {
        const optionPayload = {
          option_group_id: groupId,
          name: option.name,
          price_delta: option.priceDelta,
          available: option.available,
          sort_order: optionIndex,
        }
        const optionIsUuid = /^[0-9a-f-]{36}$/i.test(option.id)
        const { error: optionError } = optionIsUuid
          ? await client
              .from('menu_options')
              .update(optionPayload)
              .eq('id', option.id)
          : await client.from('menu_options').insert(optionPayload)
        if (optionError) throw new Error(optionError.message)
      }
    }
  },
  async listCategories(): Promise<ManagedCategory[]> {
    if (usesLocalData()) {
      const saved = localStorage.getItem('sajitap-dev-categories')
      return saved
        ? JSON.parse(saved)
        : localCategoryNames
            .filter((name) => !['Semua', 'Favorit'].includes(name))
            .map((name, index) => ({
              id: name,
              name,
              sortOrder: index + 1,
              active: true,
            }))
    }
    const { requireSupabase } = await import('../lib/supabase')
    const ownerId = await restaurantId()
    const { data, error } = await requireSupabase()
      .from('categories')
      .select('id,name,sort_order,active')
      .eq('restaurant_id', ownerId)
      .order('sort_order')
    if (error) throw new Error(error.message)
    return data.map((entry) => ({
      id: entry.id,
      name: entry.name,
      sortOrder: entry.sort_order,
      active: entry.active,
    }))
  },
  async saveCategories(categories: ManagedCategory[]) {
    if (usesLocalData()) {
      localStorage.setItem('sajitap-dev-categories', JSON.stringify(categories))
      return
    }
    await assertWritableAdmin()
    const { requireSupabase } = await import('../lib/supabase')
    const ownerId = await restaurantId()
    const { error } = await requireSupabase()
      .from('categories')
      .upsert(
        categories.map((entry) => ({
          ...(entry.id.startsWith('000') ? { id: entry.id } : {}),
          restaurant_id: ownerId,
          name: entry.name,
          sort_order: entry.sortOrder,
          active: entry.active,
        })),
        { onConflict: 'restaurant_id,name' },
      )
    if (error) throw new Error(error.message)
  },
  async listTables(): Promise<RestaurantTable[]> {
    if (usesLocalData()) {
      const saved = localStorage.getItem('sajitap-dev-tables')
      return saved ? JSON.parse(saved) : structuredClone(restaurantTables)
    }
    const { requireSupabase } = await import('../lib/supabase')
    const ownerId = await restaurantId()
    const { data, error } = await requireSupabase()
      .from('restaurant_tables')
      .select('id,table_number,label,qr_token,active')
      .eq('restaurant_id', ownerId)
      .order('table_number')
    if (error) throw new Error(error.message)
    return data.map((entry) => ({
      id: entry.id,
      number: entry.table_number,
      label: entry.label,
      qrToken: entry.qr_token,
      active: entry.active,
    }))
  },
  async saveTables(tables: RestaurantTable[]) {
    if (usesLocalData()) {
      localStorage.setItem('sajitap-dev-tables', JSON.stringify(tables))
      return
    }
    await assertWritableAdmin()
    const { requireSupabase } = await import('../lib/supabase')
    const ownerId = await restaurantId()
    const { error } = await requireSupabase()
      .from('restaurant_tables')
      .upsert(
        tables.map((entry) => ({
          ...(entry.id ? { id: entry.id } : {}),
          restaurant_id: ownerId,
          table_number: entry.number,
          label: entry.label,
          qr_token: entry.qrToken,
          active: entry.active,
        })),
        { onConflict: 'restaurant_id,table_number' },
      )
    if (error) throw new Error(error.message)
  },
  async listStaff(): Promise<StaffProfile[]> {
    if (usesLocalData())
      return [
        {
          id: 'local-admin',
          restaurantId: 'sajitap-demo',
          fullName: 'Admin SajiTap',
          role: 'admin',
          isDemo: false,
        },
        {
          id: 'local-kitchen',
          restaurantId: 'sajitap-demo',
          fullName: 'Tim Dapur',
          role: 'kitchen',
          isDemo: false,
        },
        {
          id: 'local-cashier',
          restaurantId: 'sajitap-demo',
          fullName: 'Kasir SajiTap',
          role: 'cashier',
          isDemo: false,
        },
        {
          id: 'local-waiter',
          restaurantId: 'sajitap-demo',
          fullName: 'Pelayan SajiTap',
          role: 'waiter',
          isDemo: false,
        },
      ]
    const { requireSupabase } = await import('../lib/supabase')
    const ownerId = await restaurantId()
    const { data, error } = await requireSupabase()
      .from('profiles')
      .select('id,restaurant_id,full_name,role,is_demo')
      .eq('restaurant_id', ownerId)
    if (error) throw new Error(error.message)
    return data.map((entry) => ({
      id: entry.id,
      restaurantId: entry.restaurant_id,
      fullName: entry.full_name,
      role: entry.role,
      isDemo: entry.is_demo,
    }))
  },
}
