import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { MenuCard } from '../components/menu/MenuCard'
import { MenuErrorState, MenuLoadingState } from '../components/ui/DataState'
import { useMenuCatalog } from '../hooks/useMenuCatalog'
import { categories } from '../data/menu'
import { usePreferenceStore } from '../store/preferenceStore'
export function MenuPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('Semua')
  const [sort, setSort] = useState('recommended')
  const favoriteIds = usePreferenceStore((state) => state.favoriteIds)
  const { items: menuItems, loading, error, retry } = useMenuCatalog()
  if (loading) return <MenuLoadingState />
  if (error) return <MenuErrorState message={error} onRetry={retry} />
  const filtered = menuItems
    .filter(
      (item) =>
        (category === 'Semua' ||
          (category === 'Favorit'
            ? favoriteIds.includes(item.id)
            : item.category === category)) &&
        item.name.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'low'
        ? a.price - b.price
        : sort === 'high'
          ? b.price - a.price
          : Number(b.featured) - Number(a.featured),
    )
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
        Jelajahi rasa
      </p>
      <h1 className="font-display mt-2 text-4xl">Menu untuk meja Anda</h1>
      <p className="mt-3 text-stone-600">
        Semua pesanan dibuat saat Anda mengirimkannya.
      </p>
      <div className="mt-8 flex flex-col gap-3 lg:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-xl border border-stone-300 bg-white px-4 py-3">
          <Search size={19} className="text-stone-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent outline-none"
            placeholder="Cari menu"
            aria-label="Cari menu"
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-3">
          <SlidersHorizontal size={18} className="text-stone-500" />
          <span className="sr-only">Urutkan menu</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="bg-transparent outline-none"
          >
            <option value="recommended">Rekomendasi</option>
            <option value="low">Harga terendah</option>
            <option value="high">Harga tertinggi</option>
          </select>
        </label>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {categories.map((entry) => (
          <button
            key={entry}
            onClick={() => setCategory(entry)}
            aria-pressed={category === entry}
            className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap ${category === entry ? 'bg-terracotta text-white' : 'hover:ring-terracotta bg-white text-stone-600 ring-1 ring-stone-200'}`}
          >
            {entry}
          </button>
        ))}
      </div>
      {filtered.length ? (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <h2 className="font-display text-2xl">Menu tidak ditemukan</h2>
          <p className="mt-2 text-stone-500">
            Coba kata kunci atau kategori lain.
          </p>
          <button
            onClick={() => {
              setQuery('')
              setCategory('Semua')
            }}
            className="text-terracotta mt-4 font-semibold"
          >
            Reset pencarian
          </button>
        </div>
      )}
    </section>
  )
}
