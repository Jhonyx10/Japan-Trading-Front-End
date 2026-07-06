import { ofetch } from 'ofetch'
import { clearSession } from '../utils/auth'

export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  async onRequest({ options }) {
    const accessToken = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null

    options.headers = options.headers || {}
    
    if (options.headers instanceof Headers) {
      options.headers.append('Accept', 'application/json')
      if (accessToken) options.headers.append('Authorization', `Bearer ${accessToken}`)
    } else {
      options.headers['Accept'] = 'application/json'
      if (accessToken) options.headers['Authorization'] = `Bearer ${accessToken}`
    }
  },
  async onResponseError({ response }) {
    if (typeof window === 'undefined') return

    const url = response?.url ?? ''
    const isAuthRequest = url.includes('/logout') || url.includes('/login')

    if (isAuthRequest) return

    if (response?.status === 401 || response?.status === 403) {
      clearSession()

      if (window.location.pathname !== '/') {
        window.location.href = '/?session=expired'
      }
    }
  },
})