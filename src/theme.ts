import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#d4a017' },
    secondary: { main: '#8b5cf6' },
    background: { default: '#0f0f1a', paper: '#1a1a2e' },
    text: { primary: '#f0f0f0', secondary: '#a0a0b0' },
  },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
})
