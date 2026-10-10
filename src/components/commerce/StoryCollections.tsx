import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { products } from '../../data/mockData'
import { ProductArt } from '../common/ProductArt'
import { ScrollReveal } from '../motion/ScrollReveal'

export function StoryCollections() {
  return <section className="content-wrap story-section py-16 md:py-24">
    <ScrollReveal className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><span className="eyebrow text-[var(--green)]">01 / A LITTLE INSPIRATION</span><h2 className="mt-3 font-brand text-3xl font-bold tracking-tight md:text-5xl">What feels like home?</h2></div><Link to="/market" className="inline-flex items-center gap-2 text-sm font-bold">Find your favourites <ArrowUpRight size={18} /></Link></ScrollReveal>
    <div className="story-collection">
      <ScrollReveal direction={-1}><Link to="/market?category=rice-dal" className="story-feature block group">
        <span className="eyebrow text-[var(--green)]">THE DAL–BHAT EDIT</span><h3 className="mt-6">Some things<br />just feel<br />like home.</h3>
        <div className="story-feature-art"><ScrollReveal className="story-rice" direction={-1} delay={.15}><ProductArt product={products[0]} /></ScrollReveal><ScrollReveal className="story-dal" delay={.3}><ProductArt product={products[1]} /></ScrollReveal></div>
        <div className="story-note">Rice. Dal. One more helping.<br /><span className="mt-3 flex items-center justify-between font-bold">Build your pantry <ArrowUpRight size={18} /></span></div>
      </Link></ScrollReveal>
      <div className="story-side">
        {[{ product: products[3], category: 'fresh', eyebrow: 'PICKED FOR TODAY', lines: ['A little colour.', 'A lot of flavour.'], action: 'Shop fresh', color: 'bg-[#f2c9ad]' }, { product: products[4], category: 'breakfast', eyebrow: 'SLOW MORNINGS, SORTED', lines: ['First, chai.', 'Then, everything.'], action: 'Shop breakfast', color: 'bg-[#e4e2f1]' }].map((item, index) =>
          <ScrollReveal key={item.category} delay={index * .1}><Link to={`/market?category=${item.category}`} className={`story-small group ${item.color}`}>
            <div className="relative z-10"><span className="eyebrow">{item.eyebrow}</span><h3 className="mt-4">{item.lines[0]}<br />{item.lines[1]}</h3><span className="mt-5 inline-flex items-center gap-2 text-xs font-bold">{item.action} <ArrowUpRight size={16} /></span></div>
            <ScrollReveal className="story-small-art" delay={.25}><ProductArt product={item.product} /></ScrollReveal>
          </Link></ScrollReveal>)}
      </div>
    </div>
  </section>
}
