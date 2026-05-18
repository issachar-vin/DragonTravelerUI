import { Box, Tooltip, Typography } from '@mui/material'
import { imageUrl } from '../api/client'
import { useStatusEffects } from '../hooks/useStatusEffects'
import type { StatusEffect } from '../types/statusEffect'

const TYPE_COLORS: Record<string, string> = {
  buff: '#86efac',
  debuff: '#fca5a5',
  control: '#c4b5fd',
  elemental: '#67e8f9',
  special: '#fde68a',
  blessing: '#a5f3fc',
  exclusive: '#f9a8d4',
}

function effectColor(type?: string | null): string {
  if (!type) return '#fde68a'
  return TYPE_COLORS[type.toLowerCase()] ?? '#fde68a'
}

const TOOLTIP_PROPS = {
  tooltip: {
    sx: {
      bgcolor: '#12122a',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 1.5,
      p: 1,
      maxWidth: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.55)',
    },
  },
  arrow: { sx: { color: '#12122a' } },
}

function EffectTooltipCard({ effect, name }: { effect?: StatusEffect; name: string }) {
  const color = effectColor(effect?.type)
  return (
    <Box sx={{ maxWidth: 260, p: 0.25 }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: effect?.description ? 0.75 : 0 }}
      >
        {effect?.icon_path && (
          <Box
            component="img"
            src={imageUrl(effect.icon_path)}
            alt={name}
            sx={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color, lineHeight: 1.2 }}>
            {name}
          </Typography>
          {effect?.type && (
            <Typography
              sx={{
                fontSize: '0.62rem',
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                mt: 0.15,
              }}
            >
              {effect.type}
            </Typography>
          )}
        </Box>
      </Box>
      {effect?.description && (
        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>
          {effect.description}
        </Typography>
      )}
    </Box>
  )
}

function StatusEffectToken({ effect, name }: { effect?: StatusEffect; name: string }) {
  const color = effectColor(effect?.type)

  return (
    <Tooltip
      title={<EffectTooltipCard effect={effect} name={name} />}
      placement="top"
      arrow
      enterDelay={150}
      enterNextDelay={150}
      slotProps={TOOLTIP_PROPS}
    >
      <Box
        component="span"
        sx={{
          color,
          fontWeight: 700,
          cursor: 'help',
          borderBottom: `1px dotted ${color}70`,
          lineHeight: 'inherit',
          '&:hover': { borderBottomStyle: 'solid', opacity: 0.9 },
        }}
      >
        [{name}]
      </Box>
    </Tooltip>
  )
}

interface StatusTextProps {
  text: string
  sx?: object
  fontSize?: string
  color?: string
}

export default function StatusText({ text, sx, fontSize, color }: StatusTextProps) {
  const { data: effects = [] } = useStatusEffects()

  const effectMap = new Map<string, StatusEffect>(effects.map((e) => [e.name.toLowerCase(), e]))

  const parts = text.split(/(\[[^\]]+\])/g)

  if (parts.length === 1) {
    return (
      <Typography component="span" sx={{ fontSize, color, ...sx }}>
        {text}
      </Typography>
    )
  }

  return (
    <Typography component="span" sx={{ fontSize, color, lineHeight: 'inherit', ...sx }}>
      {parts.map((part, i) => {
        const bracketMatch = part.match(/^\[(.+)\]$/)
        if (!bracketMatch) return part

        const innerName = bracketMatch[1]
        const effect = effectMap.get(innerName.toLowerCase())

        // Always render a tooltip — with full data if matched, name-only if unknown
        return <StatusEffectToken key={i} effect={effect} name={innerName} />
      })}
    </Typography>
  )
}
