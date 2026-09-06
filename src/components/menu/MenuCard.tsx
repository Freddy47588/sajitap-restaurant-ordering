import { ArrowUpRight, CircleAlert } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import type { MenuItem } from '../../types/menu'
import { formatRupiah } from '../../lib/format'
import { withTable } from '../../lib/table'
export function MenuCard({ item }: { item: MenuItem }) {
  const location = useLocation()
  const table = new URLSearchParams(location.search).get('table')
  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
          onError={(event) => {
            if (!event.currentTarget.src.endsWith('sate-ayam.jpg')) {
              event.currentTarget.src = '/assets/images/sate-ayam.jpg'
            }
          }}
        />
        <span
          className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold ${item.available ? 'bg-white/95 text-emerald-700' : 'bg-stone-900/85 text-white'}`}
        >
          {item.available ? 'Tersedia' : 'Habis'}
        </span>
      </div>
      <div className="p-4">
        <p className="text-terracotta text-xs font-semibold tracking-wide uppercase">
          {item.category}
        </p>
        <div className="mt-1 flex items-start justify-between gap-2">
          <h3 className="text-lg leading-tight font-bold">{item.name}</h3>
          <Link
            aria-label={`Lihat ${item.name}`}
            to={withTable(`/menu/${item.id}`, table)}
            className="text-terracotta hover:bg-terracotta grid size-8 shrink-0 place-items-center rounded-full bg-orange-50 hover:text-white"
          >
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <p className="mt-2 text-sm text-stone-500">
          {formatRupiah(item.price)}
        </p>
        {!item.available && (
          <p className="mt-3 flex items-center gap-1 text-xs text-stone-500">
            <CircleAlert size={13} /> Akan tersedia kembali segera
          </p>
        )}
      </div>
    </article>
  )
}
