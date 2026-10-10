import { Check, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PageTransition } from '../../components/motion/MotionPrimitives'
import { profileService, useIdentity } from '../../services/profileService'
import type { Address } from '../../types'

export function AddressesPage() {
  const { user, addresses, error: storageError } = useIdentity()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [removingId, setRemovingId] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { if (user) void profileService.refreshAddresses().catch(reason => setError(reason instanceof Error ? reason.message : 'Could not refresh addresses.')) }, [user?.id])
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const input = { label: String(values.get('label') || ''), phone: String(values.get('phone') || ''), line1: String(values.get('line1') || ''), city: String(values.get('city') || '') }
    try { if (editing) await profileService.updateAddress(editing.id, input); else await profileService.addAddress(input); setError(''); setShowForm(false); setEditing(null) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save address.') }
  }
  const openNew = () => { setEditing(null); setShowForm(true) }
  const remove = async (id: string) => { try { await profileService.removeAddress(id); setRemovingId(''); setError('') } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not remove address.') } }
  return <PageTransition className="page-shell bg-[var(--cream)]"><div className="content-wrap max-w-5xl py-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><span className="eyebrow text-[var(--green)]">Member / Addresses</span><h1 className="section-title mt-3">Saved places.</h1></div>{user && <button className="pill-button btn-lime" onClick={openNew}><Plus size={16} /> Add address</button>}</div>{!user ? <p className="surface-card mt-8"><Link className="underline" to="/login">Sign in</Link> to manage your own saved addresses.</p> : <><div className="mt-8 grid gap-4 md:grid-cols-2">{addresses.map(address => <article className="surface-card" key={address.id}><div className="flex items-center justify-between"><MapPin /><span className="eyebrow text-[var(--green)]">{address.label}</span></div><h2 className="identity-text font-brand mt-6 text-2xl font-bold">{address.line1}</h2><p className="identity-text mt-2 text-[var(--muted)]">{address.city} · {address.phone}</p>{address.isDefault && <span className="status-pill mt-5 bg-[var(--mint)]"><Check size={14} className="mr-2" /> Default</span>}<div className="mt-5 flex flex-wrap gap-2"><button className="pill-button bg-white" onClick={() => { setEditing(address); setShowForm(true) }}><Pencil size={14} /> Edit</button>{removingId === address.id ? <><button className="pill-button bg-[var(--pink)]" onClick={() => void remove(address.id)}>Confirm remove</button><button className="pill-button bg-white" onClick={() => setRemovingId('')}>Keep</button></> : <button className="pill-button bg-white text-red-700" onClick={() => setRemovingId(address.id)}><Trash2 size={14} /> Remove</button>}</div></article>)}</div>{!addresses.length && <p className="mt-6">No saved addresses yet. Add your first place.</p>}{showForm && <form key={editing?.id || 'new'} className="surface-card mt-6 grid gap-4 md:grid-cols-2" onSubmit={save}>{[['label','Label','Home',editing?.label || ''],['phone','Phone','Your phone',editing?.phone || user.phone],['line1','Address','Street and landmark',editing?.line1 || ''],['city','City','Your city',editing?.city || '']].map(([name,label,placeholder,value]) => <label key={name}><span className="label">{label}</span><input name={name} className="field bg-[#fff7e6]" required maxLength={200} defaultValue={value} placeholder={placeholder} /></label>)}<div className="flex flex-wrap gap-3 md:col-span-2"><button className="pill-button btn-ink">{editing ? 'Update address' : 'Save address'}</button><button type="button" className="pill-button bg-white" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button></div></form>}</>}{(error || storageError) && <p role="alert" className="error-text">{error || storageError}</p>}</div></PageTransition>
}
