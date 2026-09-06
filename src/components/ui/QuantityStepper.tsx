import { Minus, Plus } from 'lucide-react'
export function QuantityStepper({
  value,
  onChange,
  disabled = false,
}: {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}) {
  return (
    <div className="inline-flex items-center rounded-xl border border-stone-300 bg-white">
      <button
        aria-label="Kurangi jumlah"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        className="grid size-10 place-items-center text-stone-600 disabled:opacity-35"
      >
        <Minus size={17} />
      </button>
      <span className="min-w-8 text-center font-semibold" aria-live="polite">
        {value}
      </span>
      <button
        aria-label="Tambah jumlah"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="grid size-10 place-items-center text-stone-600 disabled:opacity-35"
      >
        <Plus size={17} />
      </button>
    </div>
  )
}
