import { describe, expect, it } from 'vitest'
import { formatRupiah } from './format'
describe('formatRupiah', () => {
  it('formats Indonesian Rupiah', () =>
    expect(formatRupiah(16000)).toBe('Rp16.000'))
})
