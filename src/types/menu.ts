export type MenuCategory = 'Makanan Utama' | 'Mie & Bakso' | 'Camilan'
export interface MenuItem { id: string; code: string; name: string; description: string; price: number; category: MenuCategory; image: string; available: boolean; featured: boolean }
export interface CartItem extends MenuItem { quantity: number; note: string; cartId: string }
export interface CompletedOrder { id: string; customerName: string; tableNumber: string; total: number; itemCount: number }
