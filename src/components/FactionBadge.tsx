import { Box, Typography } from '@mui/material'
import { FACTION_COLORS, factionIconUrl } from '../constants/factions'

interface Props {
  name: string
  size?: number
  dropShadow?: boolean
  textShadow?: boolean
}

export default function FactionBadge({
  name,
  size = 40,
  dropShadow = false,
  textShadow = false,
}: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.4 }}>
      <Box
        component="img"
        src={factionIconUrl(name)}
        alt={name}
        sx={{
          width: size,
          height: size,
          objectFit: 'contain',
          filter: dropShadow ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))' : undefined,
        }}
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
      <Typography
        sx={{
          fontSize: size >= 40 ? '0.6rem' : '0.58rem',
          fontWeight: 600,
          color: FACTION_COLORS[name] ?? 'rgba(255,255,255,0.75)',
          textShadow: textShadow ? '0 1px 4px rgba(0,0,0,0.9)' : undefined,
          textAlign: 'center',
          lineHeight: 1.2,
          wordBreak: 'break-word',
        }}
      >
        {name}
      </Typography>
    </Box>
  )
}
