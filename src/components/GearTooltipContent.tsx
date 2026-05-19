import { Box, Typography } from '@mui/material'
import { imageUrl } from '../api/client'
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

const ICON_SIZE = 52

export default function GearTooltipContent({ g }: { g: GearItem }) {
  const hasEffect = g.piece_effect || g.bonus_effect

  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
      {g.images?.path && (
        <Box
          sx={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src={imageUrl(g.images.path)}
            alt={g.name}
            sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5 }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', mb: 0.5 }}>
          {g.name}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: hasEffect ? 0.75 : 0 }}>
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

        {g.piece_effect && (
          <Typography
            sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.55 }}
          >
            {g.piece_effect}
          </Typography>
        )}
        {g.bonus_effect && (
          <Typography
            sx={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.55,
              mt: g.piece_effect ? 0.5 : 0,
            }}
          >
            {g.bonus_effect}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
