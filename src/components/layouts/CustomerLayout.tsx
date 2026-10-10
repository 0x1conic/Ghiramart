import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { CustomerHeader } from '../navigation/CustomerHeader'
import { MobileBottomNav } from '../navigation/MobileBottomNav'
import { SiteFooter } from './SiteFooter'
import { authService } from '../../services/authService'
import { getAccessToken } from '../../services/api'
import { profileService, useIdentity } from '../../services/profileService'

export function CustomerLayout() {
  const location = useLocation()
  const { message } = useCart()
  const { user } = useIdentity()
  const hideFooter = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname) || location.pathname.startsWith('/order-confirmation/')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (user || !getAccessToken('customer')) return
    void authService.me().then(remote => { profileService.acceptApiUser(remote); return profileService.refreshAddresses() }).catch(() => profileService.signOut())
  }, [user])

  return (
    <div className="relative min-h-screen">
      <CustomerHeader />
      <AnimatePresence mode="wait"><Outlet key={location.pathname} /></AnimatePresence>
      {!hideFooter && <SiteFooter />}
      <MobileBottomNav />
      <AnimatePresence>{message && <motion.div role="status" className="glass-toast" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}>{message}</motion.div>}</AnimatePresence>
    </div>
  )
}
