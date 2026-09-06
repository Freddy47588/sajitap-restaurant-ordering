export const withTable = (path: string, table: string | null) => table ? `${path}${path.includes('?') ? '&' : '?'}table=${encodeURIComponent(table)}` : path
