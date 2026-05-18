import { useQuery } from '@tanstack/react-query'
import { getSubclasses } from '../api/subclasses'

export const useSubclasses = () =>
  useQuery({
    queryKey: ['subclasses'],
    queryFn: getSubclasses,
    staleTime: 30 * 60 * 1000,
  })
