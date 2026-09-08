import { LogOut, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStaffAuth } from '../hooks/useStaffAuth'

const roleLabels = {
  admin: 'Administrator',
  kitchen: 'Tim Dapur',
  cashier: 'Kasir',
  waiter: 'Pelayan',
}
export function StaffHomePage() {
  const { profile, signOut } = useStaffAuth()
  const navigate = useNavigate()
  if (!profile) return null
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
            Area operasional
          </p>
          <h1 className="font-display mt-2 text-4xl">
            Selamat datang, {profile.fullName}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-stone-600">
            <ShieldCheck size={18} /> {roleLabels[profile.role]}
          </p>
        </div>
        <button
          onClick={async () => {
            await signOut()
            navigate('/staff/login')
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 font-bold"
        >
          <LogOut size={17} /> Keluar
        </button>
      </div>
      <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-8">
        <h2 className="font-display text-3xl">Ruang kerja siap</h2>
        <p className="mt-3 max-w-xl text-stone-600">
          Akun dan peran Anda telah diverifikasi. Modul operasional untuk peran
          ini akan tersedia pada fase berikutnya.
        </p>
      </div>
    </section>
  )
}
