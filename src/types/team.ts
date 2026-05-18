export interface Team {
  id: string
  user_id: string
  name: string
  luminary_slugs: string[]
  created_at: string
  updated_at: string
}

export interface CreateTeamInput {
  name: string
  luminary_slugs: string[]
}
