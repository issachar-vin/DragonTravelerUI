import axios from 'axios'
import { useAuthStore } from '../store/authStore'

export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
export const imageUrl = (path: string) => `${BASE_URL}${path}`

export const apiClient = axios.create({ baseURL: BASE_URL })

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error.config?.url ?? ''
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
