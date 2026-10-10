import type { ApiAuthResponse, ApiTokenResponse, ApiUser } from './apiContracts'
import { ApiError, apiRequest, clearAccessToken, setAccessToken } from './api'

export const authService = {
  async signup(input: { phone: string; fullName: string; password: string }) {
    return apiRequest<ApiUser>('/auth/signup', { method: 'POST', body: JSON.stringify({ phone: input.phone, full_name: input.fullName, password: input.password }) })
  },
  async login(phone: string, password: string) {
    const candidates = [...new Set([phone, phone.replace(/^\+977\s?/, ''), `+977 ${phone.replace(/^\+977\s?/, '')}`, `+977${phone.replace(/^\+977\s?/, '')}`])]
    let lastError: unknown
    for (const candidate of candidates) {
      try {
        const response = await apiRequest<ApiAuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ phone: candidate, password }) })
        setAccessToken(response.access_token, 'customer')
        return response.user
      } catch (reason) {
        lastError = reason
        if (!(reason instanceof ApiError) || ![400, 401, 404, 422].includes(reason.status)) throw reason
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Could not sign in.')
  },
  me() { return apiRequest<ApiUser>('/user/me') },
  signOut() { clearAccessToken('customer') },
  async adminLogin(email: string, code: string) {
    const response = await apiRequest<ApiTokenResponse>('/admin/login', { method: 'POST', body: JSON.stringify({ email, code }) }, 'admin')
    setAccessToken(response.access_token, 'admin')
    return response
  },
  adminSignOut() { clearAccessToken('admin') },
}
