import { Clock3, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatRupiah } from '../lib/format'
import { getOrderStatusLabel } from '../lib/orderStatus'
import { withTable } from '../lib/table'
import { useOrderStore } from '../store/orderStore'

export function MyOrdersPage() {
  const orders = useOrderStore((state) => state.recentOrders)
  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
        Riwayat perangkat
      </p>
      <h1 className="font-display mt-2 text-4xl">Pesanan Saya</h1>
      <p className="mt-3 text-stone-600">
        Hanya pesanan yang dibuat dari perangkat ini yang ditampilkan.
      </p>
      {orders.length ? (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.orderCode}
              to={withTable(`/order/${order.orderCode}`, order.tableNumber)}
              className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-orange-300"
            >
              <span className="text-terracotta grid size-12 shrink-0 place-items-center rounded-xl bg-orange-100">
                <ReceiptText />
              </span>
              <span className="min-w-0 flex-1">
                <strong>{order.orderCode}</strong>
                <span className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                  <Clock3 size={14} />{' '}
                  {new Intl.DateTimeFormat('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(order.createdAt))}{' '}
                  · Meja {order.tableNumber}
                </span>
              </span>
              <span className="text-right">
                <strong className="text-terracotta block">
                  {formatRupiah(order.total)}
                </strong>
                <span className="text-xs text-stone-500">
                  {getOrderStatusLabel(order.status)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <ReceiptText className="mx-auto text-stone-400" size={40} />
          <h2 className="font-display mt-4 text-2xl">Belum ada pesanan</h2>
          <p className="mt-2 text-stone-500">
            Pesanan baru Anda akan tersimpan di sini.
          </p>
          <Link
            to="/menu"
            className="text-terracotta mt-5 inline-block font-bold"
          >
            Lihat Menu
          </Link>
        </div>
      )}
    </section>
  )
}
