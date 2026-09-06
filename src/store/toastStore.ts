import { create } from 'zustand'

type ToastTone = 'success' | 'info'
interface ToastMessage {
  id: string
  message: string
  tone: ToastTone
}
interface ToastState {
  toasts: ToastMessage[]
  show: (message: string, tone?: ToastTone) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, tone = 'success') => {
    const id = crypto.randomUUID()
    set((state) => ({
      toasts: [...state.toasts, { id, message, tone }].slice(-3),
    }))
    window.setTimeout(() => get().dismiss(id), 2600)
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
