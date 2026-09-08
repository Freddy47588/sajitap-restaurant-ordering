export type MenuCategory =
  'Makanan Utama' | 'Mie & Bakso' | 'Camilan' | 'Minuman' | 'Dessert'

export interface MenuOption {
  id: string
  name: string
  priceDelta: number
  available: boolean
}

export interface MenuOptionGroup {
  id: string
  name: string
  required: boolean
  minSelect: number
  maxSelect: number
  options: MenuOption[]
}

export interface SelectedOption {
  groupId: string
  groupName: string
  optionId: string
  optionName: string
  priceDelta: number
}
export interface MenuItem {
  id: string
  code: string
  name: string
  description: string
  price: number
  category: MenuCategory
  image: string
  available: boolean
  featured: boolean
  preparationTime: string
  optionGroups?: MenuOptionGroup[]
  recommendedWith?: string[]
}
export interface CartItem extends MenuItem {
  quantity: number
  note: string
  cartId: string
  selectedOptions: SelectedOption[]
}
