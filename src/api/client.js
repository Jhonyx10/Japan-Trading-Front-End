import { ofetch } from 'ofetch'

export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  async onRequest({ options }) {
    // Standard localStorage lookups
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
})