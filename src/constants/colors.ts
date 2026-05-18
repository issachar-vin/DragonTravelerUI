export const TIER_COLORS: Record<string, string> = {
  SS: '#d4a017',
  'S+': '#ff4500',
  S: '#ff6b35',
  'A+': '#ff8c00',
  A: '#ffa500',
  'B+': '#1e90ff',
  B: '#4fc3f7',
  'C+': '#3cb371',
  C: '#81c784',
}

export const RARITY_COLORS: Record<string, string> = {
  'SSR EX': '#0d9488',
  'SSR+': '#ef4444',
  SSR: '#f59e0b',
  SR: '#8b5cf6',
  R: '#64748b',
}

export const SKILL_TYPE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  default: {
    bg: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.5)',
    border: 'rgba(255,255,255,0.12)',
  },
  ultimate: { bg: '#7c3aed22', color: '#a78bfa', border: '#7c3aed60' },
  overdrive: { bg: '#991b1b33', color: '#fca5a5', border: '#991b1b60' },
  passive: { bg: '#14532d22', color: '#86efac', border: '#14532d60' },
}
