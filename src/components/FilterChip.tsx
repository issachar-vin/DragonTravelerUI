import { Box, Typography } from '@mui/material'

interface Props {
  label: string
  selected: boolean
  onClick: () => void
  iconUrl?: string
  accentColor?: string
}

const SIZE = 44

export default function FilterChip({ label, selected, onClick, iconUrl, accentColor }: Props) {
  const color = accentColor ?? '#6366f1'

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
        opacity: selected ? 1 : 0.45,
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        '&:hover': { opacity: selected ? 1 : 0.7, transform: 'scale(1.08)' },
      }}
    >
      <Box
        sx={{
          width: SIZE,
          height: SIZE,
          borderRadius: 1.5,
          border: '2px solid',
          borderColor: selected ? color : 'transparent',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255,255,255,0.04)',
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
          fontWeight: selected ? 700 : 400,
          color: selected ? color : 'rgba(255,255,255,0.6)',
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
