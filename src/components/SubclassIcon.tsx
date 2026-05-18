import { Box, Tooltip, Typography } from '@mui/material'
import { imageUrl } from '../api/client'
import { useSubclasses } from '../hooks/useSubclasses'
import { TOOLTIP_SLOT_PROPS } from '../constants/tooltips'
import type { Subclass } from '../types/subclass'

function SubclassTooltipContent({ sub, name }: { sub?: Subclass; name: string }) {
  return (
    <Box sx={{ maxWidth: 280 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', mb: 0.5 }}>
        {name}
      </Typography>
      {sub?.attributes && sub.attributes.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: sub?.description ? 0.75 : 0 }}>
          {sub.attributes.map((attr) => (
            <Box
              key={attr}
              sx={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#86efac',
                bgcolor: 'rgba(134,239,172,0.1)',
                border: '1px solid rgba(134,239,172,0.25)',
                borderRadius: 0.75,
                px: 0.75,
                py: 0.25,
              }}
            >
              {attr}
            </Box>
          ))}
        </Box>
      )}
      {sub?.description && (
        <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
          {sub.description}
        </Typography>
      )}
    </Box>
  )
}

interface Props {
  name: string
  iconPath?: string
  size?: number
  labelSize?: string
  labelColor?: string
}

export default function SubclassIcon({
  name,
  iconPath,
  size = 100,
  labelSize = '0.7rem',
  labelColor = 'rgba(255,255,255,0.55)',
}: Props) {
  const { data: subclasses = [] } = useSubclasses()
  const subclassMap = new Map<string, Subclass>(subclasses.map((s) => [s.name.toLowerCase(), s]))
  const sub = subclassMap.get(name.toLowerCase())

  return (
    <Tooltip
      title={<SubclassTooltipContent sub={sub} name={name} />}
      placement="top"
      arrow
      enterDelay={300}
      enterNextDelay={300}
      slotProps={TOOLTIP_SLOT_PROPS}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          flexShrink: 0,
          cursor: 'default',
        }}
      >
        {iconPath ? (
          <Box
            component="img"
            src={imageUrl(iconPath)}
            alt={name}
            sx={{
              width: size,
              height: size,
              objectFit: 'contain',
              transition: 'filter 0.15s',
              '&:hover': { filter: 'brightness(1.15)' },
            }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <Box
            sx={{
              width: size,
              height: size,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>?</Typography>
          </Box>
        )}
        <Typography
          sx={{
            fontSize: labelSize,
            color: labelColor,
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: size + 12,
            wordBreak: 'break-word',
          }}
        >
          {name}
        </Typography>
      </Box>
    </Tooltip>
  )
}
