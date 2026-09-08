import { LoaderCircle, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useStaffAuth } from '../hooks/useStaffAuth'
import { staffDestination, staffHomeByRole } from '../lib/staffRoutes'

export function StaffLoginPage() {
  const { profile, signIn } = useStaffAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  if (profile) return <Navigate replace to={staffHomeByRole[profile.role]} />
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const staff = await signIn(email, password)
      const requested = params.get('redirect')
      navigate(staffDestination(staff.role, requested), {
        replace: true,
      })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Gagal masuk.')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg sm:p-8">
        <span className="text-terracotta grid size-12 place-items-center rounded-xl bg-orange-100">
          <LockKeyhole />
        </span>
        <p className="text-terracotta mt-6 text-sm font-bold tracking-widest uppercase">
          Area Staf SajiTap
        </p>
        <h1 className="font-display mt-2 text-4xl">Masuk ke SajiTap</h1>
        <p className="mt-3 text-sm text-stone-600">
          Masuk menggunakan akun staf restoran untuk mengakses dashboard sesuai
          peran Anda.
        </p>
        <p className="mt-2 text-xs font-semibold tracking-wide text-stone-500">
          Admin • Dapur • Kasir • Pelayan
        </p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block font-semibold">
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="focus:border-terracotta mt-2 w-full rounded-xl border border-stone-300 p-3 font-normal outline-none"
            />
          </label>
          <label className="block font-semibold">
            Kata sandi
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="focus:border-terracotta mt-2 w-full rounded-xl border border-stone-300 p-3 font-normal outline-none"
            />
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <button
            disabled={submitting}
            className="bg-terracotta flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white disabled:opacity-60"
          >
            {submitting && <LoaderCircle className="animate-spin" size={18} />}
            {submitting ? 'Memeriksa…' : 'Masuk'}
          </button>
        </form>
        {import.meta.env.DEV && (
          <div className="mt-6 rounded-xl bg-stone-50 p-3 text-xs text-stone-500">
            <strong>Akun demo lokal</strong>
            <p className="mt-1">admin@sajitap.local / demo-admin</p>
            <p>kitchen@sajitap.local / demo-kitchen</p>
            <p>cashier@sajitap.local / demo-cashier</p>
            <p>waiter@sajitap.local / demo-waiter</p>
          </div>
        )}
      </div>
    </section>
  )
}
