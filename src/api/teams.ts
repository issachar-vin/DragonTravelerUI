import { apiClient } from './client'
import type { Team, CreateTeamInput } from '../types/team'

export const getTeams = () => apiClient.get<Team[]>('/teams').then((r) => r.data)

export const createTeam = (input: CreateTeamInput) =>
  apiClient.post<Team>('/teams', input).then((r) => r.data)

export const updateTeam = (id: string, input: Partial<CreateTeamInput>) =>
  apiClient.put<Team>(`/teams/${id}`, input).then((r) => r.data)

export const deleteTeam = (id: string) => apiClient.delete(`/teams/${id}`)
