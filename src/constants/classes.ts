import { imageUrl } from '../api/client'

export const CLASS_COLORS: Record<string, string> = {
  Warrior: '#ef4444',
  Mage: '#8b5cf6',
  Archer: '#22c55e',
  Priest: '#f59e0b',
  Assassin: '#94a3b8',
  Guardian: '#3b82f6',
}

export const classIconUrl = (cls: string) => imageUrl(`/images/classes/${cls.toLowerCase()}.png`)
