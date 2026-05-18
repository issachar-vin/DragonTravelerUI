import { apiClient } from './client'
import type { User, AuthResponse } from '../types/auth'

export const register = (email: string, password: string) =>
  apiClient.post<User>('/auth/register', { email, password }).then((r) => r.data)

export const login = (email: string, password: string) => {
  const form = new URLSearchParams({ username: email, password })
  return apiClient
    .post<AuthResponse>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then((r) => r.data)
}

export const getMe = (token?: string) =>
  apiClient
    .get<User>('/auth/me', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
    .then((r) => r.data)
