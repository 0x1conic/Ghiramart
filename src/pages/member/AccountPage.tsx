import { LogOut, Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageTransition } from '../../components/motion/MotionPrimitives'
import { profileService, useIdentity } from '../../services/profileService'
import { apiRequest } from '../../services/api'
import type { User } from '../../types'

function ProfileForm({ user }: { user: User }) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (pending) return
    const values = new FormData(event.currentTarget)
    setPending(true); setError(''); setMessage('')
    const currentPassword = String(values.get('currentPassword') || '')
    const newPassword = String(values.get('newPassword') || '')
    if (!currentPassword || newPassword.length < 8) { setError('Enter your current password and a new password of at least 8 characters.'); setPending(false); return }
    try { await apiRequest('/user/password', { method: 'PATCH', body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }) }); event.currentTarget.reset(); setMessage('Your password has been updated.') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update password.') }
    finally { setPending(false) }
  }
  return <div className="surface-card mt-8"><dl className="grid gap-5 sm:grid-cols-2"><div><dt className="label">Full name</dt><dd className="mt-2 font-bold">{user.fullName}</dd></div><div><dt className="label">Mobile number</dt><dd className="mt-2 font-bold">{user.phone}</dd></div></dl><form onSubmit={submit} noValidate className="mt-8 grid gap-5 border-t border-black/10 pt-7 md:grid-cols-2"><label><span className="label">Current password</span><input name="currentPassword" required className="field bg-[#fff7e6]" type="password" autoComplete="current-password" /></label><label><span className="label">New password</span><input name="newPassword" required minLength={8} maxLength={128} className="field bg-[#fff7e6]" type="password" autoComplete="new-password" /></label><button disabled={pending} className="pill-button btn-ink md:col-span-2"><Save size={16} /> {pending ? 'Updating…' : 'Update password'}</button>{message && <p role="status" className="text-sm text-[var(--green)] md:col-span-2">{message}</p>}{error && <p role="alert" className="error-text md:col-span-2">{error}</p>}</form></div>
}
export function AccountPage() {
  const { user, error } = useIdentity()
  const navigate = useNavigate()
  const [notice, setNotice] = useState('')
  const signOut = () => { try { profileService.signOut(); navigate('/login') } catch (reason) { setNotice(reason instanceof Error ? reason.message : 'Could not sign out.') } }
  return <PageTransition className="page-shell bg-[var(--cream)]"><div className="content-wrap max-w-4xl py-8"><span className="eyebrow text-[var(--green)]">Member / Account</span><div className="mt-4 flex flex-wrap items-center gap-5"><span className="grid size-16 shrink-0 place-items-center rounded-full bg-[var(--lime)] font-brand text-xl font-bold">{user?.avatarInitials || 'G'}</span><div className="min-w-0"><h1 className="section-title">Your profile.</h1><p className="identity-text text-[var(--muted)]">{user?.fullName || 'You’re browsing as a guest.'}</p></div></div>{user ? <><ProfileForm key={user.id} user={user} /><button onClick={signOut} className="pill-button mt-6 bg-white"><LogOut size={16} /> Sign out</button></> : <section className="surface-card mt-8"><p>Sign in or create your membership to personalise your card.</p><div className="mt-5 flex flex-wrap gap-3"><Link className="pill-button btn-ink" to="/login">Sign in</Link><Link className="pill-button bg-[var(--mint)]" to="/register">Create membership</Link></div></section>}{(error || notice) && <p role="alert" className="error-text">{error || notice}</p>}</div></PageTransition>
}
