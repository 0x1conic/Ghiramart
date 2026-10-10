import { Minus, Plus } from 'lucide-react'

export function QuantityControl({ quantity, onChange }: { quantity: number; onChange: (value: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-full bg-black/10 p-1" aria-label="Quantity">
      <button className="grid size-9 place-items-center rounded-full hover:bg-white" onClick={() => onChange(quantity - 1)} aria-label="Decrease quantity"><Minus size={15} /></button>
      <output className="w-9 text-center text-sm font-bold" aria-live="polite">{quantity}</output>
      <button className="grid size-9 place-items-center rounded-full hover:bg-white" onClick={() => onChange(quantity + 1)} aria-label="Increase quantity"><Plus size={15} /></button>
    </div>
  )
}
