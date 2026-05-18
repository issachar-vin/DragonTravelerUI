import { apiClient } from './client'
import type { Subclass } from '../types/subclass'

export const getSubclasses = () => apiClient.get<Subclass[]>('/subclasses').then((r) => r.data)
