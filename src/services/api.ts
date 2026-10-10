const configuredApiBase = String(import.meta.env.VITE_API_BASE_URL || '/api').trim()
export const API_BASE_URL = configuredApiBase.replace(/\/$/, '') || '/api'

type TokenScope = 'customer' | 'admin'
const tokenKeys: Record<TokenScope, string> = { customer: 'griha-mart:customer-token', admin: 'griha-mart:admin-token' }

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

export function getAccessToken(scope: TokenScope = 'customer') {
  try { return sessionStorage.getItem(tokenKeys[scope]) || '' } catch { return '' }
}

export function setAccessToken(token: string, scope: TokenScope = 'customer') {
  try { sessionStorage.setItem(tokenKeys[scope], token) } catch { throw new Error('Your secure session could not be saved in this browser.') }
}

export function clearAccessToken(scope: TokenScope = 'customer') {
  try { sessionStorage.removeItem(tokenKeys[scope]) } catch { /* The in-memory UI can still sign out. */ }
}

function errorMessage(status: number, payload: unknown) {
  if (payload && typeof payload === 'object' && 'detail' in payload) {
    const detail = (payload as { detail?: unknown }).detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map(item => item && typeof item === 'object' && 'msg' in item ? String(item.msg) : '').filter(Boolean).join(' ')
  }
  if (status === 401) return 'Your session has expired. Please sign in again.'
  if (status === 403) return 'You do not have permission to perform this action.'
  if (status >= 500) return 'The Griha Mart service is temporarily unavailable. Please try again.'
  return `Request failed (${status}).`
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, scope: TokenScope = 'customer'): Promise<T> {
  const token = getAccessToken(scope)
  const headers = new Headers(init.headers)
  if (!(init.body instanceof FormData) && init.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)
  let response: Response
  try { response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers }) }
  catch { throw new ApiError(0, 'Could not reach Griha Mart. Check your connection and try again.') }
  const text = await response.text()
  let payload: unknown
  try { payload = text ? JSON.parse(text) : undefined } catch { payload = text }
  if (!response.ok) throw new ApiError(response.status, errorMessage(response.status, payload), payload)
  return payload as T
}
