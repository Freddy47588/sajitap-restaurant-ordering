import { describe, expect, it } from 'vitest'
import {
  canAccessStaffPath,
  staffDestination,
  staffHomeByRole,
} from './staffRoutes'

describe('staff role routes', () => {
  it('maps every role to its own dashboard', () => {
    expect(staffHomeByRole).toEqual({
      admin: '/admin',
      kitchen: '/kitchen',
      cashier: '/cashier',
      waiter: '/waiter',
    })
  })

  it('rejects cross-role redirect requests', () => {
    expect(staffDestination('waiter', '/kitchen')).toBe('/waiter')
    expect(staffDestination('kitchen', '/admin')).toBe('/kitchen')
    expect(staffDestination('cashier', '/waiter')).toBe('/cashier')
  })

  it('allows an admin to enter intentionally shared staff dashboards', () => {
    expect(canAccessStaffPath('admin', '/kitchen')).toBe(true)
    expect(canAccessStaffPath('admin', '/cashier')).toBe(true)
    expect(canAccessStaffPath('admin', '/waiter')).toBe(true)
  })
})
