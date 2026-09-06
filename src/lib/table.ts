export const withTable = (path: string, table: string | null) =>
  table
    ? `${path}${path.includes('?') ? '&' : '?'}table=${encodeURIComponent(table)}`
    : path

export const tableFromUrl = (pathname: string, search: string) => {
  const routeMatch = pathname.match(/^\/t\/(\d{1,3})\/?$/)
  return routeMatch?.[1] ?? new URLSearchParams(search).get('table')
}
