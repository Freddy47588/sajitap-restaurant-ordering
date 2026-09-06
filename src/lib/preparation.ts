import type { CartItem } from '../types/menu'

export const estimateOrderPreparation = (items: CartItem[]) => {
  const maximum = Math.max(
    0,
    ...items.map((item) =>
      Number(item.preparationTime?.match(/\d+(?=\s*menit)/)?.[0] ?? 0),
    ),
  )
  return maximum
    ? `${Math.max(5, maximum - 5)}–${maximum} menit`
    : '10–15 menit'
}
