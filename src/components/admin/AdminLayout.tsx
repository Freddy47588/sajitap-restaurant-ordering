import {
  BarChart3,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MenuSquare,
  QrCode,
  Tags,
  Users,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useStaffAuth } from '../../hooks/useStaffAuth'

const links = [
  ['/admin', 'Ringkasan', LayoutDashboard],
  ['/admin/orders', 'Pesanan', ClipboardList],
  ['/admin/menu', 'Menu', MenuSquare],
  ['/admin/categories', 'Kategori', Tags],
  ['/admin/tables', 'Meja & QR', QrCode],
  ['/admin/staff', 'Staf', Users],
  ['/admin/analytics', 'Analitik', BarChart3],
  ['/kitchen', 'Tampilan Dapur', ChefHat],
] as const

export function AdminLayout() {
  const { profile, signOut } = useStaffAuth()
  const navigate = useNavigate()
  return (
    <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-2xl bg-[#29201c] p-4 text-white lg:sticky lg:top-24">
        <p className="font-display px-3 py-2 text-2xl">SajiTap Admin</p>
        <p className="px-3 text-xs text-stone-400">{profile?.fullName}</p>
        <nav className="mt-5 space-y-1">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              end={to === '/admin'}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-orange-300 text-stone-900' : 'text-stone-300 hover:bg-white/10'}`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={async () => {
            await signOut()
            navigate('/staff/login')
          }}
          className="mt-5 flex w-full items-center gap-3 border-t border-white/10 px-3 pt-4 text-sm font-semibold text-stone-300"
        >
          <LogOut size={18} /> Keluar
        </button>
      </aside>
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
