import { LoaderCircle, ShieldAlert } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import type { StaffRole } from '../../types/staff'

export function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: StaffRole[]
  children: React.ReactNode
}) {
  const { profile, loading, error } = useStaffAuth()
  const location = useLocation()
  if (loading)
    return (
      <section className="grid min-h-[60vh] place-items-center">
        <p className="flex items-center gap-2 font-semibold text-stone-600">
          <LoaderCircle className="animate-spin" /> Memeriksa sesi staf…
        </p>
      </section>
    )
  if (error)
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShieldAlert className="mx-auto text-red-600" size={48} />
        <h1 className="font-display mt-5 text-4xl">
          Sesi tidak dapat diverifikasi
        </h1>
        <p className="mt-3 text-stone-600">{error}</p>
      </section>
    )
  if (!profile)
    return (
      <Navigate
        replace
        to={`/staff/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
      />
    )
  if (!allowedRoles.includes(profile.role))
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShieldAlert className="text-terracotta mx-auto" size={48} />
        <h1 className="font-display mt-5 text-4xl">Akses tidak diizinkan</h1>
        <p className="mt-3 text-stone-600">
          Peran Anda tidak memiliki izin untuk membuka halaman ini.
        </p>
      </section>
    )
  return children
}
