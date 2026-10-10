import { useSyncExternalStore } from 'react'
import type { Address, User } from '../types'
import type { ApiUser } from './apiContracts'
import { clearAccessToken } from './api'
import { apiRequest, getAccessToken } from './api'
import type { ApiAddress } from './apiContracts'

type Profile = { user: User; addresses: Address[] }
type Snapshot = { user: User | null; addresses: Address[]; profiles: Profile[]; error: string }
const registryKey = 'griha-mart:demo-profiles:v1'
const selectionKey = 'griha-mart:demo-profile-selection'
const guestKey = 'griha-mart:demo-guest'
const listeners = new Set<() => void>()
const randomId = () => Array.from(crypto.getRandomValues(new Uint32Array(3)), part => part.toString(36)).join('-')
const text = (value: unknown, max: number): value is string => typeof value === 'string' && value.length <= max
export function validateProfile(input: { fullName: string; email: string; phone: string }) {
  if (!text(input.fullName, 100) || !input.fullName.trim()) throw new Error('Enter your full name (up to 100 characters).')
  if (!text(input.email, 254) || (input.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))) throw new Error('Enter a valid email address.')
  if (!text(input.phone, 40) || !input.phone.trim()) throw new Error('Enter your phone number (up to 40 characters).')
}
function initials(name: string) { return name.trim().split(/\s+/u).slice(0, 2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase() }
function read(): Snapshot {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(registryKey) || '[]')
    if (!Array.isArray(parsed)) throw new Error('Invalid profile data')
    const profiles: Profile[] = parsed.map(profile => {
      if (!profile || !profile.user || !Array.isArray(profile.addresses)) throw new Error('Invalid profile')
      const user = profile.user as User
      validateProfile(user)
      const referralCode = typeof user.referralCode === 'string' && user.referralCode.trim() ? user.referralCode : `GRIHA-${user.id}`
      if (!text(user.id, 120) || !/^[a-z0-9-]+$/i.test(user.id) || !Number.isFinite(user.rewardPoints) || user.rewardPoints < 0 || !['Green', 'Gold'].includes(user.tier) || !text(referralCode, 100)) throw new Error('Invalid profile')
      for (const address of profile.addresses) {
        if (!address || !['id', 'label', 'recipient', 'phone', 'line1', 'city'].every(key => text(address[key], 240)) || typeof address.isDefault !== 'boolean') throw new Error('Invalid address')
      }
      return { user: { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, avatarInitials: initials(user.fullName), rewardPoints: user.rewardPoints, tier: user.tier, referralCode }, addresses: profile.addresses }
    })
    const selected = sessionStorage.getItem(selectionKey)
    const profile = profiles.find(profile => profile.user.id === selected)
    return { user: profile?.user ?? null, addresses: profile?.addresses ?? [], profiles, error: '' }
  } catch { return { user: null, addresses: [], profiles: [], error: 'We couldn’t load your profile. Your saved data has not been changed. Please check your browser’s storage settings and try again.' } }
}
let snapshot = read()
let fallbackGuest = 'guest-' + randomId()
function publish() { snapshot = read(); listeners.forEach(listener => listener()) }
function available() { const current = read(); if (current.error) throw new Error(current.error); return current }
function write(profiles: Profile[]) {
  try { localStorage.setItem(registryKey, JSON.stringify(profiles)) }
  catch { throw new Error('Could not save your profile. Check browser storage and retry.') }
}
function select(id: string) {
  try { sessionStorage.setItem(selectionKey, id) }
  catch { throw new Error('Could not open your profile. Check browser storage and retry.') }
  publish()
}
function mapAddress(address: ApiAddress, recipient: string): Address { return { id: String(address.id), label: address.address_type === 'primary' ? 'Home' : 'Other', recipient, phone: address.phone_number, line1: address.street, city: address.city, note: address.state, isDefault: address.address_type === 'primary' } }
window.addEventListener('storage', event => { if (event.key === registryKey || event.key === null) publish() })

/** UI-only profile selection, NOT password authentication or an authorization boundary.
 * No passwords or auth tokens are accepted, stored or verified by this adapter. */
export const profileService = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
  getSnapshot: () => snapshot,
  viewerId(): string {
    const user = snapshot.user
    if (user) return user.id
    try {
      const saved = sessionStorage.getItem(guestKey)
      if (saved && /^guest-[a-z0-9-]+$/i.test(saved)) return saved
      sessionStorage.setItem(guestKey, fallbackGuest)
    } catch { /* An in-memory guest can still browse when storage is unavailable. */ }
    return fallbackGuest
  },
  acceptApiUser(remote: ApiUser): User {
    const { profiles } = available()
    const id = String(remote.id)
    const previous = profiles.find(profile => profile.user.id === id)
    const user: User = { id, fullName: remote.full_name, email: previous?.user.email || '', phone: remote.phone, avatarInitials: initials(remote.full_name), rewardPoints: previous?.user.rewardPoints || 0, tier: previous?.user.tier || 'Green', referralCode: previous?.user.referralCode || `GRIHA-${id}` }
    write(previous ? profiles.map(profile => profile.user.id === id ? { ...profile, user } : profile) : [...profiles, { user, addresses: [] }])
    select(id)
    return user
  },
  async refreshAddresses(): Promise<Address[]> {
    const { user, profiles } = available()
    if (!user || !getAccessToken('customer')) return snapshot.addresses
    const response = await apiRequest<{ addresses: ApiAddress[] }>('/address')
    const addresses = response.addresses.map(address => mapAddress(address, user.fullName))
    write(profiles.map(profile => profile.user.id === user.id ? { ...profile, addresses } : profile)); publish()
    return addresses
  },
  async register(input: { fullName: string; email: string; phone: string }): Promise<User> {
    validateProfile(input)
    const { profiles } = available()
    const email = input.email.trim().toLowerCase()
    if (profiles.some(profile => profile.user.email.toLowerCase() === email)) throw new Error('A membership with this email already exists. Please sign in.')
    const id = 'member-' + randomId()
    const user: User = { id, fullName: input.fullName.trim(), email, phone: input.phone.trim(), avatarInitials: initials(input.fullName), rewardPoints: 0, tier: 'Green', referralCode: 'GRIHA-' + id.slice(-8).toUpperCase() }
    write([...profiles, { user, addresses: [] }]); select(id)
    return user
  },
  async signIn(email: string): Promise<User> {
    const { profiles } = available()
    const profile = profiles.find(profile => profile.user.email.toLowerCase() === email.trim().toLowerCase())
    if (!profile) throw new Error('No membership found. Check your email or create your membership.')
    select(profile.user.id)
    return profile.user
  },
  async signInWithPhone(phone: string): Promise<User> {
    const { profiles } = available()
    const digits = phone.replace(/\D/g, '').replace(/^977/, '')
    const profile = profiles.find(item => item.user.phone.replace(/\D/g, '').replace(/^977/, '') === digits)
    if (!profile) throw new Error('No membership was found for this mobile number. Please create your membership first.')
    select(profile.user.id)
    return profile.user
  },
  signOut() {
    clearAccessToken('customer')
    try { sessionStorage.removeItem(selectionKey); sessionStorage.removeItem(guestKey) }
    catch { throw new Error('Could not sign out. Please close this tab.') }
    fallbackGuest = 'guest-' + randomId(); publish()
  },
  async update(input: { fullName: string; email: string; phone: string }): Promise<User> {
    validateProfile(input)
    const { user, profiles } = available()
    if (!user) throw new Error('Please sign in first.')
    const email = input.email.trim().toLowerCase()
    if (profiles.some(profile => profile.user.id !== user.id && profile.user.email.toLowerCase() === email)) throw new Error('That email is already used by another membership.')
    const updated = { ...user, fullName: input.fullName.trim(), email, phone: input.phone.trim(), avatarInitials: initials(input.fullName) }
    write(profiles.map(profile => profile.user.id === user.id ? { ...profile, user: updated } : profile)); publish()
    return updated
  },
  async addAddress(input: { label: string; line1: string; city: string; phone: string }): Promise<Address> {
    const { user, profiles, addresses } = available()
    if (!user) throw new Error('Please sign in first.')
    if (!Object.values(input).every(value => text(value, 200) && value.trim())) throw new Error('Complete the address fields (up to 200 characters each).')
    const remote = getAccessToken('customer') ? await apiRequest<ApiAddress>('/address', { method: 'POST', body: JSON.stringify({ street: input.line1.trim(), city: input.city.trim(), state: 'Gandaki', phone_number: input.phone.trim(), address_type: addresses.length === 0 ? 'primary' : 'secondary' }) }) : undefined
    const address: Address = remote ? mapAddress(remote, user.fullName) : { id: 'addr-' + randomId(), label: input.label.trim(), line1: input.line1.trim(), city: input.city.trim(), phone: input.phone.trim(), recipient: user.fullName, isDefault: addresses.length === 0 }
    write(profiles.map(profile => profile.user.id === user.id ? { ...profile, addresses: [...profile.addresses, address] } : profile)); publish()
    return address
  },
  async updateAddress(id: string, input: { label: string; line1: string; city: string; phone: string }): Promise<Address> {
    const { user, profiles } = available()
    if (!user) throw new Error('Please sign in first.')
    if (!Object.values(input).every(value => text(value, 200) && value.trim())) throw new Error('Complete the address fields (up to 200 characters each).')
    const existing = snapshot.addresses.find(address => address.id === id)
    if (!existing) throw new Error('Address not found.')
    const remote = getAccessToken('customer') && /^\d+$/.test(id) ? await apiRequest<ApiAddress>(`/address/${id}`, { method: 'PATCH', body: JSON.stringify({ street: input.line1.trim(), city: input.city.trim(), state: existing.note || 'Gandaki', phone_number: input.phone.trim(), address_type: input.label.toLowerCase() === 'home' ? 'primary' : 'secondary' }) }) : undefined
    const updated = remote ? mapAddress(remote, user.fullName) : { ...existing, label: input.label.trim(), line1: input.line1.trim(), city: input.city.trim(), phone: input.phone.trim() }
    const addresses = snapshot.addresses.map(address => address.id === id ? updated : address)
    write(profiles.map(profile => profile.user.id === user.id ? { ...profile, addresses } : profile)); publish()
    return updated
  },
  async removeAddress(id: string): Promise<void> {
    const { user, profiles } = available()
    if (!user) throw new Error('Please sign in first.')
    if (getAccessToken('customer') && /^\d+$/.test(id)) await apiRequest<void>(`/address/${id}`, { method: 'DELETE' })
    const addresses = snapshot.addresses.filter(address => address.id !== id)
    write(profiles.map(profile => profile.user.id === user.id ? { ...profile, addresses } : profile)); publish()
  },
}
export function useIdentity() { return useSyncExternalStore(profileService.subscribe, profileService.getSnapshot) }
const guest: User = { id: 'guest', fullName: 'Guest', email: '', phone: '', avatarInitials: 'G', rewardPoints: 0, tier: 'Green' }
export function useMemberProfile() {
  const state = useIdentity()
  return { ...state, currentUser: state.user ?? guest, referral: { code: state.user?.referralCode || '', senderReward: 1500, friendCredit: 150, completedReferrals: 0 } }
}
