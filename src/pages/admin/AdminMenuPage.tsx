import { Pencil, Plus, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { useState } from 'react'
import { useMenuCatalog } from '../../hooks/useMenuCatalog'
import { adminService } from '../../services/adminService'
import type { MenuCategory, MenuItem } from '../../types/menu'
import { formatRupiah } from '../../lib/format'
import { MenuOptionsEditor } from '../../components/admin/MenuOptionsEditor'

const categoryChoices: MenuCategory[] = [
  'Makanan Utama',
  'Mie & Bakso',
  'Camilan',
  'Minuman',
  'Dessert',
]
const blankItem = (): MenuItem => ({
  id: '',
  code: '',
  name: '',
  description: '',
  price: 0,
  category: 'Makanan Utama',
  image: '/assets/images/sate-ayam.jpg',
  available: true,
  featured: false,
  preparationTime: '10–15 menit',
  optionGroups: [],
})

export function AdminMenuPage() {
  const { items, retry } = useMenuCatalog()
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const save = async (item: MenuItem) => {
    setSaving(true)
    try {
      const normalized = {
        ...item,
        id:
          item.id ||
          item.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-'),
        code: item.code || `MN-${Date.now().toString().slice(-4)}`,
      }
      await adminService.saveMenu(normalized)
      setEditing(null)
      setMessage('Menu berhasil disimpan.')
      retry()
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Menu gagal disimpan.',
      )
    } finally {
      setSaving(false)
    }
  }
  const toggle = async (item: MenuItem, field: 'available' | 'featured') => {
    await adminService.saveMenu({ ...item, [field]: !item[field] })
    retry()
  }
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
            Katalog restoran
          </p>
          <h1 className="font-display mt-2 text-4xl">Kelola Menu</h1>
        </div>
        <button
          onClick={() => setEditing(blankItem())}
          className="bg-terracotta inline-flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-white"
        >
          <Plus size={18} /> Menu Baru
        </button>
      </div>
      {message && (
        <p role="status" className="mt-4 rounded-xl bg-orange-50 p-3 text-sm">
          {message}
        </p>
      )}
      {editing && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void save(editing)
          }}
          className="mt-6 grid gap-4 rounded-2xl border border-orange-200 bg-white p-5 sm:grid-cols-2"
        >
          <label className="font-semibold">
            Nama
            <input
              required
              value={editing.name}
              onChange={(event) =>
                setEditing({ ...editing, name: event.target.value })
              }
              className="mt-2 w-full rounded-xl border p-3 font-normal"
            />
          </label>
          <label className="font-semibold">
            Kode
            <input
              value={editing.code}
              onChange={(event) =>
                setEditing({ ...editing, code: event.target.value })
              }
              className="mt-2 w-full rounded-xl border p-3 font-normal"
            />
          </label>
          <label className="font-semibold">
            Kategori
            <select
              value={editing.category}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  category: event.target.value as MenuCategory,
                })
              }
              className="mt-2 w-full rounded-xl border p-3 font-normal"
            >
              {categoryChoices.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="font-semibold">
            Harga
            <input
              type="number"
              min="0"
              required
              value={editing.price}
              onChange={(event) =>
                setEditing({ ...editing, price: Number(event.target.value) })
              }
              className="mt-2 w-full rounded-xl border p-3 font-normal"
            />
          </label>
          <label className="font-semibold">
            Estimasi
            <input
              value={editing.preparationTime}
              onChange={(event) =>
                setEditing({ ...editing, preparationTime: event.target.value })
              }
              className="mt-2 w-full rounded-xl border p-3 font-normal"
            />
          </label>
          <label className="font-semibold">
            URL gambar
            <input
              value={editing.image}
              onChange={(event) =>
                setEditing({ ...editing, image: event.target.value })
              }
              className="mt-2 w-full rounded-xl border p-3 font-normal"
            />
          </label>
          <label className="font-semibold sm:col-span-2">
            Deskripsi
            <textarea
              required
              value={editing.description}
              onChange={(event) =>
                setEditing({ ...editing, description: event.target.value })
              }
              className="mt-2 min-h-24 w-full rounded-xl border p-3 font-normal"
            />
          </label>
          <MenuOptionsEditor item={editing} onChange={setEditing} />
          <div className="flex gap-3 sm:col-span-2">
            <button
              disabled={saving}
              className="bg-ink inline-flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-white"
            >
              <Save size={17} /> Simpan
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-xl border px-4 py-3 font-bold"
            >
              Batal
            </button>
          </div>
        </form>
      )}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[750px] text-left text-sm">
          <caption className="sr-only">Daftar menu restoran</caption>
          <thead className="bg-stone-50">
            <tr>
              <th className="p-4">Menu</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Harga</th>
              <th className="p-4">Tersedia</th>
              <th className="p-4">Unggulan</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-4 font-bold">{item.name}</td>
                <td className="p-4">{item.category}</td>
                <td className="p-4">{formatRupiah(item.price)}</td>
                <td className="p-4">
                  <button
                    onClick={() => void toggle(item, 'available')}
                    aria-label={`Ubah ketersediaan ${item.name}`}
                  >
                    {item.available ? (
                      <ToggleRight className="text-emerald-600" />
                    ) : (
                      <ToggleLeft className="text-stone-400" />
                    )}
                  </button>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => void toggle(item, 'featured')}
                    aria-label={`Ubah unggulan ${item.name}`}
                  >
                    {item.featured ? (
                      <ToggleRight className="text-terracotta" />
                    ) : (
                      <ToggleLeft className="text-stone-400" />
                    )}
                  </button>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => setEditing(item)}
                    className="text-terracotta inline-flex items-center gap-1 font-bold"
                  >
                    <Pencil size={15} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
