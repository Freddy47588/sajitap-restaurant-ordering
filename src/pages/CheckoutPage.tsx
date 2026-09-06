import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { formatRupiah, makeOrderId } from '../lib/format'
import { estimateOrderPreparation } from '../lib/preparation'
import { withTable } from '../lib/table'
import {
  cartItemCount,
  cartItemSubtotal,
  cartTotal,
  useCartStore,
} from '../store/cartStore'
import { useOrderStore } from '../store/orderStore'
import { useTableContext } from '../hooks/useTableContext'
import { useToastStore } from '../store/toastStore'
export function CheckoutPage() {
  const { items, clearCart } = useCartStore()
  const setLatestOrder = useOrderStore((state) => state.setLatestOrder)
  const location = useLocation()
  const navigate = useNavigate()
  const { tableNumber } = useTableContext()
  const queryTable =
    tableNumber ?? new URLSearchParams(location.search).get('table') ?? ''
  const [name, setName] = useState('')
  const [table, setTable] = useState(queryTable)
  const [errors, setErrors] = useState<{ name?: string; table?: string }>({})
  const showToast = useToastStore((state) => state.show)
  if (!items.length)
    return <Navigate to={withTable('/cart', queryTable)} replace />
  const total = cartTotal(items)
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = {
      name: name.trim() ? undefined : 'Nama wajib diisi.',
      table: table.trim() ? undefined : 'Nomor meja wajib diisi.',
    }
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.table) return
    setLatestOrder({
      id: makeOrderId(),
      customerName: name.trim(),
      tableNumber: table.trim(),
      total,
      itemCount: cartItemCount(items),
      preparationTime: estimateOrderPreparation(items),
    })
    showToast('Pesanan berhasil dikirim')
    clearCart()
    navigate(withTable('/order-success', table.trim()))
  }
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
        Satu langkah lagi
      </p>
      <h1 className="font-display mt-2 text-4xl">Konfirmasi pesanan</h1>
      <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={submit}
          noValidate
          className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"
        >
          <h2 className="text-xl font-bold">Detail pemesan</h2>
          <div className="mt-6 space-y-5">
            <label className="block font-semibold">
              Nama
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className="focus:border-terracotta mt-2 w-full rounded-xl border border-stone-300 p-3 font-normal outline-none"
                placeholder="Masukkan nama Anda"
              />
            </label>
            {errors.name && (
              <p id="name-error" className="-mt-3 text-sm text-red-600">
                {errors.name}
              </p>
            )}
            <label className="block font-semibold">
              Nomor Meja
              <input
                value={table}
                onChange={(event) => setTable(event.target.value)}
                aria-invalid={Boolean(errors.table)}
                aria-describedby={errors.table ? 'table-error' : undefined}
                className="focus:border-terracotta mt-2 w-full rounded-xl border border-stone-300 p-3 font-normal outline-none"
                placeholder="Contoh: 12"
                readOnly={Boolean(tableNumber)}
              />
            </label>
            {errors.table && (
              <p id="table-error" className="-mt-3 text-sm text-red-600">
                {errors.table}
              </p>
            )}
          </div>
          <button className="bg-terracotta mt-7 w-full rounded-xl px-5 py-3.5 font-bold text-white hover:bg-[#7f2e18]">
            Kirim Pesanan
          </button>
        </form>
        <aside className="h-fit rounded-2xl bg-orange-100 p-6">
          <h2 className="font-bold">Ringkasan pesanan</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.cartId} className="flex justify-between gap-3">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <strong>{formatRupiah(cartItemSubtotal(item))}</strong>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-between border-t border-orange-200 pt-4 text-sm">
            <span>Estimasi siap</span>
            <strong>{estimateOrderPreparation(items)}</strong>
          </div>
          <div className="mt-5 flex justify-between border-t border-orange-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>
        </aside>
      </div>
    </section>
  )
}
