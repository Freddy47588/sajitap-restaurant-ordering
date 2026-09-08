import { useCallback, useEffect, useMemo, useState } from 'react'
import { StaffAuthContext } from '../hooks/useStaffAuth'
import { authService } from '../services/authService'
import type { StaffProfile } from '../types/staff'

export function StaffAuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    authService.getCurrentStaff().then(
      (value) => {
        if (active) {
          setProfile(value)
          setLoading(false)
        }
      },
      (reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : 'Sesi gagal dimuat.',
          )
          setLoading(false)
        }
      },
    )
    return () => {
      active = false
    }
  }, [])
  useEffect(() => {
    let cleanup: (() => void) | undefined
    void authService.subscribe(setProfile).then((value) => {
      cleanup = value
    })
    return () => cleanup?.()
  }, [])
  const signIn = useCallback(async (email: string, password: string) => {
    const value = await authService.signIn(email, password)
    setProfile(value)
    setError(null)
    return value
  }, [])
  const signOut = useCallback(async () => {
    await authService.signOut()
    setProfile(null)
  }, [])
  const value = useMemo(
    () => ({ profile, loading, error, signIn, signOut }),
    [error, loading, profile, signIn, signOut],
  )
  return (
    <StaffAuthContext.Provider value={value}>
      {children}
    </StaffAuthContext.Provider>
  )
}
