import type { MenuItem } from '../../types/menu'

export function MenuOptionsEditor({
  item,
  onChange,
}: {
  item: MenuItem
  onChange: (item: MenuItem) => void
}) {
  const groups = item.optionGroups ?? []
  const updateGroup = (
    index: number,
    change: Partial<(typeof groups)[number]>,
  ) =>
    onChange({
      ...item,
      optionGroups: groups.map((group, groupIndex) =>
        groupIndex === index ? { ...group, ...change } : group,
      ),
    })
  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Grup opsi & tambahan</h3>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...item,
              optionGroups: [
                ...groups,
                {
                  id: crypto.randomUUID(),
                  name: 'Pilihan Baru',
                  required: false,
                  minSelect: 0,
                  maxSelect: 1,
                  options: [],
                },
              ],
            })
          }
          className="text-terracotta text-sm font-bold"
        >
          + Grup opsi
        </button>
      </div>
      {groups.map((group, groupIndex) => (
        <fieldset key={group.id} className="rounded-xl border bg-stone-50 p-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              aria-label="Nama grup opsi"
              value={group.name}
              onChange={(event) =>
                updateGroup(groupIndex, { name: event.target.value })
              }
              className="rounded-lg border p-2"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={group.required}
                onChange={() =>
                  updateGroup(groupIndex, {
                    required: !group.required,
                    minSelect: group.required ? 0 : 1,
                  })
                }
              />{' '}
              Wajib
            </label>
          </div>
          <div className="mt-3 space-y-2">
            {group.options.map((option, optionIndex) => (
              <div
                key={option.id}
                className="grid gap-2 sm:grid-cols-[1fr_130px_auto]"
              >
                <input
                  aria-label="Nama opsi"
                  value={option.name}
                  onChange={(event) =>
                    updateGroup(groupIndex, {
                      options: group.options.map((value, index) =>
                        index === optionIndex
                          ? { ...value, name: event.target.value }
                          : value,
                      ),
                    })
                  }
                  className="rounded-lg border p-2"
                />
                <input
                  aria-label="Harga tambahan"
                  type="number"
                  min="0"
                  value={option.priceDelta}
                  onChange={(event) =>
                    updateGroup(groupIndex, {
                      options: group.options.map((value, index) =>
                        index === optionIndex
                          ? { ...value, priceDelta: Number(event.target.value) }
                          : value,
                      ),
                    })
                  }
                  className="rounded-lg border p-2"
                />
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={option.available}
                    onChange={() =>
                      updateGroup(groupIndex, {
                        options: group.options.map((value, index) =>
                          index === optionIndex
                            ? { ...value, available: !value.available }
                            : value,
                        ),
                      })
                    }
                  />{' '}
                  Aktif
                </label>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                updateGroup(groupIndex, {
                  options: [
                    ...group.options,
                    {
                      id: crypto.randomUUID(),
                      name: 'Opsi Baru',
                      priceDelta: 0,
                      available: true,
                    },
                  ],
                })
              }
              className="text-terracotta text-sm font-bold"
            >
              + Tambah opsi
            </button>
          </div>
        </fieldset>
      ))}
    </div>
  )
}
