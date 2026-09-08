import { Component, type ErrorInfo, type ReactNode } from 'react'
import { CircleAlert, RefreshCw } from 'lucide-react'

export class AppErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('SajiTap render error', error, info)
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf4] px-4">
        <section className="max-w-lg text-center">
          <CircleAlert className="mx-auto text-red-600" size={52} />
          <h1 className="font-display mt-5 text-4xl">
            SajiTap mengalami kendala
          </h1>
          <p className="mt-3 text-stone-600">
            Halaman tidak dapat ditampilkan. Muat ulang untuk mencoba kembali
            tanpa menghapus keranjang Anda.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-terracotta mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-white"
          >
            <RefreshCw size={17} /> Muat Ulang
          </button>
        </section>
      </main>
    )
  }
}
