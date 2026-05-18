import { Box, Typography } from '@mui/material'
import type { GearItem } from '../types/luminary'

function Badge({
  label,
  color,
  bg,
  border,
}: {
  label: string
  color: string
  bg: string
  border: string
}) {
  return (
    <Box
      sx={{
        fontSize: '0.68rem',
        fontWeight: 700,
        color,
        bgcolor: bg,
        border: `1px solid ${border}`,
        borderRadius: 0.75,
        px: 0.75,
        py: 0.25,
      }}
    >
      {label}
    </Box>
  )
}

export default function GearTooltipContent({ g }: { g: GearItem }) {
  return (
    <Box sx={{ maxWidth: 280 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', mb: 0.5 }}>
        {g.name}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: g.bonus_effect ? 0.75 : 0 }}>
        <Badge
          label={g.slot}
          color="rgba(255,255,255,0.6)"
          bg="rgba(255,255,255,0.07)"
          border="rgba(255,255,255,0.14)"
        />
        {g.set && (
          <Badge
            label={g.set}
            color="rgba(255,255,255,0.6)"
            bg="rgba(255,255,255,0.07)"
            border="rgba(255,255,255,0.14)"
          />
        )}
        {g.bonus_type && (
          <Badge
            label={g.bonus_type}
            color="#f59e0b"
            bg="rgba(245,158,11,0.1)"
            border="rgba(245,158,11,0.28)"
          />
        )}
      </Box>

      {g.bonus_effect && (
        <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.55 }}>
          {g.bonus_effect}
        </Typography>
      )}
    </Box>
  )
}
