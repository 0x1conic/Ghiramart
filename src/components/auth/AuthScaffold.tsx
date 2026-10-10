import type { ReactNode } from 'react'
import { products } from '../../data/mockData'
import { FloatingProduct, PageTransition, Reveal } from '../motion/MotionPrimitives'
import { ProductArt } from '../common/ProductArt'
import { BrandMark } from '../common/BrandMark'
import { CinematicAuth } from './CinematicAuth'

export function AuthScaffold({ title, subtitle, children, mode = 'login' }: { title: string; subtitle: string; children: ReactNode; mode?: 'login' | 'register' | 'recovery' }) {
  if (mode !== 'recovery') return <CinematicAuth register={mode === 'register'}>{children}</CinematicAuth>
  const heroProducts = mode === 'recovery' ? [products[4], products[0], products[3]] : [products[0], products[1], products[3]]
  return (
    <PageTransition className="min-h-svh bg-[var(--blue)] text-white md:grid md:grid-cols-2">
      <section className="relative hidden min-h-svh overflow-hidden p-12 md:block lg:p-16">
        <BrandMark light />
        <Reveal from="left"><h1 className="section-title mt-24 max-w-xl text-[4rem] uppercase">{title}</h1><p className="mt-4 max-w-lg text-lg text-white/80">{subtitle}</p></Reveal>
        <div className="absolute bottom-[8%] left-[20%] h-[44%] aspect-square rounded-full bg-[var(--lime)] text-[var(--ink)]">
          {heroProducts.map((product, index) => <FloatingProduct key={product.id} className={`absolute ${index === 0 ? 'left-[35%] top-[10%] w-[30%]' : index === 1 ? 'left-[15%] top-[36%] w-[20%]' : 'right-[12%] top-[40%] w-[22%]'}`} duration={8} offset={10} delay={index * .18}><ProductArt product={product} /></FloatingProduct>)}
          <span className="absolute bottom-[16%] left-[23%] font-brand text-lg font-bold uppercase">Secure. Simple.</span>
        </div>
      </section>
      <section className="flex min-h-svh items-center justify-center p-5 md:bg-[radial-gradient(circle_at_100%_100%,#12238f,#384fff_65%)] md:p-10">
        <div className="w-full max-w-[560px]">
          <div className="mb-8 md:hidden"><BrandMark light /><h1 className="section-title mt-12 text-5xl uppercase">{title}</h1><p className="mt-2 text-sm text-white/75">{subtitle}</p></div>
          <Reveal from="right" className="rounded-[34px] bg-[var(--paper)] p-7 text-[var(--ink)] shadow-2xl md:p-12">{children}</Reveal>
        </div>
      </section>
    </PageTransition>
  )
}
