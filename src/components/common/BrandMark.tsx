import { Link } from 'react-router-dom'

export function BrandMark({ admin = false, light = false, to }: { admin?: boolean; light?: boolean; to?: string }) {
  return (
    <Link to={to ?? (admin ? '/admin' : '/')} className={`brand-lockup ${light ? 'brand-lockup-light' : ''}`} aria-label={admin ? 'Griha Mart admin home' : 'Griha Mart home'}>
      <img src="/assets/brand/griha-mart-logo.png" width="60" height="60" alt="" className="brand-logo" />
      <span className="brand-copy"><span className="brand-name" lang="ne"><span>गृह</span> <span>मार्ट</span></span><span className="brand-tagline" lang="ne">घरका लागि सबै कुरा</span>{admin && <span className="brand-admin">ADMIN</span>}</span>
    </Link>
  )
}
