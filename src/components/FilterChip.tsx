import { Box, Typography } from '@mui/material'

export type FilterState = 'off' | 'inclusive' | 'exclusive'

interface Props {
  label: string
  filterState: FilterState
  onClick: () => void
  iconUrl?: string
  accentColor?: string
}

const SIZE = 44

export default function FilterChip({ label, filterState, onClick, iconUrl, accentColor }: Props) {
  const color = accentColor ?? '#6366f1'
  const isOff = filterState === 'off'
  const isExclusive = filterState === 'exclusive'

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        mr: 0.5,
        mb: 0.5,
        cursor: 'pointer',
        opacity: isOff ? 0.45 : 1,
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        '&:hover': { opacity: isOff ? 0.7 : 1, transform: 'scale(1.08)' },
      }}
    >
      <Box
        sx={{
          width: SIZE,
          height: SIZE,
          borderRadius: 1.5,
          border: '2px solid',
          borderColor: isOff ? 'transparent' : color,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isExclusive ? `${color}66` : 'rgba(255,255,255,0.04)',
          boxShadow: isExclusive ? `inset 0 0 0 1px ${color}aa` : 'none',
          transition: 'bgcolor 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        {iconUrl ? (
          <Box
            component="img"
            src={iconUrl}
            alt={label}
            sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.25 }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color }}>{label[0]}</Typography>
        )}
      </Box>
      <Typography
        sx={{
          fontSize: '0.62rem',
          fontWeight: isOff ? 400 : 700,
          color: isOff ? 'rgba(255,255,255,0.6)' : color,
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: SIZE + 12,
          wordBreak: 'break-word',
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}
