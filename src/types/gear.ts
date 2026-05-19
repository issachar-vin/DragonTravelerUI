export interface GearPiece {
  name: string
  slug: string
  slot: string
  piece_effect?: string
  images?: { path: string }
}

export interface GearSet {
  id: string
  name: string
  slug: string
  bonus_type?: string
  bonus_effect?: string
  pieces: GearPiece[]
}
