import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { formatRupiah } from '../lib/format'
import { estimateOrderPreparation } from '../lib/preparation'
import { withTable } from '../lib/table'
import { cartItemSubtotal, cartTotal, useCartStore } from '../store/cartStore'
import { useOrderStore } from '../store/orderStore'
import { useTableContext } from '../hooks/useTableContext'
import { useToastStore } from '../store/toastStore'
import { orderService } from '../services/orderService'
import { restaurantConfig } from '../config/restaurant'
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
  const [customerNote, setCustomerNote] = useState('')
  const [errors, setErrors] = useState<{ name?: string; table?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const showToast = useToastStore((state) => state.show)
  if (!items.length)
    return <Navigate to={withTable('/cart', queryTable)} replace />
  const total = cartTotal(items)
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = {
      name: name.trim() ? undefined : 'Nama wajib diisi.',
      table: table.trim() ? undefined : 'Nomor meja wajib diisi.',
    }
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.table) return
    if (!navigator.onLine) {
      setSubmitError(
        'Perangkat sedang offline. Sambungkan internet sebelum mengirim pesanan.',
      )
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const order = await orderService.create({
        restaurantSlug: restaurantConfig.slug,
        tableNumber: table.trim(),
        customerName: name.trim(),
        customerNote: customerNote.trim(),
        items,
      })
      setLatestOrder(order)
      clearCart()
      showToast('Pesanan berhasil disimpan')
      navigate(withTable(`/order/${order.orderCode}`, table.trim()))
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Pesanan gagal disimpan. Silakan coba lagi.',
      )
    } finally {
      setSubmitting(false)
    }
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
                maxLength={80}
                autoComplete="name"
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
                maxLength={20}
                inputMode="numeric"
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
            <label className="block font-semibold">
              Catatan untuk restoran{' '}
              <span className="font-normal text-stone-500">(opsional)</span>
              <textarea
                value={customerNote}
                onChange={(event) => setCustomerNote(event.target.value)}
                maxLength={500}
                aria-describedby="customer-note-limit"
                className="focus:border-terracotta mt-2 min-h-24 w-full rounded-xl border border-stone-300 p-3 font-normal outline-none"
                placeholder="Contoh: Mohon antar semua menu bersamaan"
              />
              <span
                id="customer-note-limit"
                className="mt-1 block text-xs font-normal text-stone-500"
              >
                Maksimal 500 karakter
              </span>
            </label>
          </div>
          {submitError && (
            <div
              role="alert"
              className="mt-5 flex gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <span>
                <strong>Pesanan belum terkirim.</strong>
                <br />
                {submitError} Keranjang Anda tetap tersimpan.
              </span>
            </div>
          )}
          <button
            disabled={submitting}
            className="bg-terracotta mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white hover:bg-[#7f2e18] disabled:cursor-wait disabled:opacity-65"
          >
            {submitting && <LoaderCircle className="animate-spin" size={19} />}
            {submitting ? 'Menyimpan Pesanan…' : 'Kirim Pesanan'}
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
