import {
  ArrowRight,
  Check,
  ClipboardList,
  ScanLine,
  Utensils,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { MenuCard } from '../components/menu/MenuCard'
import { MenuErrorState, MenuLoadingState } from '../components/ui/DataState'
import { useMenuCatalog } from '../hooks/useMenuCatalog'
import heroImage from '../assets/images/hero.png'
import { useTableContext } from '../hooks/useTableContext'
import { usePreferenceStore } from '../store/preferenceStore'

export function HomePage() {
  const { tableNumber: table, to } = useTableContext()
  const { items: menuItems, loading, error, retry } = useMenuCatalog()
  const recentIds = usePreferenceStore((state) => state.recentIds)
  const recentItems = recentIds
    .map((id) => menuItems.find((item) => item.id === id))
    .filter((item) => item !== undefined)
  if (loading) return <MenuLoadingState />
  if (error) return <MenuErrorState message={error} onRetry={retry} />
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-18">
        <div>
          <p className="text-terracotta mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-sm font-semibold">
            <span className="bg-terracotta size-2 rounded-full" /> Pesan dari
            meja Anda{table && ` · Meja ${table}`}
          </p>
          <h1 className="font-display text-5xl leading-[.98] sm:text-6xl">
            Makan enak, cukup <span className="text-terracotta">satu tap.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-600">
            Pilih hidangan favorit, atur pesanan, dan kirim langsung dari meja
            Anda. Hangat, mudah, dan tanpa menunggu pelayan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="bg-terracotta inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-white shadow-lg shadow-orange-950/15 transition hover:bg-[#7f2e18]"
              to={to('/menu')}
            >
              Lihat Menu <ArrowRight size={18} />
            </Link>
            <Link
              className="hover:border-terracotta hover:text-terracotta rounded-xl border border-stone-300 bg-white px-5 py-3 font-semibold"
              to={to('/menu')}
            >
              Pesan Sekarang
            </Link>
          </div>
          <div className="mt-9 flex gap-6 text-sm text-stone-600">
            <span className="flex items-center gap-2">
              <Check size={16} className="text-terracotta" /> Cepat & praktis
            </span>
            <span className="flex items-center gap-2">
              <Check size={16} className="text-terracotta" /> Dari meja Anda
            </span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-orange-100" />
          <img
            className="aspect-[4/4.4] w-full rounded-[1.75rem] object-cover shadow-xl"
            src={heroImage}
            alt="Sajian makanan Indonesia di SajiTap"
            fetchPriority="high"
            onError={(event) => {
              event.currentTarget.src = '/assets/images/sate-ayam.jpg'
            }}
          />
          <div className="absolute -bottom-5 -left-3 rounded-2xl bg-white p-4 shadow-lg sm:left-6">
            <p className="text-xs font-semibold tracking-wider text-stone-400 uppercase">
              Favorit pelanggan
            </p>
            <p className="mt-1 font-bold">Sate Ayam · 4,9 ★</p>
          </div>
        </div>
      </section>
      {recentItems.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
            Baru dilihat
          </p>
          <h2 className="font-display mt-2 text-3xl">Lanjutkan pilihan Anda</h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentItems.slice(0, 4).map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
              Pilihan populer
            </p>
            <h2 className="font-display mt-2 text-3xl">
              Yang paling dicari hari ini
            </h2>
          </div>
          <Link
            to={to('/menu')}
            className="text-terracotta hidden items-center gap-1 font-semibold sm:flex"
          >
            Semua menu <ArrowRight size={17} />
          </Link>
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {menuItems
            .filter((item) => item.featured)
            .slice(0, 4)
            .map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="bg-ink rounded-3xl px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-bold tracking-widest text-orange-300 uppercase">
            Cara kerja
          </p>
          <h2 className="font-display mt-2 text-3xl">Pesan tanpa ribet.</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              [ScanLine, '1. Pilih Menu', 'Temukan rasa yang Anda inginkan.'],
              [
                Utensils,
                '2. Tambahkan Pesanan',
                'Atur jumlah dan catatan khusus.',
              ],
              [
                ClipboardList,
                '3. Pesan dari Meja',
                'Kami siapkan pesanan Anda.',
              ],
            ].map(([Icon, title, text]) => {
              const StepIcon = Icon as typeof ScanLine
              return (
                <div key={title as string} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-orange-200">
                    <StepIcon size={21} />
                  </span>
                  <div>
                    <h3 className="font-bold">{title as string}</h3>
                    <p className="mt-1 text-sm text-stone-300">
                      {text as string}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
