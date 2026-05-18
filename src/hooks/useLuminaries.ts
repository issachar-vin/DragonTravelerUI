import { useQuery } from '@tanstack/react-query'
import { getLuminaries } from '../api/luminaries'

export const useLuminaries = () =>
  useQuery({
    queryKey: ['luminaries'],
    queryFn: getLuminaries,
    staleTime: 5 * 60 * 1000,
  })
