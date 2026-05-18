import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControlLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material'
import { apiClient } from '../api/client'

interface DownloadFailure {
  url: string
  path: string
  error: string
}

interface ImageStatus {
  total: number
  downloaded: number
  missing: number
  running: boolean
  failures: DownloadFailure[]
  missing_paths: string[]
}

async function fetchStatus(): Promise<ImageStatus> {
  const { data } = await apiClient.get('/admin/images/status')
  return data
}

async function startDownload(override: boolean): Promise<void> {
  await apiClient.post(`/admin/images/download?override=${override}`)
}

export default function AdminPage() {
  const [override, setOverride] = useState(false)
  const queryClient = useQueryClient()

  const { data: status, isLoading } = useQuery({
    queryKey: ['adminImageStatus'],
    queryFn: fetchStatus,
    refetchInterval: (query) => (query.state.data?.running ? 2000 : false),
  })

  const { mutate: download, isPending } = useMutation({
    mutationFn: () => startDownload(override),
    onSuccess: () => {
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['adminImageStatus'] }), 500)
    },
  })

  const progress =
    status && status.total > 0 ? Math.round((status.downloaded / status.total) * 100) : 0

  const isActive = status?.running || isPending

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', px: 3, py: 5 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
        Admin
      </Typography>

      <Paper
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
          Game Images
        </Typography>

        {isLoading ? (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Loading status…
          </Typography>
        ) : status?.total === 0 ? (
          <Typography color="warning.main" sx={{ mb: 2 }}>
            No assets found. Run <code>make seed</code> locally first to populate the asset
            registry.
          </Typography>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ mb: 0.75 }}>
              {status?.downloaded ?? 0} / {status?.total ?? 0} images downloaded
              {(status?.missing ?? 0) > 0 && (
                <Typography component="span" color="warning.main">
                  {' '}
                  ({status?.missing} missing)
                </Typography>
              )}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.08)',
                '& .MuiLinearProgress-bar': { borderRadius: 4 },
              }}
            />
            {status?.running && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                Download in progress…
              </Typography>
            )}
          </Box>
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={override}
              onChange={(e) => setOverride(e.target.checked)}
              disabled={isActive}
            />
          }
          label="Override existing (re-download all images)"
          sx={{ display: 'block', mb: 2, color: 'text.secondary' }}
        />

        <Button
          variant="contained"
          onClick={() => download()}
          disabled={isActive || status?.total === 0}
        >
          {isActive ? 'Downloading…' : 'Download Images'}
        </Button>

        <Collapse in={(status?.failures?.length ?? 0) > 0}>
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="error.main" sx={{ mb: 0.5 }}>
              {status?.failures?.length} image{status?.failures?.length === 1 ? '' : 's'} failed to
              download
            </Typography>
            <List dense disablePadding>
              {status?.failures?.map((f) => (
                <ListItem key={f.path} disablePadding sx={{ py: 0.25 }}>
                  <ListItemText
                    primary={f.path}
                    secondary={f.error}
                    slotProps={{
                      primary: { variant: 'caption', sx: { color: 'text.secondary' } },
                      secondary: { variant: 'caption', sx: { color: 'error.main' } },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  )
}
