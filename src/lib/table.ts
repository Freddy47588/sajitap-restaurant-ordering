export const withTable = (path: string, table: string | null) =>
  table
    ? `${path}${path.includes('?') ? '&' : '?'}table=${encodeURIComponent(table)}`
    : path

export const tableFromUrl = (pathname: string, search: string) => {
  const routeMatch = pathname.match(/^\/t\/([^/]+)\/?$/)
  return routeMatch?.[1] ?? new URLSearchParams(search).get('table')
}

export const tableOrderUrl = (
  tableNumber: string,
  origin: string,
  qrToken?: string,
) => {
  const base = `${origin.replace(/\/$/, '')}/t/${encodeURIComponent(tableNumber)}`
  return qrToken ? `${base}?token=${encodeURIComponent(qrToken)}` : base
}
