import {
  CircleDollarSign,
  ClipboardList,
  Clock3,
  TrendingUp,
  Utensils,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { formatRupiah } from '../../lib/format'
import { orderService } from '../../services/orderService'
import type { PersistedOrder } from '../../types/order'

export function AdminDashboardPage() {
  const [orders, setOrders] = useState<PersistedOrder[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    orderService
      .listAllForStaff()
      .then(setOrders, (reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : 'Data gagal dimuat.',
        ),
      )
  }, [])
  const metrics = useMemo(() => {
    const today = new Date().toDateString()
    const todayOrders = orders.filter(
      (order) =>
        new Date(order.createdAt).toDateString() === today &&
        order.status !== 'cancelled',
    )
    const revenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
    const counts = new Map<string, number>()
    todayOrders
      .flatMap((order) => order.items)
      .forEach((item) =>
        counts.set(item.name, (counts.get(item.name) ?? 0) + item.quantity),
      )
    const best =
      [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Belum ada'
    return {
      count: todayOrders.length,
      revenue,
      active: orders.filter(
        (order) => !['completed', 'cancelled'].includes(order.status),
      ).length,
      average: todayOrders.length ? revenue / todayOrders.length : 0,
      best,
    }
  }, [orders])
  const cards = [
    [ClipboardList, 'Pesanan Hari Ini', String(metrics.count)],
    [CircleDollarSign, 'Pendapatan Hari Ini', formatRupiah(metrics.revenue)],
    [Clock3, 'Pesanan Aktif', String(metrics.active)],
    [TrendingUp, 'Rata-rata Pesanan', formatRupiah(metrics.average)],
    [Utensils, 'Menu Terlaris', metrics.best],
  ] as const
  return (
    <section>
      <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
        Operasional hari ini
      </p>
      <h1 className="font-display mt-2 text-4xl">Ringkasan Restoran</h1>
      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([Icon, label, value]) => (
          <article
            key={label}
            className="rounded-2xl border border-stone-200 bg-white p-5"
          >
            <Icon className="text-terracotta" />
            <p className="mt-4 text-sm text-stone-500">{label}</p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
