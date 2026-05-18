import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Collapse,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
  CircularProgress,
  IconButton,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import { useTeams, useDeleteTeam } from '../hooks/useTeams'
import { useLuminaries } from '../hooks/useLuminaries'
import LuminaryIcon from '../components/LuminaryIcon'
import { imageUrl } from '../api/client'
import type { Team } from '../types/team'
import type { Luminary } from '../types/luminary'

function ExpandedLuminaryRow({ l }: { l: Luminary }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
        overflowX: 'auto',
        flexWrap: 'nowrap',
      }}
    >
      {/* Luminary icon — height 100px, width 75px (3:4 ratio) */}
      <Box sx={{ flexShrink: 0 }}>
        <LuminaryIcon luminary={l} size={75} />
      </Box>

      {/* Gear icons — 100×100 with name below */}
      {l.recommended_gear.map((g) => (
        <Box
          key={g.name}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.75,
            flexShrink: 0,
            width: 100,
          }}
        >
          {g.images?.path ? (
            <Box
              component="img"
              src={imageUrl(g.images.path)}
              alt={g.name}
              sx={{
                width: 100,
                height: 100,
                objectFit: 'contain',
                borderRadius: 2,
                bgcolor: 'background.default',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                {g.slot[0]}
              </Typography>
            </Box>
          )}
          <Typography
            sx={{
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.55)',
              textAlign: 'center',
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}
          >
            {g.name}
          </Typography>
        </Box>
      ))}

      {/* Subclass icons — anchored right, 100×100 with name label */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', ml: 'auto', flexShrink: 0 }}>
        {(l.subclasses ?? []).map((sub) => {
          const iconPath = l.subclass_icon_paths?.[sub]
          return (
            <Box
              key={sub}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              {iconPath && (
                <Box
                  component="img"
                  src={imageUrl(iconPath)}
                  alt={sub}
                  sx={{ width: 100, height: 100, objectFit: 'contain' }}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              )}
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  color: 'rgba(255,255,255,0.55)',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  maxWidth: 100,
                }}
              >
                {sub}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default function TeamsPage() {
  const { data: teams = [], isLoading } = useTeams()
  const { data: luminaries = [] } = useLuminaries()
  const deleteTeam = useDeleteTeam()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const bySlug: Record<string, Luminary> = Object.fromEntries(
    luminaries.map((l: Luminary) => [l.slug, l])
  )

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          My Teams
        </Typography>
        <Button variant="contained" onClick={() => navigate('/team-builder')}>
          New Team
        </Button>
      </Box>

      {teams.length === 0 && (
        <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 6 }}>
          No teams yet.{' '}
          <Button onClick={() => navigate('/team-builder')} color="primary" sx={{ p: 0 }}>
            Build your first team
          </Button>
        </Typography>
      )}

      {teams.map((team: Team) => {
        const isOpen = expanded === team.id
        return (
          <Box
            key={team.id}
            sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 2, overflow: 'hidden' }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => setExpanded(isOpen ? null : team.id)}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mr: 2, minWidth: 120 }}>
                {team.name}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ flex: 1 }}>
                {team.luminary_slugs.map((slug) => {
                  const l = bySlug[slug]
                  return l ? <LuminaryIcon key={slug} luminary={l} size={60} /> : null
                })}
              </Stack>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/team-builder', { state: { team } })
                }}
                sx={{ mr: 0.5 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget(team.id)
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>

            <Collapse in={isOpen}>
              <Divider />
              <Box sx={{ px: 2, pb: 1 }}>
                {team.luminary_slugs.map((slug) => {
                  const l = bySlug[slug]
                  return l ? <ExpandedLuminaryRow key={slug} l={l} /> : null
                })}
              </Box>
            </Collapse>
          </Box>
        )
      })}

      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}
      >
        <DialogTitle>Delete this team?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (deleteTarget) {
                await deleteTeam.mutateAsync(deleteTarget)
                setDeleteTarget(null)
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
