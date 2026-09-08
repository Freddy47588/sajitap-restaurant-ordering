import { Banknote, CheckCircle2, LogOut, ReceiptText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStaffAuth } from '../hooks/useStaffAuth'
import { formatRupiah } from '../lib/format'
import { getOrderStatusLabel } from '../lib/orderStatus'
import { orderService } from '../services/orderService'
import type { PaymentStatus, PersistedOrder } from '../types/order'

export function CashierPage() {
  const { profile, signOut } = useStaffAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<PersistedOrder[]>([])
  const [tab, setTab] = useState<'active' | 'completed'>('active')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const load = () =>
    orderService
      .listAllForStaff()
      .then(setOrders, (reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : 'Pesanan gagal dimuat.',
        ),
      )
  useEffect(() => {
    void load()
  }, [])
  const visible = orders.filter((order) =>
    tab === 'completed'
      ? ['completed', 'cancelled'].includes(order.status)
      : !['completed', 'cancelled'].includes(order.status),
  )
  const payment = async (order: PersistedOrder, status: PaymentStatus) => {
    setBusy(order.id)
    try {
      const updated = await orderService.setPaymentStatus(order, status)
      setOrders((current) =>
        current.map((entry) => (entry.id === order.id ? updated : entry)),
      )
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Pembayaran gagal diperbarui.',
      )
    } finally {
      setBusy('')
    }
  }
  const advance = async (order: PersistedOrder) => {
    const next =
      order.status === 'ready'
        ? 'served'
        : order.status === 'served'
          ? 'completed'
          : null
    if (!next) return
    setBusy(order.id)
    try {
      const updated = await orderService.transitionStatus(order, next)
      setOrders((current) =>
        current.map((entry) => (entry.id === order.id ? updated : entry)),
      )
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Status gagal diperbarui.',
      )
    } finally {
      setBusy('')
    }
  }
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
            Kasir
          </p>
          <h1 className="font-display mt-2 text-4xl">Pembayaran Pesanan</h1>
          <p className="mt-2 text-stone-600">{profile?.fullName}</p>
        </div>
        <button
          onClick={async () => {
            await signOut()
            navigate('/staff/login')
          }}
          className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 font-bold"
        >
          <LogOut size={17} /> Keluar
        </button>
      </header>
      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
      <div
        className="mt-6 flex gap-2"
        role="tablist"
        aria-label="Status pesanan"
      >
        <button
          role="tab"
          aria-selected={tab === 'active'}
          onClick={() => setTab('active')}
          className={`rounded-full px-4 py-2 font-bold ${tab === 'active' ? 'bg-terracotta text-white' : 'bg-white'}`}
        >
          Aktif
        </button>
        <button
          role="tab"
          aria-selected={tab === 'completed'}
          onClick={() => setTab('completed')}
          className={`rounded-full px-4 py-2 font-bold ${tab === 'completed' ? 'bg-terracotta text-white' : 'bg-white'}`}
        >
          Selesai
        </button>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {visible.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-stone-200 bg-white p-5"
          >
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-xl font-black">{order.orderCode}</p>
                <p className="mt-1">
                  Meja {order.tableNumber} · {getOrderStatusLabel(order.status)}
                </p>
              </div>
              <p className="text-terracotta text-xl font-black">
                {formatRupiah(order.total)}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t pt-4">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold ${order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}
              >
                {order.paymentStatus === 'paid' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Banknote size={16} />
                )}
                {order.paymentStatus === 'paid'
                  ? 'Sudah Dibayar'
                  : 'Belum Dibayar'}
              </span>
              <button
                disabled={busy === order.id}
                onClick={() =>
                  void payment(
                    order,
                    order.paymentStatus === 'paid' ? 'unpaid' : 'paid',
                  )
                }
                className="rounded-lg border px-3 py-2 text-sm font-bold"
              >
                Ubah Pembayaran
              </button>
              {['ready', 'served'].includes(order.status) && (
                <button
                  disabled={busy === order.id}
                  onClick={() => void advance(order)}
                  className="bg-ink ml-auto inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-white"
                >
                  <ReceiptText size={16} />{' '}
                  {order.status === 'ready' ? 'Sudah Diantar' : 'Selesaikan'}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {!visible.length && (
        <p className="mt-8 rounded-2xl border border-dashed bg-white p-10 text-center text-stone-500">
          Belum ada pesanan pada bagian ini.
        </p>
      )}
    </section>
  )
}
