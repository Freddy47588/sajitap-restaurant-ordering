import { Link } from 'react-router-dom'
export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-terracotta font-bold">404</p>
      <h1 className="font-display mt-2 text-5xl">Halaman tidak ditemukan</h1>
      <p className="mt-4 text-stone-600">
        Sepertinya halaman yang Anda tuju tidak tersedia.
      </p>
      <Link
        to="/"
        className="bg-terracotta mt-7 inline-block rounded-xl px-5 py-3 font-bold text-white"
      >
        Kembali ke Beranda
      </Link>
    </section>
  )
}
