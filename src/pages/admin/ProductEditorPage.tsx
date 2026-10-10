import { Archive, ArrowLeft, Check, ChevronLeft, ChevronRight, Eye, ImagePlus, ImageUp, Save, Send, Star, Trash2 } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { products as library } from '../../data/mockData'
import { useCategories } from '../../services/categoryService'
import { productService, useCatalog, validProductImage, type ProductInput } from '../../services/productService'
import type { Product } from '../../types'
import './ProductStudio.css'

const images = library.filter((product, index) => library.findIndex(item => item.image === product.image) === index)
const blank = { name: '', brand: '', sku: '', categoryId: '', unit: '', price: '', salePrice: '', stock: '', lowStockThreshold: '8', description: '', originNote: '', image: images[0].image, accent: 'mint' as Product['accent'], featured: false }
function initial(product?: Product, categoryId = '') {
  return product ? { name: product.name, brand: product.brand || '', sku: product.sku || product.id.toUpperCase(), categoryId: product.categoryId, unit: product.unit, price: String(product.price), salePrice: product.salePrice === undefined ? '' : String(product.salePrice), stock: String(product.stock), lowStockThreshold: String(product.lowStockThreshold ?? 8), description: product.description, originNote: product.originNote, image: product.image, accent: product.accent, featured: !!product.featured } : { ...blank, categoryId }
}

const MAX_GALLERY_IMAGES = 8
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function optimiseUpload(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new Error(`${file.name} must be a JPG, PNG or WebP image.`)
  if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name} is larger than 8 MB.`)
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error(`Could not prepare ${file.name}.`)), 'image/webp', .82))
  const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error(`Could not read ${file.name}.`)); reader.readAsDataURL(blob) })
  if (!validProductImage(dataUrl)) throw new Error(`${file.name} is still too large after optimisation. Try a smaller image.`)
  return dataUrl
}

function ProductStudio({ product }: { product?: Product }) {
  const { categories, error: categoryError } = useCategories()
  const [form, setForm] = useState(() => initial(product, categories[0]?.id))
  const [gallery, setGallery] = useState<string[]>(() => product?.images?.length ? product.images : [product?.image || images[0].image])
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [savedId, setSavedId] = useState(product?.id)
  const [publication, setPublication] = useState(product?.publication || 'draft')
  const [pending, setPending] = useState(false)
  const saving = useRef(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [savedSlug, setSavedSlug] = useState(product?.slug)
  const [imageFailed, setImageFailed] = useState(false)
  const set = (name: keyof typeof form, value: string | boolean) => { setForm(current => ({ ...current, [name]: value })); setMessage(''); if (name === 'image') setImageFailed(false) }
  const updateGallery = (next: string[]) => { const safe = next.slice(0, MAX_GALLERY_IMAGES); setGallery(safe); if (safe[0]) set('image', safe[0]) }
  const addGalleryImage = (image: string) => {
    if (!validProductImage(image)) { setError('Enter a valid image URL or choose an image file.'); return }
    if (gallery.includes(image)) { updateGallery([image, ...gallery.filter(item => item !== image)]); setError(''); return }
    if (gallery.length >= MAX_GALLERY_IMAGES) { setError(`A product can have up to ${MAX_GALLERY_IMAGES} images.`); return }
    updateGallery([...gallery, image]); setError('')
  }
  const uploadImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files || [])]; event.target.value = ''
    if (!files.length) return
    if (gallery.length + files.length > MAX_GALLERY_IMAGES) { setError(`Choose up to ${MAX_GALLERY_IMAGES - gallery.length} more images.`); return }
    setUploading(true); setError('')
    try { updateGallery([...gallery, ...(await Promise.all(files.map(optimiseUpload)))]) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not add those images.') }
    finally { setUploading(false) }
  }
  const moveGalleryImage = (index: number, direction: -1 | 1) => { const next = [...gallery]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; updateGallery(next) }
  const removeGalleryImage = (index: number) => { if (gallery.length === 1) { setError('Keep at least one product image.'); return }; updateGallery(gallery.filter((_, itemIndex) => itemIndex !== index)) }
  async function save(state: 'draft' | 'published' | 'archived') {
    if (saving.current) return
    saving.current = true
    setPending(true); setError(''); setMessage('')
    try {
      const input: ProductInput = {
        ...form, image: gallery[0], images: gallery, shortName: form.name, price: Number(form.price), salePrice: form.salePrice.trim() ? Number(form.salePrice) : undefined,
        stock: form.stock.trim() ? Number(form.stock) : NaN, lowStockThreshold: Number(form.lowStockThreshold), publication: state,
      }
      const saved = await productService.save(input, savedId)
      setSavedId(saved.id); setSavedSlug(saved.slug); setPublication(state)
      setMessage(state === 'published' ? 'Published. This product is now in the customer market.' : state === 'archived' ? 'Archived. Hidden from the market; order history is preserved.' : 'Draft saved. Not shown in the market.')
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save product.') }
    finally { saving.current = false; setPending(false) }
  }
  function submit(event: FormEvent) { event.preventDefault(); void save('published') }
  const imageValid = validProductImage(gallery[0]) && !imageFailed
  const field = (name: 'name' | 'brand' | 'sku' | 'unit' | 'price' | 'salePrice' | 'stock' | 'lowStockThreshold', label: string, placeholder: string, required = true) => <label><span className="label">{label}{required && ' *'}</span><input name={name} className="field" value={form[name]} onChange={event => set(name, event.target.value)} placeholder={placeholder} required={required} type={['price','salePrice','stock','lowStockThreshold'].includes(name) ? 'number' : 'text'} min={['price','salePrice'].includes(name) ? '0.01' : '0'} step={['price','salePrice'].includes(name) ? '0.01' : '1'} maxLength={name === 'name' ? 100 : name === 'sku' ? 50 : 80} /></label>
  return <main className="product-studio min-h-svh pb-10"><AdminPageHeader section="Product studio" title={savedId ? 'Give every detail its place.' : 'Make room for a new favourite.'} subtitle="Shape the product, see the shelf preview, then publish when it’s ready." action={<span className="status-pill bg-[var(--mint)] capitalize">{publication}</span>} />
    <form onSubmit={submit} noValidate className="studio-layout">
      <div className="studio-main"><section className="studio-section"><div className="studio-section-heading"><span>01</span><div><h2>The essentials</h2><p>A clear name and the right pack size make shopping easier.</p></div></div>{categoryError && <p role="alert" className="studio-error">{categoryError}</p>}<div className="studio-fields">{field('name', 'Product name', 'e.g. Everyday masoor dal')}{field('brand', 'Brand', 'e.g. Griha Mart')}{field('sku', 'Unique SKU', 'e.g. GM-DAL-1KG')}<label><span className="label">Category *</span><select name="categoryId" className="field" value={form.categoryId} onChange={event => set('categoryId', event.target.value)}>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>{field('unit', 'Pack size', 'e.g. 1 kg')}</div><label className="studio-full-field"><span className="label">Description</span><textarea name="description" rows={4} className="field" value={form.description} onChange={event => set('description', event.target.value)} placeholder="What makes this a good addition to the pantry?" /></label><label className="studio-full-field"><span className="label">Origin or sourcing note</span><textarea name="originNote" rows={2} className="field" value={form.originNote} onChange={event => set('originNote', event.target.value)} placeholder="Share the useful details, without making unsupported claims." /></label></section>
      <section className="studio-section"><div className="studio-section-heading"><span>02</span><div><h2>Price & availability</h2><p>Stock labels update from the quantities you enter.</p></div></div><div className="studio-fields">{field('price', 'Regular price · NPR', '0.00')}{field('salePrice', 'Sale price · NPR', 'Optional', false)}{field('stock', 'Units in stock', '0')}{field('lowStockThreshold', 'Low-stock alert at', '8')}</div></section>
      <section className="studio-section">
        <div className="studio-section-heading"><span>03</span><div><h2>Product gallery</h2><p>Add up to {MAX_GALLERY_IMAGES} views. The first image becomes the cover across the market.</p></div></div>
        <div className="studio-upload-row">
          <label className="studio-upload-button"><ImageUp size={20} /><strong>{uploading ? 'Preparing images…' : 'Upload images'}</strong><span>JPG, PNG or WebP · up to 8 MB each</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading || gallery.length >= MAX_GALLERY_IMAGES} onChange={uploadImages} /></label>
          <div className="studio-image-url"><label htmlFor="product-image-url" className="label">Or add an image URL</label><div><input id="product-image-url" className="field" value={imageUrl} onChange={event => setImageUrl(event.target.value)} placeholder="https://…" /><button type="button" onClick={() => { addGalleryImage(imageUrl); setImageUrl('') }}>Add</button></div></div>
        </div>
        <div className="studio-gallery" aria-label={`${gallery.length} product images`}>
          {gallery.map((image, index) => <article key={`${index}-${image.slice(-32)}`} className={index === 0 ? 'is-cover' : ''}>
            <div className="studio-gallery-image"><img src={image} alt={`Product view ${index + 1}`} />{index === 0 && <span><Star size={11} fill="currentColor" /> Cover</span>}</div>
            <div className="studio-gallery-actions"><button type="button" disabled={index === 0} onClick={() => moveGalleryImage(index, -1)} aria-label={`Move image ${index + 1} left`}><ChevronLeft /></button><button type="button" onClick={() => updateGallery([image, ...gallery.filter((_, itemIndex) => itemIndex !== index)])} aria-label={`Make image ${index + 1} the cover`} title="Make cover"><Star /></button><button type="button" disabled={index === gallery.length - 1} onClick={() => moveGalleryImage(index, 1)} aria-label={`Move image ${index + 1} right`}><ChevronRight /></button><button type="button" onClick={() => removeGalleryImage(index)} aria-label={`Remove image ${index + 1}`} className="is-danger"><Trash2 /></button></div>
          </article>)}
        </div>
        <p className="studio-help">{gallery.length} of {MAX_GALLERY_IMAGES} images · use the star to choose the cover or arrows to reorder.</p>
        <div className="studio-image-library" aria-label="Product image library">{images.map(item => <button type="button" key={item.image} aria-label={`Add ${item.shortName} image`} aria-pressed={gallery.includes(item.image)} onClick={() => addGalleryImage(item.image)} className={gallery.includes(item.image) ? 'is-selected' : ''}><img src={item.image} alt="" /><span>{item.shortName}</span></button>)}</div>
        <label className="studio-full-field"><span className="label">Card colour</span><select name="accent" className="field" value={form.accent} onChange={event => set('accent', event.target.value)}>{['mint','coral','amber','blue','cream','pink'].map(colour => <option key={colour}>{colour}</option>)}</select></label><label className="studio-featured"><input type="checkbox" name="featured" checked={form.featured} onChange={event => set('featured', event.target.checked)} /> Feature on the home page</label>
      </section></div>
      <aside className="studio-sidebar"><div className="studio-preview-heading"><Eye size={16} /><span>LIVE SHELF PREVIEW</span></div><article className={`studio-preview studio-preview-${form.accent}`}><div className="studio-preview-art"><span className="studio-preview-pack">{form.unit || 'Pack size'}</span>{imageValid ? <img src={gallery[0]} alt={form.name || 'Product preview'} onError={() => setImageFailed(true)} /> : <div className="studio-image-empty"><ImagePlus /><p>Choose a valid image</p></div>}</div><div className="studio-preview-copy"><span className="eyebrow text-[var(--green)]">{categories.find(category => category.id === form.categoryId)?.name}</span><h2>{form.name || 'Your next pantry favourite'}</h2><p>{form.unit || 'Pack size'} · {Number(form.stock) > 0 ? form.stock + ' in stock' : 'Out of stock'}</p><strong>NPR {(Number(form.salePrice || form.price) || 0).toLocaleString()}</strong></div></article><div className="studio-publish"><h2>Ready for the market?</h2><p>Save a draft while you work. Publish when the product is ready for the market.</p><div className="studio-actions"><button disabled={pending || uploading} type="button" onClick={() => save('draft')} className="pill-button bg-[var(--mint)]"><Save size={16} /> Save draft</button><button disabled={pending || uploading} type="submit" className="pill-button btn-ink"><Send size={16} /> {pending ? 'Saving…' : 'Publish product'}</button></div>{savedId && publication !== 'archived' && <button disabled={pending} type="button" onClick={() => save('archived')} className="studio-archive"><Archive size={16} /> Archive product</button>}{error && <p role="alert" className="studio-error">{error}</p>}{message && <p role="status" className="studio-success"><Check size={16} />{message}</p>}{publication === 'published' && savedSlug && <Link className="studio-view" to={`/products/${savedSlug}`}>View customer product →</Link>}</div><Link className="pill-button bg-white mt-4" to="/admin/products"><ArrowLeft size={16} /> All products</Link></aside>
    </form>
  </main>
}
export function ProductEditorPage() {
  const { productId } = useParams()
  const { products, error } = useCatalog()
  const product = products.find(item => item.id === productId)
  if (error || (productId && !product)) return <main className="p-6"><h1 className="section-title">Product unavailable.</h1><p role="alert" className="mt-4">{error || 'No product matches this address.'}</p><Link className="pill-button btn-ink mt-5" to="/admin/products">Back to products</Link></main>
  return <ProductStudio key={productId || 'new'} product={product} />
}
