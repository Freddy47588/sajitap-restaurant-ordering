import type { StaffRole } from '../types/staff'

export const staffHomeByRole: Record<StaffRole, string> = {
  admin: '/admin',
  kitchen: '/kitchen',
  cashier: '/cashier',
  waiter: '/waiter',
}

const roleRoutes: Record<StaffRole, string[]> = {
  admin: ['/admin', '/kitchen', '/cashier', '/waiter'],
  kitchen: ['/kitchen'],
  cashier: ['/cashier'],
  waiter: ['/waiter'],
}

export const canAccessStaffPath = (role: StaffRole, path: string) =>
  roleRoutes[role].some(
    (route) => path === route || path.startsWith(`${route}/`),
  )

export const staffDestination = (role: StaffRole, requested: string | null) =>
  requested && canAccessStaffPath(role, requested)
    ? requested
    : staffHomeByRole[role]
