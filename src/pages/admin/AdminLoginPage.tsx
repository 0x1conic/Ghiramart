import { ArrowLeft, ArrowRight, Boxes, LoaderCircle, PackageCheck, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandMark } from '../../components/common/BrandMark'
import { PageTransition } from '../../components/motion/MotionPrimitives'
import { authService } from '../../services/authService'
import './AdminLoginPage.css'

type LoginErrors = { email?: string; code?: string; form?: string }

export function AdminLoginPage() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [errors, setErrors] = useState<LoginErrors>({})
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim()
    const code = String(form.get('code') || '')
    const next: LoginErrors = {}
    if (!email) next.email = 'Enter your admin email.'
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.'
    if (!/^\d{6}$/.test(code)) next.code = 'Enter the six-digit admin access code.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    try { await authService.adminLogin(email, code); navigate('/admin/dashboard') }
    catch (reason) { setErrors({ form: reason instanceof Error ? reason.message : 'Admin sign-in failed.' }) }
    finally { setBusy(false) }
  }

  const entrance = (delay: number) => reduced ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: .6, delay, ease: [0.22, 1, 0.36, 1] as const } }

  return <PageTransition className="admin-login-page">
    <div className="admin-login-glow admin-login-glow-one" />
    <div className="admin-login-glow admin-login-glow-two" />
    <header className="admin-login-header"><BrandMark admin light /><Link to="/" className="admin-login-back"><ArrowLeft size={16} /> Customer market</Link></header>
    <div className="admin-login-layout">
      <section className="admin-login-story" aria-labelledby="admin-login-heading">
        <motion.div {...entrance(.05)}><span className="admin-login-kicker"><Sparkles size={14} /> Griha Mart operations</span><h1 id="admin-login-heading">The whole market.<br /><em>One clear view.</em></h1><p>Manage products, review customer bookings and keep every shelf ready from one focused workspace.</p></motion.div>
        <motion.div {...entrance(.16)} className="admin-login-capabilities" aria-label="Admin capabilities">
          <span><Boxes /><strong>Inventory</strong><small>Products and stock</small></span>
          <span><PackageCheck /><strong>Bookings</strong><small>Review and confirm</small></span>
          <span><Users /><strong>Customers</strong><small>Rewards and referrals</small></span>
        </motion.div>
        <motion.div {...entrance(.25)} className="admin-login-orbit" aria-hidden="true">
          <div className="admin-login-orbit-ring" />
          <img className="admin-login-product admin-login-rice" src="/assets/products/basmati-rice.png" alt="" />
          <img className="admin-login-product admin-login-dal" src="/assets/products/masoor-dal.png" alt="" />
          <img className="admin-login-product admin-login-oil" src="/assets/products/mustard-oil.png" alt="" />
          <div className="admin-login-orbit-core"><ShieldCheck /><span>CONTROL<br />ROOM</span></div>
        </motion.div>
      </section>

      <motion.section {...entrance(.12)} className="admin-login-card" aria-label="Admin sign in">
        <div className="admin-login-card-top"><span><ShieldCheck size={16} /> Admin access</span><i aria-hidden="true" /></div>
        <h2>Welcome back.</h2>
        <p className="admin-login-card-copy">Sign in to open today’s Griha Mart operations.</p>
        <form onSubmit={submit} noValidate>
          <label className="admin-login-field"><span>Admin email</span><input name="email" type="email" autoComplete="username" inputMode="email" placeholder="admin@grihamart.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'admin-email-error' : undefined} />{errors.email && <small id="admin-email-error" role="alert">{errors.email}</small>}</label>
          <label className="admin-login-field"><span>Six-digit access code</span><input name="code" type="password" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" placeholder="••••••" aria-invalid={Boolean(errors.code)} aria-describedby={errors.code ? 'admin-code-error' : undefined} />{errors.code && <small id="admin-code-error" role="alert">{errors.code}</small>}</label>
          {errors.form && <p className="mt-3 text-xs text-red-700" role="alert">{errors.form}</p>}
          <button className="admin-login-submit" type="submit" disabled={busy} aria-busy={busy}><span>{busy ? 'Checking access…' : 'Enter dashboard'}</span>{busy ? <LoaderCircle className="animate-spin" size={17} /> : <ArrowRight size={17} />}</button>
        </form>
        <div className="admin-login-trust"><ShieldCheck size={18} /><p><strong>Team access</strong><span>For authorised Griha Mart staff.</span></p></div>
      </motion.section>
    </div>
  </PageTransition>
}
