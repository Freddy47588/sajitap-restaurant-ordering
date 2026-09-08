import { ShieldCheck, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import type { StaffProfile } from '../../types/staff'

const labels = {
  admin: 'Administrator',
  kitchen: 'Dapur',
  cashier: 'Kasir',
  waiter: 'Pelayan',
}
export function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    adminService
      .listStaff()
      .then(setStaff, (reason: unknown) =>
        setError(
          reason instanceof Error ? reason.message : 'Staf gagal dimuat.',
        ),
      )
  }, [])
  return (
    <section>
      <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
        Akses restoran
      </p>
      <h1 className="font-display mt-2 text-4xl">Staf</h1>
      <p className="mt-3 text-stone-600">
        Akun Auth harus diprovisikan melalui lingkungan tepercaya sebelum profil
        peran ditambahkan.
      </p>
      {error && <p className="mt-4 bg-red-50 p-3 text-red-700">{error}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {staff.map((person) => (
          <article
            key={person.id}
            className="flex items-center gap-4 rounded-2xl border bg-white p-5"
          >
            <span className="text-terracotta grid size-11 place-items-center rounded-full bg-orange-100">
              <Users />
            </span>
            <div className="flex-1">
              <p className="font-bold">{person.fullName}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                <ShieldCheck size={14} /> {labels[person.role]}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
