import { describe, expect, it } from 'vitest'
import { tableFromUrl, tableOrderUrl, withTable } from './table'
import { normalizeTableNumber } from '../store/tableStore'

describe('table context utilities', () => {
  it('reads query and stable route table values', () => {
    expect(tableFromUrl('/', '?table=12')).toBe('12')
    expect(tableFromUrl('/t/07', '')).toBe('07')
  })

  it('normalizes valid values and rejects invalid values', () => {
    expect(normalizeTableNumber('007')).toBe('7')
    expect(normalizeTableNumber('bar')).toBeNull()
  })

  it('preserves table context in links', () => {
    expect(withTable('/menu?sort=low', '12')).toBe('/menu?sort=low&table=12')
  })

  it('builds a stable customer ordering URL', () => {
    expect(tableOrderUrl('12', 'https://sajitap.example/')).toBe(
      'https://sajitap.example/t/12',
    )
  })
})
