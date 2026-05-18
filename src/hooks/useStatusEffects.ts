import { useQuery } from '@tanstack/react-query'
import { getStatusEffects } from '../api/statusEffects'

export const useStatusEffects = () =>
  useQuery({
    queryKey: ['status-effects'],
    queryFn: getStatusEffects,
    staleTime: 30 * 60 * 1000,
  })
