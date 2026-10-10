import { ArrowRight, LoaderCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthScaffold } from '../../components/auth/AuthScaffold'
import { useAuthSlot } from '../../components/auth/AuthMotion'
import { authService } from '../../services/authService'
import { profileService } from '../../services/profileService'

interface Errors { [key: string]: string }
function normalizeNepalPhone(value: FormDataEntryValue | null) {
  const rawDigits = String(value || '').replace(/\D/g, '')
  const digits = rawDigits.length === 13 && rawDigits.startsWith('977') ? rawDigits.slice(3) : rawDigits
  return /^9[678]\d{8}$/.test(digits) ? `+977${digits}` : ''
}
function validate(form: FormData, fields: string[]) {
  const errors: Errors = {}
  fields.forEach((field) => { if (!String(form.get(field) || '').trim()) errors[field] = 'This field is required.' })
  const email = String(form.get('email') || '')
  if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email address.'
  const password = String(form.get('password') || '')
  if (password && password.length < 8) errors.password = 'Use at least 8 characters.'
  return errors
}

function FormField({ label, name, type = 'text', placeholder, error, inputMode, autoComplete, maxLength }: { label: string; name: string; type?: string; placeholder: string; error?: string; inputMode?: 'numeric' | 'email' | 'tel'; autoComplete?: string; maxLength?: number }) {
  const slot = (['fullName', 'email', 'phone', 'password'].includes(name) ? name : 'email') as 'fullName' | 'email' | 'phone' | 'password'
  const labelMotion = useAuthSlot(`${slot}Label`)
  const inputMotion = useAuthSlot(slot)
  return <label className="auth-field block"><motion.span {...labelMotion} className="label">{label}</motion.span><motion.input {...inputMotion} name={name} type={type} autoComplete={autoComplete} inputMode={inputMode} maxLength={maxLength} className={`field ${error ? 'field-error' : ''}`} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} />{error && <span id={`${name}-error`} className="error-text" role="alert">{error}</span>}</label>
}

function AuthTitle({ children }: { children: ReactNode }) {
  const animation = useAuthSlot('title')
  return <motion.h2 {...animation} className="font-brand text-2xl font-bold">{children}</motion.h2>
}
function AuthSubmit({ busy = false, busyLabel = 'Signing in…', children }: { busy?: boolean; busyLabel?: string; children: ReactNode }) {
  const animation = useAuthSlot('submit')
  const textMotion = useAuthSlot('submitText')
  return <motion.button {...animation} disabled={busy} aria-busy={busy} className="auth-submit pill-button btn-ink w-full" type="submit"><motion.span {...textMotion}>{busy ? <><LoaderCircle className="animate-spin" size={16} /> {busyLabel}</> : <>{children} <ArrowRight size={15} /></>}</motion.span></motion.button>
}
function AuthFoot({ children }: { children: ReactNode }) {
  const animation = useAuthSlot('foot')
  return <motion.p {...animation} className="mt-5 text-center text-xs text-[var(--green)]">{children}</motion.p>
}
export function LoginPage() {
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const values = new FormData(event.currentTarget)
    const phone = normalizeNepalPhone(values.get('phone'))
    const password = String(values.get('password') || '')
    const next: Errors = {}
    if (!phone) next.phone = 'Enter a valid Nepali mobile number, for example 9812345678.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    try {
      const user = await authService.login(phone, password)
      profileService.acceptApiUser(user)
      await profileService.refreshAddresses()
      navigate('/member')
    } catch (reason) { setErrors({ form: reason instanceof Error ? reason.message : 'Could not open your profile. Please try again.' }) }
    finally { setBusy(false) }
  }
  return <AuthScaffold title="Welcome back home." subtitle="Faster checkout • live tracking • member-only market drops">
    <AuthTitle>Member access</AuthTitle>
    <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">Sign in with the mobile number linked to your membership.</p>
    <form onSubmit={submit} noValidate>
      <FormField label="Mobile number" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+97798XXXXXXXX" error={errors.phone} />
      <FormField label="Password" name="password" type="password" autoComplete="current-password" placeholder="Your password" error={errors.password} />
      <div className="auth-options"><span>Secure member access.</span><Link to="/forgot-password">Forgot password?</Link></div>
      {errors.form && <p className="error-text" role="alert">{errors.form}</p>}
      <AuthSubmit busy={busy} busyLabel="Signing in…">Enter Griha Mart</AuthSubmit>
    </form>
    <AuthFoot>New to Griha Mart? <Link className="font-bold" to="/register">Create your membership →</Link></AuthFoot>
  </AuthScaffold>
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (busy) return
    const form = event.currentTarget
    const values = new FormData(form)
    const next = validate(values, ['fullName', 'phone', 'password']); if (!normalizeNepalPhone(values.get('phone'))) next.phone = 'Enter a valid Nepali mobile number, for example 9812345678.'; setErrors(next)
    if (!Object.keys(next).length) {
      setBusy(true)
      try { await authService.signup({ fullName: String(values.get('fullName') || ''), phone: normalizeNepalPhone(values.get('phone')), password: String(values.get('password') || '') }); form.reset(); navigate('/login') }
      catch (reason) { setErrors({ form: reason instanceof Error ? reason.message : 'Could not save your profile. Please try again.' }); setBusy(false) }
    }
  }
  return <AuthScaffold mode="register" title="Become a Griha member." subtitle="Earn points, save addresses and make every grocery run faster.">
    <AuthTitle>Create membership</AuthTitle>
    <p className="mt-4 text-xs text-[var(--muted)]">Your membership, all in one place.</p>
    <form onSubmit={submit} noValidate>
      <FormField label="Full name" name="fullName" autoComplete="name" placeholder="Your full name" error={errors.fullName} />
      <FormField label="Phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+97798XXXXXXXX" error={errors.phone} />
      <FormField label="Password" name="password" type="password" autoComplete="new-password" placeholder="Minimum 8 characters" error={errors.password} />
      {errors.form && <p className="error-text" role="alert">{errors.form}</p>}
      <AuthSubmit busy={busy} busyLabel="Creating account…">Create account</AuthSubmit>
    </form>
    <AuthFoot>Already a member? <Link className="font-bold" to="/login">Sign in →</Link></AuthFoot>
  </AuthScaffold>
}

export function PasswordRecoveryPage() {
  const [errors, setErrors] = useState<Errors>({})
  const [phone, setPhone] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const [success, setSuccess] = useState(false)
  useEffect(() => { if (!resendIn) return; const timer = window.setInterval(() => setResendIn(value => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer) }, [resendIn])
  const sendCode = () => {
    if (sending || resendIn > 0) return
    if (!normalizeNepalPhone(phone)) { setErrors(current => ({ ...current, phone: 'Enter a valid Nepali mobile number, for example 9812345678.' })); return }
    setErrors({}); setSending(true)
    window.setTimeout(() => { setSending(false); setCodeSent(true); setResendIn(30) }, 650)
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const next = validate(values, ['code', 'password'])
    if (!codeSent) next.code = 'Send a verification code first.'
    else if (!/^\d{6}$/.test(String(values.get('code') || ''))) next.code = 'Enter the six-digit verification code.'
    setErrors(next)
    if (!Object.keys(next).length) setSuccess(true)
  }
  return <AuthScaffold mode="recovery" title="Welcome back is one code away." subtitle="A little help getting back to your account."><h2 className="font-brand text-2xl font-bold">Reset access</h2>{success ? <div role="status" className="mt-8 rounded-3xl bg-[var(--mint)] p-6"><h3 className="font-brand text-xl font-bold">Your request is ready.</h3><p className="mt-2 text-sm">Return to sign in after your new password is confirmed.</p><Link className="pill-button btn-ink mt-5" to="/login">Return to login</Link></div> : <form onSubmit={submit} noValidate className="mt-8 space-y-5"><label className="auth-field block"><span className="label">Mobile number</span><span className={`auth-recovery-phone ${errors.phone ? 'field-error' : ''}`}><input value={phone} onChange={event => setPhone(event.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+97798XXXXXXXX" aria-label="Mobile number for password recovery" /><button type="button" disabled={sending || resendIn > 0} onClick={sendCode}>{sending ? 'Sending…' : codeSent ? resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code' : 'Send code'}</button></span>{errors.phone && <span className="error-text" role="alert">{errors.phone}</span>}{codeSent && <span className="auth-field-help" role="status">Verification code requested for {normalizeNepalPhone(phone)}.</span>}</label><FormField label="One-time code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" error={errors.code} /><FormField label="New password" name="password" type="password" autoComplete="new-password" placeholder="Minimum 8 characters" error={errors.password} /><button className="pill-button btn-ink w-full">Reset password <ArrowRight size={15} /></button></form>}<p className="mt-16 text-center text-[10px] text-[var(--muted)]">Griha Mart • Here to help</p></AuthScaffold>
}
