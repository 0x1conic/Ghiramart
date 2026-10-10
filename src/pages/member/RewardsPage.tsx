import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Check, Copy, Gift, Leaf, Share2, ShoppingBag, Sparkles, Star, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../../components/commerce/ProductCard'
import { DepthSurface } from '../../components/motion/DepthSurface'
import { PageTransition } from '../../components/motion/MotionPrimitives'
import { useMemberProfile } from '../../services/profileService'
import { useCatalog } from '../../services/productService'
import type { RewardTransaction } from '../../types'
import './RewardsPage.css'

const rewardTransactions: RewardTransaction[] = []

export function RewardsPage() {
  const { currentUser, user, referral } = useMemberProfile()
  const { published } = useCatalog()
  const deals = published.filter(product => product.salePrice).slice(0, 4)
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState<'all' | 'earned' | 'redeemed'>('all')
  const reduced = useReducedMotion()
  const history = rewardTransactions.filter((item) => tab === 'all' || (tab === 'earned' ? item.points > 0 : item.points < 0))

  const copy = async (value: string, message: string) => {
    if (!user || !value) { setNotice('Sign in to see your personal referral code.'); return }
    try {
      await navigator.clipboard.writeText(value)
      setNotice(message)
    } catch {
      setNotice('Copy is unavailable in this browser. Your code is ' + referral.code)
    }
  }
  const share = async () => {
    if (!user) { setNotice('Sign in to share your personal invitation.'); return }
    const url = new URL('/register', window.location.origin)
    url.searchParams.set('ref', referral.code)
    if (!navigator.share) return copy(url.toString(), 'Referral link copied. Share it with a friend.')
    try { await navigator.share({ title: 'A little gift from Griha Mart', text: 'Your first basket comes with NPR 150 in credit.', url: url.toString() }) }
    catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setNotice('Sharing is unavailable. Use Copy code to invite a friend.') }
  }

  return <PageTransition className="page-shell rewards-page text-[var(--ink)]">
    <section className="rewards-hero">
      <div className="content-wrap pt-6 md:pt-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--muted)]"><Link to="/" className="hover:text-[var(--green)]">Home</Link><span>/</span><span aria-current="page">Offers & rewards</span></nav>
        <div className="grid items-center gap-6 pb-9 pt-5 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <span className="eyebrow inline-flex items-center gap-2 text-[var(--green)]"><span className="size-2 rounded-full bg-[var(--green)]" /> THE GOOD THINGS ADD UP</span>
            <h1 className="mt-5 font-brand text-[clamp(2.8rem,5.1vw,5.2rem)] font-bold leading-[1.02] tracking-[-.065em]">Good food.<br />Even better <span className="text-[var(--green)]">perks.</span></h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--muted)]">A little thank you for every basket. Discover today’s offers, turn points into groceries, and share something good.</p>
            <div className="mt-7 flex flex-wrap gap-3"><a href="#today-offers" className="pill-button bg-[var(--green)] text-white">Explore today’s offers <ArrowRight size={16} /></a><a href="#referral" className="pill-button border border-black/10 bg-white">Invite a friend <Users size={16} /></a></div>
            <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ShieldMark /> Your everyday shop. A little more rewarding.</p>
          </div>
          <motion.div className="membership-scene" initial={reduced ? false : { opacity: 0, y: 25, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 90, damping: 20 }}>
            <DepthSurface className="membership-card">
              <div className="membership-face">
                <div className="depth-raised flex items-center justify-between"><span className="flex items-center gap-3 font-brand text-sm font-bold tracking-widest"><img src="/assets/brand/griha-mart-logo.png" alt="" width="34" height="34" className="rounded-full" /> GRIHA / CLUB</span><Leaf size={25} className="text-[#dbefb3]" /></div>
                <div className="depth-raised mt-9"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#dbe8ce]">Your points, your possibilities</p><p className="mt-2 font-brand text-5xl font-bold tracking-tight">{currentUser.rewardPoints.toLocaleString()} <span className="text-sm text-[#dbe8ce]">PTS</span></p></div>
                <div className="depth-raised mt-8 flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-widest text-[#dbe8ce]">Member</p><p className="identity-text mt-1 text-sm font-semibold" data-testid="member-card-name">{user ? currentUser.fullName : 'Sign in to join'}</p></div><span className="rounded-full border border-[#dcf0bd]/40 px-3 py-1.5 text-[10px] font-bold uppercase text-[#e0f2c4]">{user ? currentUser.tier + ' tier' : 'Guest'}</span></div>
              </div>
            </DepthSurface>
            <div aria-hidden="true" className="reward-coin reward-coin-top">✦</div><div aria-hidden="true" className="reward-coin reward-coin-bottom">G</div>
          </motion.div>
        </div>
      </div>
    </section>

    <div className="content-wrap">
      <section aria-label="Your rewards balance" className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-black/6 bg-white p-6"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-[var(--muted)]">Ready to spend</span><Gift size={18} className="text-[var(--green)]" /></div><p className="mt-4 font-brand text-3xl font-bold">NPR {Math.floor(currentUser.rewardPoints / 10)}<span className="ml-2 text-xs font-normal text-[var(--muted)]">in rewards</span></p><Link to="/checkout" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[var(--green)]">Use at checkout <ArrowUpRight size={15} /></Link></article>
        <article className="rounded-3xl border border-black/6 bg-white p-6"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-[var(--muted)]">Next stop: Gold</span><Star size={18} className="text-[#97702a]" /></div><p className="mt-4 font-brand text-3xl font-bold">{Math.max(0, 3000 - currentUser.rewardPoints)}<span className="ml-2 text-xs font-normal text-[var(--muted)]">points to go</span></p><progress aria-label="Progress to Gold membership" max={3000} value={currentUser.rewardPoints} className="member-tier-progress mt-5" /></article>
        <article className="rounded-3xl border border-black/6 bg-[#edf3df] p-6"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-[var(--muted)]">Good things are better shared</span><Users size={18} className="text-[var(--green)]" /></div><p className="mt-4 font-brand text-3xl font-bold">{referral.completedReferrals}<span className="ml-2 text-xs font-normal text-[var(--muted)]">friends invited</span></p><a href="#referral" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[var(--green)]">Give NPR 150, earn 1,500 pts <ArrowUpRight size={15} /></a></article>
      </section>

      <section id="today-offers" className="scroll-mt-28 py-14 md:py-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><span className="eyebrow text-[var(--green)]">A GOOD DAY TO STOCK UP</span><h2 className="mt-3 font-brand text-3xl font-bold tracking-tight md:text-4xl">Little prices. Big everyday wins.</h2></div><Link to="/market" className="inline-flex items-center gap-2 text-xs font-bold">Shop the market <ArrowRight size={15} /></Link></div>
        <motion.div className="product-grid" initial="visible" animate="visible">{deals.map((product) => <ProductCard key={product.id} product={product} compact />)}</motion.div>
      </section>

      <section id="referral" className="referral-panel grid scroll-mt-28 gap-8 rounded-[32px] border border-black/5 p-6 md:grid-cols-2 md:p-10">
        <div><span className="eyebrow text-[var(--green)]">PASS THE GOODNESS ON</span><h2 className="mt-4 font-brand text-3xl font-bold leading-tight tracking-tight md:text-4xl">Their first basket.<br />Your next reward.</h2><p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">Give a friend NPR {referral.friendCredit} off their first order. When they join, you get {referral.senderReward.toLocaleString()} points. Everybody eats well.</p></div>
        <div className="self-center rounded-3xl border border-white bg-white/80 p-6"><label htmlFor="referral-code" className="text-xs font-semibold text-[var(--muted)]">Your personal invitation code</label><div className="mt-3 flex items-center gap-2"><input id="referral-code" aria-label="Your referral code" readOnly placeholder="Sign in for your code" value={referral.code} className="min-w-0 flex-1 bg-transparent font-brand text-2xl font-bold tracking-wide" /><button className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e8efdc] text-[var(--green)]" aria-label="Copy referral code" onClick={() => copy(referral.code, 'Referral code copied.')}>{notice === 'Referral code copied.' ? <Check size={18} /> : <Copy size={18} />}</button></div><button onClick={share} className="pill-button mt-5 w-full bg-[var(--green)] text-white"><Share2 size={15} /> Share your invitation</button><p role="status" className="mt-3 min-h-8 text-xs leading-relaxed text-[var(--green)]">{notice || 'A small invitation. A lovely reason to share.'}</p></div>
      </section>

      <section className="grid gap-9 py-14 md:grid-cols-[1fr_1.15fr] md:py-20">
        <div><span className="eyebrow text-[var(--green)]">EVERY LITTLE BIT COUNTS</span><h2 className="mt-3 font-brand text-3xl font-bold tracking-tight">Make the everyday count.</h2><div className="mt-6 grid grid-cols-2 gap-3">{[{ icon: ShoppingBag, label: 'Shop your staples', detail: '1 point for every NPR 1' }, { icon: Users, label: 'Bring a friend', detail: '1,500 referral points' }, { icon: Star, label: 'Leave a review', detail: '100 thank-you points' }, { icon: Sparkles, label: 'Weekend streak', detail: '2× weekend points' }].map(({ icon: Icon, label, detail }) => <div key={label} className="rounded-2xl border border-black/5 bg-white p-5"><Icon size={20} className="text-[var(--green)]" /><h3 className="mt-4 text-sm font-bold">{label}</h3><p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{detail}</p></div>)}</div></div>
        <div className="rounded-3xl border border-black/6 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="font-brand text-xl font-bold">Your points journal</h2><div className="flex gap-1" aria-label="Filter points history">{(['all', 'earned', 'redeemed'] as const).map((value) => <button key={value} aria-pressed={tab === value} onClick={() => setTab(value)} className={`rounded-full px-3 py-2 text-[11px] font-bold capitalize ${tab === value ? 'bg-[#e8efdc] text-[var(--green)]' : 'text-[var(--muted)] hover:bg-black/5'}`}>{value}</button>)}</div></div><div className="mt-4 divide-y divide-black/6">{!history.length && <p className="py-5 text-sm text-[var(--muted)]">{user ? 'No reward transactions yet. Your points activity will appear here.' : 'Sign in to see your points journal.'}</p>}{history.map((entry) => <div key={entry.id} className="reward-history-row flex items-center gap-3 py-5"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f1f4e9] text-[var(--green)]">{entry.points > 0 ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span><div className="flex-1"><p className="text-sm font-semibold">{entry.label}</p><p className="mt-1 text-xs text-[var(--muted)]">{entry.createdAt}</p></div><span className="text-sm font-bold text-[var(--green)]">{entry.points > 0 ? '+' : ''}{entry.points.toLocaleString()}</span></div>)}</div></div>
      </section>
    </div>
  </PageTransition>
}

function ShieldMark() { return <span className="grid size-5 place-items-center rounded-full bg-[#e5edda] text-[var(--green)]"><Check size={12} /></span> }
