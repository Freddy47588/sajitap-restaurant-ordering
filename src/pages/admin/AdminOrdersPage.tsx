import { useEffect, useMemo, useState } from 'react'
import { formatRupiah } from '../../lib/format'
import { getOrderStatusLabel } from '../../lib/orderStatus'
import { orderService } from '../../services/orderService'
import { orderStatuses, type PersistedOrder } from '../../types/order'

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<PersistedOrder[]>([])
  const [status, setStatus] = useState('all')
  const [table, setTable] = useState('')
  const [date, setDate] = useState('')
  useEffect(() => {
    void orderService.listAllForStaff().then(setOrders)
  }, [])
  const filtered = useMemo(
    () =>
      orders.filter(
        (order) =>
          (status === 'all' || order.status === status) &&
          (!table || order.tableNumber === table) &&
          (!date || order.createdAt.startsWith(date)),
      ),
    [date, orders, status, table],
  )
  return (
    <section>
      <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
        Manajemen pesanan
      </p>
      <h1 className="font-display mt-2 text-4xl">Semua Pesanan</h1>
      <div className="mt-6 grid gap-3 rounded-2xl bg-white p-4 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-stone-300 p-3 font-normal"
          >
            <option value="all">Semua status</option>
            {orderStatuses.map((entry) => (
              <option key={entry} value={entry}>
                {getOrderStatusLabel(entry)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Nomor meja
          <input
            value={table}
            onChange={(event) => setTable(event.target.value)}
            inputMode="numeric"
            className="rounded-xl border border-stone-300 p-3 font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Tanggal
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-xl border border-stone-300 p-3 font-normal"
          />
        </label>
      </div>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <caption className="sr-only">Daftar pesanan restoran</caption>
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="p-4">Kode</th>
              <th className="p-4">Meja</th>
              <th className="p-4">Waktu</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-t border-stone-100">
                <td className="p-4 font-bold">{order.orderCode}</td>
                <td className="p-4">Meja {order.tableNumber}</td>
                <td className="p-4">
                  {new Intl.DateTimeFormat('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(order.createdAt))}
                </td>
                <td className="p-4">{getOrderStatusLabel(order.status)}</td>
                <td className="p-4 text-right font-bold">
                  {formatRupiah(order.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <p className="p-8 text-center text-stone-500">
            Tidak ada pesanan sesuai filter.
          </p>
        )}
      </div>
    </section>
  )
}
