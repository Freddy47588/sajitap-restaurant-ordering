import { describe, expect, it } from 'vitest'
import type { MenuOptionGroup, SelectedOption } from '../types/menu'
import { areMenuOptionsValid, toggleMenuOption } from './menuOptions'

const group: MenuOptionGroup = {
  id: 'addons',
  name: 'Tambahan',
  required: true,
  minSelect: 1,
  maxSelect: 2,
  options: [
    { id: 'egg', name: 'Telur', priceDelta: 5000, available: true },
    { id: 'cheese', name: 'Keju', priceDelta: 4000, available: true },
    { id: 'sold-out', name: 'Habis', priceDelta: 1000, available: false },
  ],
}

const selected = (optionId: string): SelectedOption => ({
  groupId: group.id,
  groupName: group.name,
  optionId,
  optionName: optionId,
  priceDelta: 1,
})

describe('menu option rules', () => {
  it('enforces minimum and maximum selections', () => {
    expect(areMenuOptionsValid([group], [])).toBe(false)
    expect(areMenuOptionsValid([group], [selected('egg')])).toBe(true)
    expect(
      areMenuOptionsValid(
        [group],
        [selected('egg'), selected('cheese'), selected('third')],
      ),
    ).toBe(false)
  })

  it('does not select unavailable options or exceed the group limit', () => {
    expect(toggleMenuOption(group, [], 'sold-out')).toEqual([])
    const one = toggleMenuOption(group, [], 'egg')
    const two = toggleMenuOption(group, one, 'cheese')
    expect(toggleMenuOption(group, two, 'third')).toEqual(two)
  })

  it('toggles a selected checkbox option off', () => {
    const one = toggleMenuOption(group, [], 'egg')
    expect(toggleMenuOption(group, one, 'egg')).toEqual([])
  })
})
