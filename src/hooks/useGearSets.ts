import { useQuery } from '@tanstack/react-query'
import { getGearSets } from '../api/gear'

export const useGearSets = () =>
  useQuery({
    queryKey: ['gear-sets'],
    queryFn: getGearSets,
    staleTime: 5 * 60 * 1000,
  })
