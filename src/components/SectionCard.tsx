import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'

interface Props {
  children: React.ReactNode
  sx?: SxProps<Theme>
}

export default function SectionCard({ children, sx }: Props) {
  return <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, ...sx }}>{children}</Box>
}
