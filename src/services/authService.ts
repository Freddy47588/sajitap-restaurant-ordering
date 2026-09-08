import type { StaffProfile, StaffRole } from '../types/staff'

const localProfiles: Record<string, StaffProfile & { password: string }> = {
  'admin@sajitap.local': {
    id: 'local-admin',
    restaurantId: 'sajitap-demo',
    fullName: 'Admin SajiTap',
    role: 'admin',
    password: 'demo-admin',
  },
  'kitchen@sajitap.local': {
    id: 'local-kitchen',
    restaurantId: 'sajitap-demo',
    fullName: 'Tim Dapur',
    role: 'kitchen',
    password: 'demo-kitchen',
  },
  'cashier@sajitap.local': {
    id: 'local-cashier',
    restaurantId: 'sajitap-demo',
    fullName: 'Kasir SajiTap',
    role: 'cashier',
    password: 'demo-cashier',
  },
}

const usesLocalData = () =>
  import.meta.env.VITE_DATA_MODE === 'local' ||
  (!import.meta.env.VITE_DATA_MODE && import.meta.env.DEV)
const storageKey = 'sajitap-dev-staff-session'

const loadSupabaseProfile = async (
  userId: string,
): Promise<StaffProfile | null> => {
  const { requireSupabase } = await import('../lib/supabase')
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('id, restaurant_id, full_name, role')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error(`Profil staf gagal dimuat: ${error.message}`)
  return data
    ? {
        id: data.id,
        restaurantId: data.restaurant_id,
        fullName: data.full_name,
        role: data.role as StaffRole,
      }
    : null
}

export const authService = {
  async subscribe(
    callback: (profile: StaffProfile | null) => void,
  ): Promise<() => void> {
    if (usesLocalData()) {
      const listener = () => {
        void authService.getCurrentStaff().then(callback)
      }
      window.addEventListener('storage', listener)
      return () => window.removeEventListener('storage', listener)
    }
    const { requireSupabase } = await import('../lib/supabase')
    const { data } = requireSupabase().auth.onAuthStateChange(
      (_event, session) => {
        window.setTimeout(() => {
          if (session) void loadSupabaseProfile(session.user.id).then(callback)
          else callback(null)
        }, 0)
      },
    )
    return () => data.subscription.unsubscribe()
  },
  async getCurrentStaff(): Promise<StaffProfile | null> {
    if (usesLocalData()) {
      const saved = localStorage.getItem(storageKey)
      return saved ? (JSON.parse(saved) as StaffProfile) : null
    }
    const { requireSupabase } = await import('../lib/supabase')
    const { data, error } = await requireSupabase().auth.getSession()
    if (error) throw new Error(`Sesi gagal dimuat: ${error.message}`)
    return data.session ? loadSupabaseProfile(data.session.user.id) : null
  },

  async signIn(email: string, password: string): Promise<StaffProfile> {
    if (usesLocalData()) {
      const account = localProfiles[email.trim().toLowerCase()]
      if (!account || account.password !== password)
        throw new Error('Email atau kata sandi tidak sesuai.')
      const profile: StaffProfile = {
        id: account.id,
        restaurantId: account.restaurantId,
        fullName: account.fullName,
        role: account.role,
      }
      localStorage.setItem(storageKey, JSON.stringify(profile))
      return profile
    }
    const { requireSupabase } = await import('../lib/supabase')
    const client = requireSupabase()
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw new Error('Email atau kata sandi tidak sesuai.')
    const profile = await loadSupabaseProfile(data.user.id)
    if (!profile) {
      await client.auth.signOut()
      throw new Error('Akun ini tidak memiliki akses staf.')
    }
    return profile
  },

  async signOut() {
    if (usesLocalData()) {
      localStorage.removeItem(storageKey)
      return
    }
    const { requireSupabase } = await import('../lib/supabase')
    const { error } = await requireSupabase().auth.signOut()
    if (error) throw new Error(`Gagal keluar: ${error.message}`)
  },
}
