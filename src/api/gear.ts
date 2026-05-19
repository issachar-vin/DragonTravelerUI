import { apiClient } from './client'
import type { GearSet } from '../types/gear'

export const getGearSets = () => apiClient.get<GearSet[]>('/gear-sets').then((r) => r.data)
