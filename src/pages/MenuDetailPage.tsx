import { ChevronLeft, Clock3, Heart, ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { MenuCard } from '../components/menu/MenuCard'
import { QuantityStepper } from '../components/ui/QuantityStepper'
import { getMenuItem } from '../data/menu'
import { useTableContext } from '../hooks/useTableContext'
import { formatRupiah } from '../lib/format'
import { optionTotal, useCartStore } from '../store/cartStore'
import { usePreferenceStore } from '../store/preferenceStore'
import { useToastStore } from '../store/toastStore'
import type { MenuOptionGroup, SelectedOption } from '../types/menu'

function OptionGroup({
  group,
  selected,
  onChange,
}: {
  group: MenuOptionGroup
  selected: SelectedOption[]
  onChange: (options: SelectedOption[]) => void
}) {
  const choose = (optionId: string) => {
    const option = group.options.find((entry) => entry.id === optionId)
    if (!option) return
    const otherGroups = selected.filter((entry) => entry.groupId !== group.id)
    const active = selected.some((entry) => entry.optionId === option.id)
    const inGroup = selected.filter((entry) => entry.groupId === group.id)
    const value = {
      groupId: group.id,
      groupName: group.name,
      optionId: option.id,
      optionName: option.name,
      priceDelta: option.priceDelta,
    }
    if (group.maxSelect === 1) onChange([...otherGroups, value])
    else if (active)
      onChange(selected.filter((entry) => entry.optionId !== option.id))
    else if (inGroup.length < group.maxSelect) onChange([...selected, value])
  }
  return (
    <fieldset>
      <legend className="font-semibold">
        {group.name}{' '}
        {group.required && (
          <span className="text-terracotta text-xs">Wajib</span>
        )}
      </legend>
      <p className="mt-1 text-xs text-stone-500">
        {group.maxSelect === 1
          ? 'Pilih satu'
          : `Pilih hingga ${group.maxSelect}`}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {group.options
          .filter((option) => option.available)
          .map((option) => {
            const checked = selected.some(
              (entry) => entry.optionId === option.id,
            )
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${checked ? 'border-terracotta bg-orange-50' : 'border-stone-200 bg-white'}`}
              >
                <input
                  type={group.maxSelect === 1 ? 'radio' : 'checkbox'}
                  name={group.id}
                  checked={checked}
                  onChange={() => choose(option.id)}
                  className="accent-[#9f3c20]"
                />
                <span className="flex-1 text-sm font-medium">
                  {option.name}
                </span>
                {option.priceDelta > 0 && (
                  <span className="text-xs text-stone-500">
                    +{formatRupiah(option.priceDelta)}
                  </span>
                )}
              </label>
            )
          })}
      </div>
    </fieldset>
  )
}

export function MenuDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const item = getMenuItem(id ?? '')
  const editId = searchParams.get('edit')
  const editingItem = useCartStore((state) =>
    state.items.find((entry) => entry.cartId === editId),
  )
  const [quantity, setQuantity] = useState(editingItem?.quantity ?? 1)
  const [note, setNote] = useState(editingItem?.note ?? '')
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>(
    editingItem?.selectedOptions ?? [],
  )
  const addItem = useCartStore((state) => state.addItem)
  const updateItem = useCartStore((state) => state.updateItem)
  const { to } = useTableContext()
  const addRecentlyViewed = usePreferenceStore(
    (state) => state.addRecentlyViewed,
  )
  const favoriteIds = usePreferenceStore((state) => state.favoriteIds)
  const toggleFavorite = usePreferenceStore((state) => state.toggleFavorite)
  const showToast = useToastStore((state) => state.show)
  const recommendations = useMemo(
    () =>
      item?.recommendedWith
        ?.map(getMenuItem)
        .filter((entry) => entry !== undefined) ?? [],
    [item],
  )

  useEffect(() => {
    if (item) addRecentlyViewed(item.id)
  }, [addRecentlyViewed, item])

  if (!item)
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Menu tidak ditemukan</h1>
        <p className="mt-3 text-stone-600">
          Menu ini mungkin sudah tidak tersedia.
        </p>
        <Link
          className="text-terracotta mt-6 inline-block font-semibold"
          to={to('/menu')}
        >
          Kembali ke menu
        </Link>
      </section>
    )

  const optionsValid = (item.optionGroups ?? []).every(
    (group) =>
      selectedOptions.filter((option) => option.groupId === group.id).length >=
      group.minSelect,
  )
  const unitPrice = item.price + optionTotal(selectedOptions)
  const submit = () => {
    if (!optionsValid) {
      showToast('Lengkapi pilihan wajib terlebih dahulu', 'info')
      return
    }
    if (editingItem) {
      updateItem(editingItem.cartId, quantity, note, selectedOptions)
      showToast('Pesanan di keranjang diperbarui')
    } else {
      addItem(item, quantity, note, selectedOptions)
      showToast(`${item.name} ditambahkan ke keranjang`)
    }
  }
  const favorite = favoriteIds.includes(item.id)
  return (
    <>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          to={to('/menu')}
          className="hover:text-terracotta inline-flex items-center gap-1 text-sm font-semibold text-stone-600"
        >
          <ChevronLeft size={17} /> Kembali ke menu
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <img
            src={item.image}
            alt={item.name}
            className="aspect-square w-full rounded-3xl object-cover shadow-lg"
          />
          <div className="lg:py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
                  {item.category}
                </p>
                <h1 className="font-display mt-2 text-4xl">{item.name}</h1>
              </div>
              <button
                onClick={() => {
                  const saved = toggleFavorite(item.id)
                  showToast(
                    saved
                      ? 'Menu disimpan ke favorit'
                      : 'Menu dihapus dari favorit',
                    'info',
                  )
                }}
                aria-label={
                  favorite ? 'Hapus dari favorit' : 'Simpan sebagai favorit'
                }
                aria-pressed={favorite}
                className="grid size-11 place-items-center rounded-full border border-stone-200 bg-white"
              >
                <Heart
                  className={favorite ? 'fill-red-500 text-red-500' : ''}
                />
              </button>
            </div>
            <p className="mt-4 leading-relaxed text-stone-600">
              {item.description}
            </p>
            <div className="mt-5 flex items-center justify-between">
              <p className="text-2xl font-bold">{formatRupiah(item.price)}</p>
              <span className="flex items-center gap-1.5 text-sm text-stone-500">
                <Clock3 size={17} /> {item.preparationTime}
              </span>
            </div>
            {item.available ? (
              <div className="mt-8 space-y-6">
                {(item.optionGroups ?? []).map((group) => (
                  <OptionGroup
                    key={group.id}
                    group={group}
                    selected={selectedOptions}
                    onChange={setSelectedOptions}
                  />
                ))}
                <div>
                  <p className="mb-2 text-sm font-semibold">Jumlah pesanan</p>
                  <QuantityStepper value={quantity} onChange={setQuantity} />
                </div>
                <label className="block text-sm font-semibold">
                  Catatan pesanan
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    className="focus:border-terracotta mt-2 min-h-25 w-full rounded-xl border border-stone-300 bg-white p-3 font-normal outline-none"
                    placeholder="Contoh: Sambal dipisah"
                  />
                </label>
                <div className="rounded-xl bg-orange-50 p-4">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Harga menu</span>
                    <span>{formatRupiah(item.price)}</span>
                  </div>
                  {optionTotal(selectedOptions) > 0 && (
                    <div className="mt-2 flex justify-between text-sm text-stone-600">
                      <span>Tambahan</span>
                      <span>{formatRupiah(optionTotal(selectedOptions))}</span>
                    </div>
                  )}
                  <div className="mt-3 flex justify-between border-t border-orange-200 pt-3 font-semibold">
                    <span>Subtotal</span>
                    <span className="text-terracotta text-xl font-bold">
                      {formatRupiah(unitPrice * quantity)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={submit}
                  className="bg-terracotta flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white hover:bg-[#7f2e18]"
                >
                  <ShoppingBag size={19} />{' '}
                  {editingItem ? 'Perbarui Keranjang' : 'Tambah ke Keranjang'}
                </button>
              </div>
            ) : (
              <div className="mt-8 rounded-xl bg-stone-100 p-5">
                <p className="font-semibold">Menu sedang habis</p>
                <p className="mt-1 text-sm text-stone-600">
                  Silakan pilih hidangan lain yang tersedia.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      {recommendations.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <p className="text-terracotta text-sm font-bold tracking-widest uppercase">
            Cocok dipadukan dengan
          </p>
          <h2 className="font-display mt-2 text-3xl">Lengkapi pesanan Anda</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((entry) => (
              <MenuCard key={entry.id} item={entry} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
