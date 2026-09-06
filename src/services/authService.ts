import { requireSupabase } from '../lib/supabase'

export const authService = {
  async getSession() {
    const { data, error } = await requireSupabase().auth.getSession()
    if (error) throw new Error(`Sesi gagal dimuat: ${error.message}`)
    return data.session
  },
  async signOut() {
    const { error } = await requireSupabase().auth.signOut()
    if (error) throw new Error(`Gagal keluar: ${error.message}`)
  },
}
