import { Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import type { CartItem } from '../../types'
import { ProductArt } from '../common/ProductArt'
import { QuantityControl } from '../common/QuantityControl'

const backgrounds = { mint: 'bg-[var(--mint)]', coral: 'bg-[var(--coral)]', amber: 'bg-[var(--amber)]', blue: 'bg-[var(--blue)] text-white', cream: 'bg-white', pink: 'bg-[var(--pink)]' }

export function CartLine({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart()
  return (
    <article className={`grid grid-cols-[70px_1fr_auto] items-center gap-4 rounded-3xl p-4 sm:grid-cols-[80px_1fr_auto_auto] ${backgrounds[item.product.accent]}`}>
      <ProductArt product={item.product} className="h-16 w-full" />
      <div><h2 className="font-brand font-bold">{item.product.name}</h2><p className="mt-1 text-sm font-bold">NPR {(item.product.salePrice ?? item.product.price).toLocaleString()}</p></div>
      <div className="hidden sm:block"><QuantityControl quantity={item.quantity} onChange={(value) => updateQuantity(item.product.id, value)} /></div>
      <button className="grid size-10 place-items-center rounded-full bg-black/10 hover:bg-black/15" onClick={() => removeItem(item.product.id)} aria-label={`Remove ${item.product.name}`}><Trash2 size={16} /></button>
      <div className="col-span-3 sm:hidden"><QuantityControl quantity={item.quantity} onChange={(value) => updateQuantity(item.product.id, value)} /></div>
    </article>
  )
}
