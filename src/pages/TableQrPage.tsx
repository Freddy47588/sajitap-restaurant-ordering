import { ChevronLeft, QrCode } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TableQrCard } from '../components/tables/TableQrCard'
import { restaurantTables } from '../data/tables'

export function TableQrPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        to="/"
        className="hover:text-terracotta inline-flex items-center gap-1 text-sm font-semibold text-stone-600 print:hidden"
      >
        <ChevronLeft size={17} /> Kembali ke beranda
      </Link>
      <div className="mt-6 flex items-start gap-4">
        <span className="text-terracotta grid size-12 shrink-0 place-items-center rounded-xl bg-orange-100">
          <QrCode />
        </span>
        <div>
          <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
            Pengelolaan meja
          </p>
          <h1 className="font-display mt-1 text-4xl">Kode QR Meja</h1>
          <p className="mt-3 max-w-2xl text-stone-600 print:hidden">
            Setiap QR memakai tautan meja yang stabil. Unduh kode untuk signage
            meja atau cetak langsung dari halaman ini.
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2">
        {restaurantTables.map((table) => (
          <TableQrCard key={table.id} table={table} />
        ))}
      </div>
    </section>
  )
}
