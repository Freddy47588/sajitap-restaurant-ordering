import {
  AlertTriangle,
  ChefHat,
  Clock3,
  LoaderCircle,
  LogOut,
  RefreshCw,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStaffAuth } from '../hooks/useStaffAuth'
import { orderService } from '../services/orderService'
import type { OrderStatus, PersistedOrder } from '../types/order'

const columns: Array<{ title: string; statuses: OrderStatus[]; tone: string }> =
  [
    {
      title: 'Pesanan Baru',
      statuses: ['pending', 'confirmed'],
      tone: 'border-orange-300',
    },
    {
      title: 'Sedang Dimasak',
      statuses: ['preparing'],
      tone: 'border-amber-400',
    },
    { title: 'Siap Diantar', statuses: ['ready'], tone: 'border-emerald-400' },
  ]
const nextAction: Partial<
  Record<OrderStatus, { status: OrderStatus; label: string }>
> = {
  pending: { status: 'confirmed', label: 'Terima Pesanan' },
  confirmed: { status: 'preparing', label: 'Mulai Masak' },
  preparing: { status: 'ready', label: 'Tandai Siap' },
}

function elapsedMinutes(createdAt: string) {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000),
  )
}

function KitchenCard({
  order,
  onTransition,
  busy,
}: {
  order: PersistedOrder
  onTransition: (order: PersistedOrder, status: OrderStatus) => void
  busy: boolean
}) {
  const elapsed = elapsedMinutes(order.createdAt)
  const signal =
    elapsed >= 35
      ? 'border-red-400 bg-red-50'
      : elapsed >= 20
        ? 'border-amber-400 bg-amber-50'
        : 'border-stone-200 bg-white'
  const action = nextAction[order.status]
  return (
    <article className={`rounded-2xl border-2 p-4 shadow-sm ${signal}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-black">{order.orderCode}</p>
          <p className="mt-1 text-lg font-bold">Meja {order.tableNumber}</p>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${elapsed >= 35 ? 'bg-red-600 text-white' : elapsed >= 20 ? 'bg-amber-200 text-amber-900' : 'bg-stone-100 text-stone-600'}`}
        >
          <Clock3 size={14} /> {elapsed} menit
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {order.items.map((item) => (
          <li key={item.id}>
            <p className="text-lg font-bold">
              {item.quantity}× {item.name}
            </p>
            {item.options.length > 0 && (
              <p className="text-sm text-stone-600">
                {item.options.map((option) => option.name).join(', ')}
              </p>
            )}
            {item.note && (
              <p className="mt-1 flex gap-1 rounded-lg bg-yellow-200 px-2 py-1.5 text-sm font-bold text-yellow-950">
                <AlertTriangle className="shrink-0" size={16} /> {item.note}
              </p>
            )}
          </li>
        ))}
      </ul>
      {order.customerNote && (
        <div className="mt-4 rounded-lg bg-blue-50 p-2 text-sm font-semibold text-blue-900">
          Catatan meja: {order.customerNote}
        </div>
      )}
      {action && (
        <button
          disabled={busy}
          onClick={() => onTransition(order, action.status)}
          className="bg-ink mt-5 w-full rounded-xl px-4 py-3 font-bold text-white disabled:opacity-50"
        >
          {busy ? 'Memperbarui…' : action.label}
        </button>
      )}
    </article>
  )
}

export function KitchenPage() {
  const { profile, signOut } = useStaffAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<PersistedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [, setTick] = useState(0)
  const load = useCallback(async () => {
    try {
      setOrders(await orderService.listActiveForStaff())
      setError(null)
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
    const timer = window.setInterval(() => setTick((value) => value + 1), 60000)
    return () => {
      cleanup?.()
      window.clearInterval(timer)
    }
  }, [load])
  const grouped = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        orders: orders.filter((order) =>
          column.statuses.includes(order.status),
        ),
      })),
    [orders],
  )
  const transition = async (order: PersistedOrder, status: OrderStatus) => {
    setBusyId(order.id)
    try {
      const updated = await orderService.transitionStatus(order, status)
      setOrders((current) =>
        current.map((entry) => (entry.id === order.id ? updated : entry)),
      )
      setError(null)
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Status gagal diperbarui.',
      )
    } finally {
      setBusyId(null)
    }
  }
  return (
    <section className="min-h-[calc(100vh-4.5rem)] bg-stone-100 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-terracotta text-sm font-black tracking-widest uppercase">
              Kitchen Display
            </p>
            <h1 className="font-display mt-1 text-4xl">Dapur SajiTap</h1>
            <p className="mt-1 text-stone-600">
              {profile?.fullName} · {orders.length} pesanan aktif
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
            className="mt-5 rounded-xl bg-red-100 p-3 font-semibold text-red-700"
          >
            {error}
          </p>
        )}
        {loading ? (
          <p className="mt-12 flex items-center justify-center gap-2">
            <LoaderCircle className="animate-spin" /> Memuat pesanan…
          </p>
        ) : (
          <div className="mt-6 grid items-start gap-5 lg:grid-cols-3">
            {grouped.map((column) => (
              <section
                key={column.title}
                className={`rounded-2xl border-t-4 bg-stone-200/70 p-3 ${column.tone}`}
              >
                <div className="flex items-center justify-between px-1 py-2">
                  <h2 className="flex items-center gap-2 text-xl font-black">
                    <ChefHat size={21} /> {column.title}
                  </h2>
                  <span className="grid size-8 place-items-center rounded-full bg-white font-black">
                    {column.orders.length}
                  </span>
                </div>
                <div className="mt-2 space-y-3">
                  {column.orders.length ? (
                    column.orders.map((order) => (
                      <KitchenCard
                        key={order.id}
                        order={order}
                        busy={busyId === order.id}
                        onTransition={transition}
                      />
                    ))
                  ) : (
                    <p className="rounded-xl border border-dashed border-stone-300 bg-white/60 p-6 text-center text-sm text-stone-500">
                      Belum ada pesanan
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
