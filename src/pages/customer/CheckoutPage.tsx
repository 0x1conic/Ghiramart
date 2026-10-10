import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageTransition, Reveal } from '../../components/motion/MotionPrimitives'
import { useCart } from '../../context/CartContext'
import { useIdentity } from '../../services/profileService'
import { checkoutService } from '../../services/mockService'
import { bookingRequestId } from '../../services/orderService'
import { BookingTotals } from '../../components/commerce/BookingDetails'
import type { PaymentMethod } from '../../types'

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'cash-on-delivery', label: 'Cash on delivery' },
]

export function CheckoutPage() {
  const { user, addresses } = useIdentity()
  const selectedAddress = addresses.find(address => address.isDefault) ?? addresses[0]
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()
  const [payment, setPayment] = useState<PaymentMethod>('cash-on-delivery')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  const [requestId] = useState(bookingRequestId)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending.current || !cart.items.length) return
    const values = new FormData(event.currentTarget)
    const address = { id: selectedAddress?.id || 'booking-contact', label: selectedAddress?.label || 'Booking contact', isDefault: false, recipient: String(values.get('recipient') || '').trim(), phone: String(values.get('phone') || '').trim(), line1: String(values.get('address') || '').trim(), city: String(values.get('city') || '').trim() }
    pending.current = true; setError(''); setProcessing(true)
    try {
      const order = await checkoutService.placeOrder({ requestId, paymentMethod: payment, address, items: cart.items })
      clearCart()
      navigate(`/order-confirmation/${order.id}`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Booking could not be saved.'); setProcessing(false); pending.current = false
    }
  }

  return (
    <PageTransition className="checkout-page page-shell min-h-svh bg-[var(--black)] text-white">
      <form onSubmit={submit} className="content-wrap grid gap-9 py-8 md:grid-cols-[1.15fr_.85fr] md:items-center">
        <Reveal from="left">
          <h1 className="display-title text-[4.8rem] md:text-[5.4rem]">Your basket.<br />Ready to book.</h1>
          <fieldset key={user?.id || 'guest'} disabled={processing} className="mt-8 rounded-3xl bg-[var(--paper)] p-6 text-[var(--ink)]"><legend className="sr-only">Booking contact details</legend><span className="eyebrow text-[var(--green)]">01 &nbsp; Contact details</span><div className="mt-5 grid gap-4 sm:grid-cols-2">{[
            { name: 'recipient', label: 'Your name', value: user?.fullName || '', autoComplete: 'name' },
            { name: 'phone', label: 'Phone', value: user?.phone || '', autoComplete: 'tel' },
            { name: 'address', label: 'Address', value: selectedAddress?.line1 || '', autoComplete: 'street-address' },
            { name: 'city', label: 'City', value: selectedAddress?.city || '', autoComplete: 'address-level2' },
          ].map(field => <label key={field.name} className="min-w-0"><span className="label">{field.label}</span><input required maxLength={200} name={field.name} defaultValue={field.value} autoComplete={field.autoComplete} type={field.name === 'phone' ? 'tel' : 'text'} className="field bg-white" /></label>)}</div></fieldset>
          <fieldset disabled={processing} className="mt-5 rounded-3xl bg-[#12684a] p-6"><legend className="sr-only">Payment method</legend><span className="eyebrow text-[var(--amber)]">02 &nbsp; Payment preference</span><div className="mt-4 grid gap-2">{paymentOptions.map((option) => <button type="button" key={option.value} aria-pressed={payment === option.value} onClick={() => setPayment(option.value)} className={`flex min-h-10 items-center rounded-full px-5 text-left text-xs font-bold ${payment === option.value ? 'bg-[var(--amber)] text-[var(--ink)]' : 'bg-white/12'}`}>{payment === option.value && <CheckCircle2 className="mr-2" size={14} />}{option.label}</button>)}</div></fieldset>
          <AnimatePresence>{error && <motion.div role="alert" className="mt-5 rounded-2xl bg-[#d12638] p-4 text-sm font-bold" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{error}<button type="button" className="ml-3 underline" onClick={() => setPayment('cash-on-delivery')}>Change method</button></motion.div>}</AnimatePresence>
        </Reveal>
        <Reveal from="right" delay={.12} className="flex min-h-[500px] flex-col justify-between rounded-[40px] bg-[var(--paper)] p-8 text-[var(--ink)] md:p-12">
          <div><h2 className="font-display text-6xl leading-[.95]">Place your<br />order.</h2><ul className="mt-6 space-y-3 text-sm">{cart.items.map(item => <li key={item.product.id} className="flex justify-between gap-3"><span>{item.product.name}</span><strong>× {item.quantity}</strong></li>)}</ul><BookingTotals order={cart} /><p className="mt-4 text-xs">Pay the delivery team when your groceries arrive.</p>{!cart.items.length && <p role="status" className="mt-5">Your basket is empty. <Link className="underline" to="/market">Browse the market</Link></p>}</div>
          <button disabled={processing || !cart.items.length} aria-busy={processing} className="pill-button btn-blue mt-8 w-full">{processing ? <><LoaderCircle className="animate-spin" size={17} /> Saving booking</> : <>Place order <ArrowRight size={16} /></>}</button>
        </Reveal>
      </form>
    </PageTransition>
  )
}
