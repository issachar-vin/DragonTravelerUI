import { SKILL_TYPE_STYLES } from '../constants/colors'

export function skillTypeStyle(type?: string): { bg: string; color: string; border: string } {
  if (!type) return SKILL_TYPE_STYLES.default
  const t = type.toLowerCase()
  if (t.includes('ultimate') || t.includes('divine')) return SKILL_TYPE_STYLES.ultimate
  if (t.includes('overdrive')) return SKILL_TYPE_STYLES.overdrive
  if (t.includes('passive')) return SKILL_TYPE_STYLES.passive
  return SKILL_TYPE_STYLES.default
}
