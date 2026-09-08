import { Plus, RefreshCw, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { TableQrCard } from '../../components/tables/TableQrCard'
import { adminService } from '../../services/adminService'
import type { RestaurantTable } from '../../types/table'

export function AdminTablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [message, setMessage] = useState('')
  useEffect(() => {
    void adminService.listTables().then(setTables)
  }, [])
  const save = async (next = tables) => {
    const duplicate =
      new Set(next.map((table) => table.number)).size !== next.length
    if (duplicate) {
      setMessage('Nomor meja tidak boleh duplikat.')
      return
    }
    try {
      await adminService.saveTables(next)
      setTables(next)
      setMessage('Data meja tersimpan.')
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Meja gagal disimpan.',
      )
    }
  }
  const add = () => {
    const number = String(
      Math.max(0, ...tables.map((table) => Number(table.number) || 0)) + 1,
    )
    setTables([
      ...tables,
      {
        id: '',
        number,
        label: `Meja ${number}`,
        qrToken: crypto.randomUUID(),
        active: true,
      },
    ])
  }
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
            Pengelolaan meja
          </p>
          <h1 className="font-display mt-2 text-4xl">Meja & Kode QR</h1>
        </div>
        <button
          onClick={add}
          className="bg-terracotta inline-flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-white"
        >
          <Plus size={17} /> Tambah Meja
        </button>
      </div>
      {message && (
        <p role="status" className="mt-4 rounded-xl bg-orange-50 p-3">
          {message}
        </p>
      )}
      <div className="mt-6 space-y-3">
        {tables.map((table) => (
          <article
            key={table.id || table.qrToken}
            className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-[120px_1fr_auto_auto]"
          >
            <input
              aria-label="Nomor meja"
              value={table.number}
              onChange={(event) =>
                setTables((current) =>
                  current.map((entry) =>
                    entry.qrToken === table.qrToken
                      ? { ...entry, number: event.target.value }
                      : entry,
                  ),
                )
              }
              className="rounded-xl border p-2"
            />
            <input
              aria-label="Label meja"
              value={table.label}
              onChange={(event) =>
                setTables((current) =>
                  current.map((entry) =>
                    entry.qrToken === table.qrToken
                      ? { ...entry, label: event.target.value }
                      : entry,
                  ),
                )
              }
              className="rounded-xl border p-2"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={table.active}
                onChange={() =>
                  setTables((current) =>
                    current.map((entry) =>
                      entry.qrToken === table.qrToken
                        ? { ...entry, active: !entry.active }
                        : entry,
                    ),
                  )
                }
              />{' '}
              Aktif
            </label>
            <button
              onClick={() =>
                setTables((current) =>
                  current.map((entry) =>
                    entry.qrToken === table.qrToken
                      ? { ...entry, qrToken: crypto.randomUUID() }
                      : entry,
                  ),
                )
              }
              className="inline-flex items-center gap-1 text-sm font-bold"
            >
              <RefreshCw size={15} /> Token
            </button>
          </article>
        ))}
      </div>
      <button
        onClick={() => void save()}
        className="bg-ink mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-white"
      >
        <Save size={17} /> Simpan Meja
      </button>
      <h2 className="font-display mt-10 text-3xl">Pratinjau QR</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => (
          <TableQrCard key={`qr-${table.qrToken}`} table={table} />
        ))}
      </div>
    </section>
  )
}
