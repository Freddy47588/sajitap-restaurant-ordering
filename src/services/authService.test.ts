import { beforeEach, describe, expect, it } from 'vitest'
import { authService } from './authService'

const values = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  },
  configurable: true,
})

describe('staff auth development adapter', () => {
  beforeEach(() => values.clear())
  it('authenticates a known staff account and restores its role', async () => {
    const profile = await authService.signIn(
      'admin@sajitap.local',
      'demo-admin',
    )
    expect(profile.role).toBe('admin')
    expect((await authService.getCurrentStaff())?.id).toBe(profile.id)
    await authService.signOut()
    expect(await authService.getCurrentStaff()).toBeNull()
  })
  it('rejects invalid credentials', async () => {
    await expect(
      authService.signIn('admin@sajitap.local', 'wrong'),
    ).rejects.toThrow('tidak sesuai')
  })
})
