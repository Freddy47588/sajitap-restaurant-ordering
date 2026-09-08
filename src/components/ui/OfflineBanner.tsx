import { WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [offline, setOffline] = useState(
    () => typeof navigator !== 'undefined' && !navigator.onLine,
  )
  useEffect(() => {
    const online = () => setOffline(false)
    const offlineHandler = () => setOffline(true)
    window.addEventListener('online', online)
    window.addEventListener('offline', offlineHandler)
    return () => {
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offlineHandler)
    }
  }, [])
  if (!offline) return null
  return (
    <div
      role="status"
      className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-900"
    >
      <span className="inline-flex items-center gap-2">
        <WifiOff size={16} /> Anda sedang offline. Menu tersimpan mungkin masih
        terlihat, tetapi pesanan baru memerlukan internet.
      </span>
    </div>
  )
}
