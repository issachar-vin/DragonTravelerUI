import { apiClient } from './client'
import type { Luminary } from '../types/luminary'

export const getLuminaries = () => apiClient.get<Luminary[]>('/luminaries').then((r) => r.data)
