import { describe, expect, it } from 'vitest'
import { menuService } from './menuService'

describe('menu service development mode', () => {
  it('returns a detached typed local catalog in development', async () => {
    const first = await menuService.list()
    const second = await menuService.list()
    expect(first.length).toBeGreaterThanOrEqual(15)
    expect(first).not.toBe(second)
    expect(first.every((item) => item.preparationTime)).toBe(true)
  })
})
