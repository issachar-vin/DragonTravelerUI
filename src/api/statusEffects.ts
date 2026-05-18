import { apiClient } from './client'
import type { StatusEffect } from '../types/statusEffect'

export const getStatusEffects = () =>
  apiClient.get<StatusEffect[]>('/status-effects').then((r) => r.data)
