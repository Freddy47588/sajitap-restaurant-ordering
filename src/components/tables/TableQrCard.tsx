import { useEffect, useState } from 'react'
import { Copy, Download, Printer } from 'lucide-react'
import QRCode from 'qrcode'
import { tableOrderUrl } from '../../lib/table'
import { useToastStore } from '../../store/toastStore'
import type { RestaurantTable } from '../../types/table'

export function TableQrCard({ table }: { table: RestaurantTable }) {
  const [qrImage, setQrImage] = useState('')
  const [qrError, setQrError] = useState(false)
  const showToast = useToastStore((state) => state.show)
  const orderingUrl = tableOrderUrl(table.number, window.location.origin)

  useEffect(() => {
    let active = true
    QRCode.toDataURL(orderingUrl, {
      width: 360,
      margin: 2,
      color: { dark: '#29201c', light: '#fffaf4' },
      errorCorrectionLevel: 'M',
    })
      .then((value) => {
        if (active) setQrImage(value)
      })
      .catch(() => {
        if (active) setQrError(true)
      })
    return () => {
      active = false
    }
  }, [orderingUrl])

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(orderingUrl)
      showToast(`Tautan ${table.label} disalin`)
    } catch {
      showToast('Tautan tidak dapat disalin', 'info')
    }
  }
  const download = () => {
    if (!qrImage) return
    const link = document.createElement('a')
    link.href = qrImage
    link.download = `sajitap-meja-${table.number}.png`
    link.click()
    showToast(`QR ${table.label} diunduh`)
  }

  return (
    <article className="break-inside-avoid rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl">{table.label}</p>
          <p className="mt-1 text-xs text-stone-500">SajiTap — {table.label}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${table.active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}
        >
          {table.active ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>
      <div className="mt-4 grid aspect-square place-items-center rounded-xl bg-[#fffaf4] p-3">
        {qrError ? (
          <p className="text-center text-sm text-red-600">QR gagal dibuat.</p>
        ) : qrImage ? (
          <img
            src={qrImage}
            alt={`Kode QR pemesanan ${table.label}`}
            className="size-full"
          />
        ) : (
          <div
            className="size-3/4 animate-pulse rounded-xl bg-stone-200"
            aria-label="Membuat kode QR"
          />
        )}
      </div>
      <p className="mt-3 truncate text-xs text-stone-500" title={orderingUrl}>
        {orderingUrl}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={copyUrl}
          className="flex flex-col items-center gap-1 rounded-lg border border-stone-200 px-2 py-2 text-xs font-semibold hover:bg-orange-50"
        >
          <Copy size={16} /> Salin
        </button>
        <button
          onClick={download}
          disabled={!qrImage}
          className="flex flex-col items-center gap-1 rounded-lg border border-stone-200 px-2 py-2 text-xs font-semibold hover:bg-orange-50 disabled:opacity-40"
        >
          <Download size={16} /> Unduh
        </button>
        <button
          onClick={() => window.print()}
          className="flex flex-col items-center gap-1 rounded-lg border border-stone-200 px-2 py-2 text-xs font-semibold hover:bg-orange-50"
        >
          <Printer size={16} /> Cetak
        </button>
      </div>
    </article>
  )
}
