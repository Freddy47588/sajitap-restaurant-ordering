import { Pencil, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { QuantityStepper } from '../components/ui/QuantityStepper'
import { useTableContext } from '../hooks/useTableContext'
import { formatRupiah } from '../lib/format'
import {
  cartItemCount,
  cartItemSubtotal,
  cartItemUnitPrice,
  cartTotal,
  optionTotal,
  useCartStore,
} from '../store/cartStore'
import { useToastStore } from '../store/toastStore'

export function CartPage() {
  const { items, removeItem, setQuantity } = useCartStore()
  const { to } = useTableContext()
  const showToast = useToastStore((state) => state.show)
  const total = cartTotal(items)
  if (!items.length)
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <span className="text-terracotta mx-auto grid size-16 place-items-center rounded-full bg-orange-100">
          <ShoppingBag />
        </span>
        <h1 className="font-display mt-5 text-4xl">Keranjang masih kosong</h1>
        <p className="mt-3 text-stone-600">
          Yuk, temukan menu yang cocok untuk Anda.
        </p>
        <Link
          className="bg-terracotta mt-7 inline-block rounded-xl px-5 py-3 font-bold text-white"
          to={to('/menu')}
        >
          Lihat Menu
        </Link>
      </section>
    )
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl">Keranjang Anda</h1>
      <p className="mt-2 text-stone-600">
        {cartItemCount(items)} item siap dipesan.
      </p>
      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_350px]">
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.cartId}
              className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-4"
            >
              <img
                src={item.image}
                alt={item.name}
                className="size-22 rounded-xl object-cover sm:size-28"
              />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      {formatRupiah(item.price)} harga menu
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      removeItem(item.cartId)
                      showToast(`${item.name} dihapus dari keranjang`, 'info')
                    }}
                    aria-label={`Hapus ${item.name}`}
                    className="grid size-9 place-items-center rounded-full text-stone-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {(item.selectedOptions ?? []).length > 0 && (
                  <ul className="mt-2 text-sm text-stone-500">
                    {item.selectedOptions.map((option) => (
                      <li key={`${option.groupId}-${option.optionId}`}>
                        {option.groupName}: {option.optionName}
                        {option.priceDelta > 0 &&
                          ` (+${formatRupiah(option.priceDelta)})`}
                      </li>
                    ))}
                  </ul>
                )}
                {item.note && (
                  <p className="mt-2 text-sm text-stone-500">
                    Catatan: {item.note}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-stone-500">
                  <span>
                    Harga satuan {formatRupiah(cartItemUnitPrice(item))}
                  </span>
                  {optionTotal(item.selectedOptions ?? []) > 0 && (
                    <span>
                      Tambahan{' '}
                      {formatRupiah(optionTotal(item.selectedOptions ?? []))}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(value) => {
                      setQuantity(item.cartId, value)
                      showToast('Jumlah pesanan diperbarui', 'info')
                    }}
                  />
                  <div className="flex items-center gap-3">
                    <Link
                      to={to(
                        `/menu/${item.id}?edit=${encodeURIComponent(item.cartId)}`,
                      )}
                      className="text-terracotta inline-flex items-center gap-1 text-sm font-semibold"
                    >
                      <Pencil size={14} /> Ubah
                    </Link>
                    <strong>{formatRupiah(cartItemSubtotal(item))}</strong>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <aside className="bg-ink h-fit rounded-2xl p-6 text-white lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Ringkasan pesanan</h2>
          <div className="mt-5 flex justify-between text-stone-300">
            <span>Total item</span>
            <span>{cartItemCount(items)}</span>
          </div>
          <div className="mt-4 border-t border-white/15 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total pembayaran</span>
              <span>{formatRupiah(total)}</span>
            </div>
          </div>
          <Link
            to={to('/checkout')}
            className="text-ink mt-6 block rounded-xl bg-orange-300 px-4 py-3 text-center font-bold hover:bg-orange-200"
          >
            Lanjut Checkout
          </Link>
        </aside>
      </div>
    </section>
  )
}
