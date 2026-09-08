import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Menu,
  ReceiptText,
  ShoppingBag,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { cartItemCount, useCartStore } from '../../store/cartStore'
import { useTableContext } from '../../hooks/useTableContext'
import { TableContextSync } from './TableContextSync'
import { ToastViewport } from '../ui/ToastViewport'
import { OfflineBanner } from '../ui/OfflineBanner'
import { PageMeta } from './PageMeta'

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { tableNumber: table, to } = useTableContext()
  const count = useCartStore((state) => cartItemCount(state.items))
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `transition hover:text-terracotta ${isActive ? 'text-terracotta font-semibold' : ''}`
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="bg-ink fixed top-2 left-2 z-[100] -translate-y-20 rounded-lg px-4 py-2 font-bold text-white transition focus:translate-y-0"
      >
        Lewati ke konten utama
      </a>
      <TableContextSync />
      <PageMeta />
      <OfflineBanner />
      <header className="bg-cream/95 sticky top-0 z-30 border-b border-stone-200 backdrop-blur">
        <nav className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            to={to('/')}
            className="flex items-center gap-2 text-xl font-bold"
          >
            <img src="/brand/sajitap-logo.svg" alt="" className="size-9" />
            SajiTap
          </Link>
          <div className="hidden items-center gap-7 text-sm md:flex">
            <NavLink end className={navClass} to={to('/')}>
              Beranda
            </NavLink>
            <NavLink className={navClass} to={to('/menu')}>
              Menu
            </NavLink>
            <NavLink className={navClass} to={to('/orders')}>
              Pesanan Saya
            </NavLink>
          </div>
          <div className="flex items-center gap-2">
            {table && (
              <span className="hidden items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold text-stone-700 sm:flex">
                <UtensilsCrossed size={14} className="text-terracotta" /> Meja{' '}
                {table}
              </span>
            )}
            <Link
              aria-label="Keranjang"
              to={to('/cart')}
              className="relative grid size-10 place-items-center rounded-full hover:bg-orange-100"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="bg-terracotta absolute -top-1 -right-1 grid size-5 place-items-center rounded-full text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
            <button
              className="grid size-10 place-items-center rounded-full hover:bg-orange-100 md:hidden"
              aria-label={open ? 'Tutup navigasi' : 'Buka navigasi'}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
        {open && (
          <div
            id="mobile-navigation"
            className="bg-cream border-t border-stone-200 px-6 py-4 md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-3">
              <NavLink
                end
                onClick={() => setOpen(false)}
                className={navClass}
                to={to('/')}
              >
                Beranda
              </NavLink>
              <NavLink
                onClick={() => setOpen(false)}
                className={navClass}
                to={to('/menu')}
              >
                Menu
              </NavLink>
              <NavLink
                onClick={() => setOpen(false)}
                className={navClass}
                to={to('/orders')}
              >
                <span className="inline-flex items-center gap-2">
                  <ReceiptText size={16} /> Pesanan Saya
                </span>
              </NavLink>
            </div>
          </div>
        )}
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="mt-16 border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <strong className="text-ink">SajiTap</strong>
            <span className="ml-2">Tap. Order. Enjoy.</span>
          </div>
          <p>Restaurant table-ordering experience · Portfolio project</p>
        </div>
      </footer>
      <ToastViewport />
    </div>
  )
}
