import { imageUrl } from '../api/client'

export const FACTION_COLORS: Record<string, string> = {
  'Arcane Wisdom': '#8b5cf6',
  'Elemental Echo': '#06b6d4',
  'Illusion Veil': '#ec4899',
  'Otherworld Return': '#f59e0b',
  'Sanctum Glory': '#10b981',
  'Wild Spirit': '#84cc16',
}

export const factionIconUrl = (name: string) =>
  imageUrl(`/images/factions/${name.toLowerCase().replace(/ /g, '_')}.png`)
