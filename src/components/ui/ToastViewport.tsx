import { CheckCircle2, Info, X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

export function ToastViewport() {
  const { toasts, dismiss } = useToastStore()
  return (
    <div
      className="fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-xl"
        >
          {toast.tone === 'success' ? (
            <CheckCircle2 className="shrink-0 text-emerald-600" size={20} />
          ) : (
            <Info className="text-terracotta shrink-0" size={20} />
          )}
          <p className="flex-1 text-sm font-semibold">{toast.message}</p>
          <button
            onClick={() => dismiss(toast.id)}
            aria-label="Tutup notifikasi"
            className="text-stone-400 hover:text-stone-700"
          >
            <X size={17} />
          </button>
        </div>
      ))}
    </div>
  )
}
