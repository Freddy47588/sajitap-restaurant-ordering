import {
  BarChart3,
  Clock3,
  ShoppingBag,
  TrendingUp,
  Utensils,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { formatRupiah } from '../../lib/format'
import { orderService } from '../../services/orderService'
import type { PersistedOrder } from '../../types/order'

export function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<PersistedOrder[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    orderService
      .listAllForStaff()
      .then(setOrders, (reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : 'Analitik gagal dimuat.',
        ),
      )
  }, [])
  const data = useMemo(() => {
    const valid = orders.filter((order) => order.status !== 'cancelled')
    const revenue = valid.reduce((sum, order) => sum + order.total, 0)
    const menu = new Map<string, number>()
    const categories = new Map<string, number>()
    const hours = new Map<number, number>()
    valid.forEach((order) => {
      hours.set(
        new Date(order.createdAt).getHours(),
        (hours.get(new Date(order.createdAt).getHours()) ?? 0) + 1,
      )
      order.items.forEach((item) => {
        menu.set(item.name, (menu.get(item.name) ?? 0) + item.quantity)
        categories.set(
          item.category,
          (categories.get(item.category) ?? 0) + item.quantity,
        )
      })
    })
    const days = Array.from({ length: 7 }, (_, offset) => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() - (6 - offset))
      return {
        key: date.toISOString().slice(0, 10),
        label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(
          date,
        ),
        count: 0,
      }
    })
    valid.forEach((order) => {
      const day = days.find(
        (entry) =>
          entry.key === new Date(order.createdAt).toISOString().slice(0, 10),
      )
      if (day) day.count += 1
    })
    return {
      total: valid.length,
      revenue,
      average: valid.length ? revenue / valid.length : 0,
      bestMenu: [...menu.entries()].sort((a, b) => b[1] - a[1])[0],
      bestCategory: [...categories.entries()].sort((a, b) => b[1] - a[1])[0],
      busiestHour: [...hours.entries()].sort((a, b) => b[1] - a[1])[0],
      days,
    }
  }, [orders])
  const maxDay = Math.max(1, ...data.days.map((day) => day.count))
  return (
    <section>
      <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
        Data transaksi aktual
      </p>
      <h1 className="font-display mt-2 text-4xl">Analitik Restoran</h1>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>
      )}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          [ShoppingBag, 'Total Pesanan', String(data.total)],
          [TrendingUp, 'Total Pendapatan', formatRupiah(data.revenue)],
          [BarChart3, 'Rata-rata Pesanan', formatRupiah(data.average)],
          [
            Utensils,
            'Menu Terlaris',
            data.bestMenu
              ? `${data.bestMenu[0]} (${data.bestMenu[1]})`
              : 'Belum ada',
          ],
          [
            Utensils,
            'Kategori Terpopuler',
            data.bestCategory
              ? `${data.bestCategory[0]} (${data.bestCategory[1]})`
              : 'Belum ada',
          ],
          [
            Clock3,
            'Jam Tersibuk',
            data.busiestHour
              ? `${String(data.busiestHour[0]).padStart(2, '0')}.00 (${data.busiestHour[1]} pesanan)`
              : 'Belum ada',
          ],
        ].map(([Icon, label, value]) => {
          const MetricIcon = Icon as typeof ShoppingBag
          return (
            <article
              key={label as string}
              className="rounded-2xl border bg-white p-5"
            >
              <MetricIcon className="text-terracotta" />
              <p className="mt-4 text-sm text-stone-500">{label as string}</p>
              <p className="mt-1 text-xl font-black">{value as string}</p>
            </article>
          )
        })}
      </div>
      <article className="mt-6 rounded-2xl border bg-white p-5">
        <h2 className="text-xl font-bold">Pesanan 7 Hari Terakhir</h2>
        <div className="mt-6 flex h-52 items-end gap-3">
          {data.days.map((day) => (
            <div
              key={day.key}
              className="flex h-full flex-1 flex-col justify-end text-center"
            >
              <span className="mb-2 text-sm font-bold">{day.count}</span>
              <div
                className="bg-terracotta mx-auto w-full max-w-14 rounded-t-lg"
                style={{
                  height: `${Math.max(day.count ? 8 : 2, (day.count / maxDay) * 80)}%`,
                }}
              />
              <span className="mt-2 text-xs text-stone-500">{day.label}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
