import type { Product } from '../../types'
import { safeImageUrl } from '../../services/safeContent'

export function ProductArt({ product, className = '' }: { product: Product; className?: string }) {
  return <img className={`product-shadow object-contain ${className}`} src={safeImageUrl(product.image)} alt={`${product.name}, ${product.unit}`} />
}
