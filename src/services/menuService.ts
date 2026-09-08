import { menuItems as localMenuItems } from '../data/menu'
import { restaurantConfig } from '../config/restaurant'
import type { MenuCategory, MenuItem, MenuOptionGroup } from '../types/menu'

interface MenuRow {
  id: string
  code: string
  name: string
  slug: string
  description: string
  price: number
  image_url: string
  available: boolean
  featured: boolean
  preparation_time: string
  restaurants: { slug: string } | null
  categories: { name: MenuCategory } | null
  menu_option_groups: Array<{
    id: string
    name: string
    required: boolean
    min_select: number
    max_select: number
    menu_options: Array<{
      id: string
      name: string
      price_delta: number
      available: boolean
      sort_order: number
    }>
  }>
  recommendations: Array<{ recommended_item: { slug: string } | null }>
}

const mapOptionGroups = (
  rows: MenuRow['menu_option_groups'],
): MenuOptionGroup[] =>
  rows.map((group) => ({
    id: group.id,
    name: group.name,
    required: group.required,
    minSelect: group.min_select,
    maxSelect: group.max_select,
    options: group.menu_options
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((option) => ({
        id: option.id,
        name: option.name,
        priceDelta: option.price_delta,
        available: option.available,
      })),
  }))

export const menuService = {
  async list(): Promise<MenuItem[]> {
    const dataMode = import.meta.env.VITE_DATA_MODE
    if (dataMode === 'local' || (!dataMode && import.meta.env.DEV)) {
      const saved =
        typeof localStorage === 'undefined'
          ? null
          : localStorage.getItem('sajitap-dev-menu')
      return saved
        ? (JSON.parse(saved) as MenuItem[])
        : structuredClone(localMenuItems)
    }
    if (dataMode && dataMode !== 'supabase') {
      throw new Error(`VITE_DATA_MODE tidak valid: ${dataMode}`)
    }

    const { requireSupabase } = await import('../lib/supabase')
    const { data, error } = await requireSupabase()
      .from('menu_items')
      .select(
        `id, code, name, slug, description, price, image_url, available, featured, preparation_time,
        restaurants!inner(slug),
        categories(name),
        menu_option_groups(id, name, required, min_select, max_select, menu_options(id, name, price_delta, available, sort_order)),
        recommendations:menu_item_recommendations!menu_item_id(recommended_item:menu_items!recommended_menu_item_id(slug))`,
      )
      .eq('restaurants.slug', restaurantConfig.slug)
      .order('sort_order')

    if (error) throw new Error(`Menu gagal dimuat: ${error.message}`)
    return (data as unknown as MenuRow[]).map((row) => ({
      id: row.slug,
      code: row.code,
      name: row.name,
      description: row.description,
      price: row.price,
      category: row.categories?.name ?? 'Makanan Utama',
      image: row.image_url,
      available: row.available,
      featured: row.featured,
      preparationTime: row.preparation_time,
      optionGroups: mapOptionGroups(row.menu_option_groups ?? []),
      recommendedWith: (row.recommendations ?? [])
        .map((entry) => entry.recommended_item?.slug)
        .filter((slug): slug is string => Boolean(slug)),
    }))
  },
}
