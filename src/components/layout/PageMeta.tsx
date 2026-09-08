import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const defaultDescription =
  'Pesan menu restoran langsung dari meja Anda dengan SajiTap.'

const titleForPath = (path: string) => {
  if (path.startsWith('/menu/')) return 'Detail Menu'
  if (path === '/menu') return 'Menu'
  if (path === '/cart') return 'Keranjang'
  if (path === '/checkout') return 'Konfirmasi Pesanan'
  if (path === '/orders') return 'Pesanan Saya'
  if (path.startsWith('/order/')) return 'Lacak Pesanan'
  if (path.startsWith('/admin')) return 'Administrasi Restoran'
  if (path === '/kitchen') return 'Dapur'
  if (path === '/cashier') return 'Kasir'
  if (path.startsWith('/staff')) return 'Akses Staf'
  return 'Pesan dari Meja'
}

export function PageMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const title = `${titleForPath(pathname)} | SajiTap`
    const privatePage =
      pathname.startsWith('/order') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/staff') ||
      pathname === '/kitchen' ||
      pathname === '/cashier' ||
      pathname === '/checkout' ||
      pathname === '/cart'
    document.title = title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', defaultDescription)
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', title)
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute(
        'content',
        privatePage ? 'noindex, nofollow' : 'index, follow',
      )
  }, [pathname])

  return null
}
