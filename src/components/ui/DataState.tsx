import { RefreshCw, Utensils } from 'lucide-react'

export function MenuLoadingState() {
  return (
    <section
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
      aria-busy="true"
      aria-label="Memuat menu"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-2xl bg-stone-200"
          />
        ))}
      </div>
    </section>
  )
}

export function MenuErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <span className="text-terracotta mx-auto grid size-16 place-items-center rounded-full bg-orange-100">
        <Utensils />
      </span>
      <h1 className="font-display mt-5 text-4xl">Menu belum dapat dimuat</h1>
      <p className="mt-3 text-stone-600">{message}</p>
      <button
        onClick={onRetry}
        className="bg-terracotta mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-white"
      >
        <RefreshCw size={17} /> Coba lagi
      </button>
    </section>
  )
}
