import {
  CheckCircle2,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Utensils,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStaffAuth } from '../hooks/useStaffAuth'
import { orderService } from '../services/orderService'
import type { PersistedOrder } from '../types/order'

export function WaiterPage() {
  const { profile, signOut } = useStaffAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<PersistedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    try {
      setOrders(await orderService.listActiveForStaff())
      setError('')
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Pesanan gagal dimuat.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    let cleanup: (() => void) | undefined
    void orderService.subscribeToStaffOrders(load).then((value) => {
      cleanup = value
    })
    return () => cleanup?.()
  }, [load])

  const serviceOrders = useMemo(
    () => orders.filter((order) => ['ready', 'served'].includes(order.status)),
    [orders],
  )

  const markServed = async (order: PersistedOrder) => {
    setBusyId(order.id)
    try {
      const updated = await orderService.transitionStatus(order, 'served')
      setOrders((current) =>
        current.map((entry) => (entry.id === order.id ? updated : entry)),
      )
      setError('')
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Status gagal diperbarui.',
      )
    } finally {
      setBusyId('')
    }
  }

  return (
    <section className="min-h-[calc(100vh-4.5rem)] bg-stone-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-terracotta text-sm font-black tracking-widest uppercase">
              Pelayanan Meja
            </p>
            <h1 className="font-display mt-2 text-4xl">Pesanan Siap Diantar</h1>
            <p className="mt-2 text-stone-600">
              {profile?.fullName} · {serviceOrders.length} pesanan pelayanan
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void load()}
              className="grid size-11 place-items-center rounded-xl bg-white"
              aria-label="Muat ulang"
            >
              <RefreshCw size={19} />
            </button>
            <button
              onClick={async () => {
                await signOut()
                navigate('/staff/login')
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-bold"
            >
              <LogOut size={17} /> Keluar
            </button>
          </div>
        </header>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-3 text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-12 flex items-center justify-center gap-2">
            <LoaderCircle className="animate-spin" /> Memuat pesanan…
          </p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {serviceOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-black">{order.orderCode}</p>
                    <p className="mt-1 text-lg font-bold">
                      Meja {order.tableNumber}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    {order.status === 'ready'
                      ? 'Siap diantar'
                      : 'Sudah diantar'}
                  </span>
                </div>
                <ul className="mt-4 space-y-2 border-t pt-4 text-sm">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span>{item.name}</span>
                      <strong>{item.quantity}×</strong>
                    </li>
                  ))}
                </ul>
                {order.status === 'ready' ? (
                  <button
                    disabled={busyId === order.id}
                    onClick={() => void markServed(order)}
                    className="bg-ink mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white disabled:opacity-50"
                  >
                    <Utensils size={18} />
                    {busyId === order.id
                      ? 'Memperbarui…'
                      : 'Tandai Sudah Diantar'}
                  </button>
                ) : (
                  <p className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-bold text-emerald-700">
                    <CheckCircle2 size={18} /> Pelayanan selesai
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {!loading && !serviceOrders.length && (
          <p className="mt-8 rounded-2xl border border-dashed bg-white p-10 text-center text-stone-500">
            Belum ada pesanan yang siap diantar.
          </p>
        )}
      </div>
    </section>
  )
}
