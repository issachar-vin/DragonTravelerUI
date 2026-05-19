export interface TalentLevel {
  level: number
  description: string
}

export interface Talent {
  name: string
  icon_path?: string
  levels: TalentLevel[]
}

export interface Skill {
  name: string
  description: string
  type?: string
  icon_path?: string
}

export interface GearItem {
  name: string
  slot: string
  set?: string
  images?: { path: string }
  piece_effect?: string
  bonus_type?: string
  bonus_effect?: string
}

export interface Luminary {
  id: string
  slug: string
  name: string
  class: string
  factions: string[]
  rarity: string
  icon_path: string
  portrait_path: string
  tiers: { overall: string; pvp: string; pve: string }
  talent?: Talent
  skills?: Skill[]
  subclasses?: string[]
  subclass_icon_paths?: Record<string, string>
  faction_icons?: Record<string, string>
  recommended_gear: GearItem[]
}
