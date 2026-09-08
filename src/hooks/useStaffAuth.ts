import { createContext, useContext } from 'react'
import type { StaffProfile } from '../types/staff'

export interface StaffAuthValue {
  profile: StaffProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<StaffProfile>
  signOut: () => Promise<void>
}

export const StaffAuthContext = createContext<StaffAuthValue | null>(null)
export function useStaffAuth() {
  const value = useContext(StaffAuthContext)
  if (!value)
    throw new Error('useStaffAuth harus digunakan di dalam StaffAuthProvider.')
  return value
}
