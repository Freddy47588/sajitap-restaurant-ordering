export const staffRoles = ['admin', 'kitchen', 'cashier', 'waiter'] as const
export type StaffRole = (typeof staffRoles)[number]

export interface StaffProfile {
  id: string
  restaurantId: string
  fullName: string
  role: StaffRole
  isDemo: boolean
}
