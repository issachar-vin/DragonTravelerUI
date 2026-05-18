import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTeam, deleteTeam, getTeams, updateTeam } from '../api/teams'
import { useAuthStore } from '../store/authStore'

export const useTeams = () => {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    enabled: !!token,
  })
}

export const useCreateTeam = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export const useUpdateTeam = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...rest }: { id: string; name?: string; luminary_slugs?: string[] }) =>
      updateTeam(id, rest),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export const useDeleteTeam = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })
}
