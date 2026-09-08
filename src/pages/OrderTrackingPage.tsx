import {
  Check,
  ChefHat,
  CircleAlert,
  Clock3,
  PackageCheck,
  ReceiptText,
  UtensilsCrossed,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatRupiah } from '../lib/format'
import { getOrderStatusLabel } from '../lib/orderStatus'
import { withTable } from '../lib/table'
import { orderService } from '../services/orderService'
import { useOrderStore } from '../store/orderStore'
import type { OrderStatus, PersistedOrder } from '../types/order'

const progress: Array<{
  status: OrderStatus
  label: string
  icon: typeof ReceiptText
}> = [
  { status: 'pending', label: 'Menunggu konfirmasi', icon: Clock3 },
  { status: 'confirmed', label: 'Pesanan diterima', icon: ReceiptText },
  { status: 'preparing', label: 'Sedang disiapkan', icon: ChefHat },
  { status: 'ready', label: 'Siap diantar', icon: PackageCheck },
  { status: 'served', label: 'Sudah diantar', icon: UtensilsCrossed },
  { status: 'completed', label: 'Selesai', icon: Check },
]

export function OrderTrackingPage() {
  const { orderCode = '' } = useParams()
  const recent = useOrderStore((state) =>
    state.recentOrders.find((order) => order.orderCode === orderCode),
  )
  const cached = useOrderStore((state) =>
    state.latestOrder?.orderCode === orderCode ? state.latestOrder : null,
  )
  const setLatestOrder = useOrderStore((state) => state.setLatestOrder)
  const updateStatus = useOrderStore((state) => state.updateStatus)
  const [order, setOrder] = useState<PersistedOrder | null>(cached)
  const [loading, setLoading] = useState(Boolean(recent && !cached))
  const [error, setError] = useState<string | null>(null)
  const orderId = order?.id
  const trackedOrderCode = order?.orderCode

  useEffect(() => {
    if (!recent) return
    let active = true
    setLoading(true)
    orderService.getByCode(orderCode, recent.trackingToken).then(
      (value) => {
        if (active) {
          setOrder(value)
          if (value) setLatestOrder(value)
          setError(value ? null : 'Pesanan tidak ditemukan.')
          setLoading(false)
        }
      },
      (reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : 'Pesanan gagal dimuat.',
          )
          setLoading(false)
        }
      },
    )
    return () => {
      active = false
    }
  }, [orderCode, recent, setLatestOrder])

  useEffect(() => {
    if (!orderId || !trackedOrderCode) return
    let unsubscribe: (() => void) | undefined
    let active = true
    void orderService
      .subscribeToStatus(orderId, (status) => {
        if (!active) return
        setOrder((current) => (current ? { ...current, status } : current))
        updateStatus(trackedOrderCode, status)
      })
      .then((cleanup) => {
        if (active) unsubscribe = cleanup
        else cleanup()
      })
    return () => {
      active = false
      unsubscribe?.()
    }
  }, [orderId, trackedOrderCode, updateStatus])

  if (!recent)
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <CircleAlert className="text-terracotta mx-auto" size={48} />
        <h1 className="font-display mt-5 text-4xl">
          Pesanan tidak dapat diakses
        </h1>
        <p className="mt-3 text-stone-600">
          Pesanan ini tidak tersimpan di perangkat Anda.
        </p>
        <Link
          to="/orders"
          className="text-terracotta mt-6 inline-block font-bold"
        >
          Lihat Pesanan Saya
        </Link>
      </section>
    )
  if (loading)
    return (
      <section className="mx-auto max-w-3xl px-4 py-20" aria-busy="true">
        <div className="h-80 animate-pulse rounded-3xl bg-stone-200" />
      </section>
    )
  if (error || !order)
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <CircleAlert className="mx-auto text-red-600" size={48} />
        <h1 className="font-display mt-5 text-4xl">Pesanan gagal dimuat</h1>
        <p className="mt-3 text-stone-600">{error}</p>
      </section>
    )

  const currentIndex = progress.findIndex(
    (step) => step.status === order.status,
  )
  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl bg-[#29201c] p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-widest text-orange-300 uppercase">
              Pesanan {order.orderCode}
            </p>
            <h1 className="font-display mt-2 text-4xl">
              {getOrderStatusLabel(order.status)}
            </h1>
            <p className="mt-2 text-stone-300">
              Meja {order.tableNumber} ·{' '}
              {new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(order.createdAt))}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
            <p className="text-xs text-stone-300">Estimasi persiapan</p>
            <p className="mt-1 font-bold">{order.preparationTime}</p>
          </div>
        </div>
      </div>
      {order.status === 'cancelled' ? (
        <div className="mt-6 rounded-2xl bg-red-50 p-5 text-red-700">
          <strong>Pesanan dibatalkan</strong>
          <p className="mt-1 text-sm">
            Silakan hubungi staf restoran jika Anda memerlukan bantuan.
          </p>
        </div>
      ) : (
        <ol className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {progress.map((step, index) => {
            const Icon = step.icon
            const done = index <= currentIndex
            return (
              <li
                key={step.status}
                className={`rounded-2xl border p-3 ${done ? 'border-terracotta bg-orange-50' : 'border-stone-200 bg-white text-stone-400'}`}
              >
                <span
                  className={`grid size-9 place-items-center rounded-full ${done ? 'bg-terracotta text-white' : 'bg-stone-100'}`}
                >
                  <Icon size={17} />
                </span>
                <p className="mt-3 text-xs font-bold">{step.label}</p>
              </li>
            )
          })}
        </ol>
      )}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-xl font-bold">Detail pesanan</h2>
          <ul className="mt-5 divide-y divide-stone-100">
            {order.items.map((item) => (
              <li key={item.id} className="py-4 first:pt-0">
                <div className="flex justify-between gap-4">
                  <span>
                    <strong>
                      {item.quantity}× {item.name}
                    </strong>
                    <span className="mt-1 block text-sm text-stone-500">
                      {formatRupiah(item.unitPrice)} per item
                    </span>
                  </span>
                  <strong>{formatRupiah(item.subtotal)}</strong>
                </div>
                {item.options.length > 0 && (
                  <p className="mt-2 text-sm text-stone-500">
                    {item.options.map((option) => option.name).join(', ')}
                  </p>
                )}
                {item.note && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Catatan: {item.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
        <aside className="h-fit rounded-2xl bg-orange-100 p-5">
          <p className="text-sm text-stone-600">Atas nama</p>
          <p className="mt-1 font-bold">{order.customerName}</p>
          {order.customerNote && (
            <>
              <p className="mt-4 text-sm text-stone-600">Catatan restoran</p>
              <p className="mt-1 text-sm">{order.customerNote}</p>
            </>
          )}
          <div className="mt-5 flex justify-between border-t border-orange-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatRupiah(order.total)}</span>
          </div>
        </aside>
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          to={withTable('/menu', order.tableNumber)}
          className="bg-terracotta rounded-xl px-5 py-3 font-bold text-white"
        >
          Pesan Lagi
        </Link>
        <Link
          to={withTable('/orders', order.tableNumber)}
          className="rounded-xl border border-stone-300 bg-white px-5 py-3 font-bold"
        >
          Pesanan Saya
        </Link>
      </div>
    </section>
  )
}
