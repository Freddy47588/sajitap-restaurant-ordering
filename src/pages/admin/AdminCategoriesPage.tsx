import { ArrowDown, ArrowUp, Plus, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminService, type ManagedCategory } from '../../services/adminService'

export function AdminCategoriesPage() {
  const [items, setItems] = useState<ManagedCategory[]>([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  useEffect(() => {
    void adminService.listCategories().then(setItems)
  }, [])
  const persist = async (next: ManagedCategory[]) => {
    const normalized = next.map((item, index) => ({
      ...item,
      sortOrder: index + 1,
    }))
    setItems(normalized)
    try {
      await adminService.saveCategories(normalized)
      setMessage('Kategori tersimpan.')
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Gagal menyimpan kategori.',
      )
    }
  }
  const move = (index: number, direction: number) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target]!, next[index]!]
    void persist(next)
  }
  return (
    <section>
      <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
        Susunan katalog
      </p>
      <h1 className="font-display mt-2 text-4xl">Kelola Kategori</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const trimmed = name.trim()
          if (
            !trimmed ||
            items.some(
              (item) => item.name.toLowerCase() === trimmed.toLowerCase(),
            )
          )
            return
          void persist([
            ...items,
            {
              id: crypto.randomUUID(),
              name: trimmed,
              sortOrder: items.length + 1,
              active: true,
            },
          ])
          setName('')
        }}
        className="mt-6 flex gap-3 rounded-2xl bg-white p-4"
      >
        <input
          aria-label="Nama kategori baru"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nama kategori baru"
          className="min-w-0 flex-1 rounded-xl border p-3"
        />
        <button className="bg-terracotta inline-flex items-center gap-2 rounded-xl px-4 font-bold text-white">
          <Plus size={17} /> Tambah
        </button>
      </form>
      {message && (
        <p role="status" className="mt-3 text-sm text-stone-600">
          {message}
        </p>
      )}
      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-stone-100 font-bold">
              {index + 1}
            </span>
            <input
              aria-label={`Nama kategori ${index + 1}`}
              value={item.name}
              onChange={(event) =>
                setItems((current) =>
                  current.map((entry) =>
                    entry.id === item.id
                      ? { ...entry, name: event.target.value }
                      : entry,
                  ),
                )
              }
              className="min-w-40 flex-1 rounded-lg border p-2 font-bold"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.active}
                onChange={() =>
                  setItems((current) =>
                    current.map((entry) =>
                      entry.id === item.id
                        ? { ...entry, active: !entry.active }
                        : entry,
                    ),
                  )
                }
              />{' '}
              Aktif
            </label>
            <button
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label="Naikkan kategori"
              className="grid size-9 place-items-center rounded-lg border disabled:opacity-30"
            >
              <ArrowUp size={16} />
            </button>
            <button
              onClick={() => move(index, 1)}
              disabled={index === items.length - 1}
              aria-label="Turunkan kategori"
              className="grid size-9 place-items-center rounded-lg border disabled:opacity-30"
            >
              <ArrowDown size={16} />
            </button>
          </article>
        ))}
      </div>
      <button
        onClick={() => void persist(items)}
        className="bg-ink mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-white"
      >
        <Save size={17} /> Simpan Perubahan
      </button>
    </section>
  )
}
