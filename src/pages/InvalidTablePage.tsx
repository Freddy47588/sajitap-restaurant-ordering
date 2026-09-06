import { CircleAlert, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export function InvalidTablePage({
  tableNumber,
  inactive,
}: {
  tableNumber: string
  inactive: boolean
}) {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-red-50 text-red-600">
        <CircleAlert size={30} />
      </span>
      <p className="text-terracotta mt-6 text-sm font-bold tracking-widest uppercase">
        Akses meja
      </p>
      <h1 className="font-display mt-2 text-4xl">Meja tidak tersedia</h1>
      <p className="mt-4 text-stone-600">
        {inactive
          ? `Meja ${tableNumber} sedang tidak menerima pesanan.`
          : `Tautan meja “${tableNumber}” tidak dikenali.`}{' '}
        Silakan pindai ulang kode QR di meja Anda atau hubungi staf restoran.
      </p>
      <Link
        to="/"
        className="bg-terracotta mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-white"
      >
        <Home size={18} /> Kembali ke beranda
      </Link>
    </section>
  )
}
