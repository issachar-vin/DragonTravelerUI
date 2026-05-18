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
  Tooltip,
  Chip,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import { useTeams, useDeleteTeam } from '../hooks/useTeams'
import { useLuminaries } from '../hooks/useLuminaries'
import { useSubclasses } from '../hooks/useSubclasses'
import LuminaryIcon from '../components/LuminaryIcon'
import { imageUrl } from '../api/client'
import type { Team } from '../types/team'
import type { Luminary, GearItem as GearItemType } from '../types/luminary'
import type { Subclass } from '../types/subclass'

// ── Styled gear tooltip ───────────────────────────────────────────────────────

function GearTooltipContent({ g }: { g: GearItemType }) {
  return (
    <Box sx={{ maxWidth: 260 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.25, color: '#fff' }}>
        {g.name}
      </Typography>
      <Typography
        sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', mb: g.bonus_effect ? 1 : 0 }}
      >
        {g.slot}
        {g.set ? ` · ${g.set}` : ''}
      </Typography>
      {g.bonus_effect && (
        <Box
          sx={{
            mt: 0.75,
            pt: 0.75,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {g.bonus_type && (
            <Typography
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#f59e0b',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 0.4,
              }}
            >
              {g.bonus_type}
            </Typography>
          )}
          <Typography
            sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}
          >
            {g.bonus_effect}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

function GearItemCard({ g }: { g: GearItemType }) {
  return (
    <Tooltip
      title={<GearTooltipContent g={g} />}
      placement="top"
      arrow
      enterDelay={300}
      enterNextDelay={300}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: '#12122a',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 2,
            p: 1.5,
            maxWidth: 'none',
            boxShadow: '0 6px 24px rgba(0,0,0,0.55)',
          },
        },
        arrow: { sx: { color: '#12122a' } },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.75,
          flexShrink: 0,
          width: 100,
          cursor: 'default',
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
              transition: 'border-color 0.15s',
              '&:hover': { borderColor: 'rgba(255,255,255,0.25)' },
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
    </Tooltip>
  )
}

// ── Set bonus chip ────────────────────────────────────────────────────────────

interface SetBonusInfo {
  set: string
  bonus_type?: string
  bonus_effect: string
}

function SetBonusChip({ info }: { info: SetBonusInfo }) {
  const shortName = info.set.replace(/ Set$/, '')
  return (
    <Tooltip
      title={
        <Box sx={{ maxWidth: 260 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff', mb: 0.25 }}>
            {info.set}
          </Typography>
          {info.bonus_type && (
            <Typography
              sx={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: '#f59e0b',
                textTransform: 'uppercase',
                letterSpacing: 0.4,
                mb: 0.5,
              }}
            >
              {info.bonus_type}
            </Typography>
          )}
          <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
            {info.bonus_effect}
          </Typography>
        </Box>
      }
      placement="top"
      arrow
      enterDelay={300}
      enterNextDelay={300}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: '#12122a',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 2,
            p: 1.5,
            maxWidth: 'none',
            boxShadow: '0 6px 24px rgba(0,0,0,0.55)',
          },
        },
        arrow: { sx: { color: '#12122a' } },
      }}
    >
      <Chip
        label={shortName}
        size="small"
        sx={{
          bgcolor: 'rgba(245,158,11,0.12)',
          color: '#f59e0b',
          border: '1px solid rgba(245,158,11,0.35)',
          fontWeight: 700,
          fontSize: '0.68rem',
          height: 24,
          cursor: 'default',
          '&:hover': {
            bgcolor: 'rgba(245,158,11,0.2)',
            borderColor: 'rgba(245,158,11,0.6)',
          },
          '& .MuiChip-label': { px: 1 },
        }}
      />
    </Tooltip>
  )
}

// ── Subclass icon with tooltip ────────────────────────────────────────────────

function SubclassIcon({
  name,
  iconPath,
  subclassMap,
}: {
  name: string
  iconPath?: string
  subclassMap: Map<string, Subclass>
}) {
  const sub = subclassMap.get(name.toLowerCase())

  return (
    <Tooltip
      title={
        <Box sx={{ maxWidth: 260 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#fff',
              mb: sub?.description ? 0.5 : 0,
            }}
          >
            {name}
          </Typography>
          {sub?.description && (
            <Typography
              sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}
            >
              {sub.description}
            </Typography>
          )}
        </Box>
      }
      placement="top"
      arrow
      enterDelay={300}
      enterNextDelay={300}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: '#12122a',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 2,
            p: 1.5,
            maxWidth: 'none',
            boxShadow: '0 6px 24px rgba(0,0,0,0.55)',
          },
        },
        arrow: { sx: { color: '#12122a' } },
      }}
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
              width: 100,
              height: 100,
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
            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>?</Typography>
          </Box>
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
          {name}
        </Typography>
      </Box>
    </Tooltip>
  )
}

// ── Expanded luminary row ─────────────────────────────────────────────────────

function ExpandedLuminaryRow({
  l,
  subclassMap,
}: {
  l: Luminary
  subclassMap: Map<string, Subclass>
}) {
  // Deduplicate set bonuses from recommended gear
  const activeSets: SetBonusInfo[] = [
    ...new Map(
      l.recommended_gear
        .filter((g) => g.set && g.bonus_effect)
        .map((g) => [
          g.set!,
          { set: g.set!, bonus_type: g.bonus_type, bonus_effect: g.bonus_effect! },
        ])
    ).values(),
  ]

  return (
    <Box
      sx={{
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          overflowX: 'auto',
          flexWrap: 'nowrap',
        }}
      >
        {/* Luminary icon */}
        <Box sx={{ flexShrink: 0 }}>
          <LuminaryIcon luminary={l} size={75} />
        </Box>

        {/* Gear icons */}
        {l.recommended_gear.map((g) => (
          <GearItemCard key={g.name} g={g} />
        ))}

        {/* Set bonuses */}
        {activeSets.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 0.75,
              pl: 1.5,
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              ml: 0.5,
              flexShrink: 0,
              alignSelf: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.58rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 0.25,
              }}
            >
              Set Bonuses
            </Typography>
            {activeSets.map((info) => (
              <SetBonusChip key={info.set} info={info} />
            ))}
          </Box>
        )}

        {/* Subclass icons — anchored right */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', ml: 'auto', flexShrink: 0 }}>
          {(l.subclasses ?? []).map((sub) => (
            <SubclassIcon
              key={sub}
              name={sub}
              iconPath={l.subclass_icon_paths?.[sub]}
              subclassMap={subclassMap}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeamsPage() {
  const { data: teams = [], isLoading } = useTeams()
  const { data: luminaries = [] } = useLuminaries()
  const { data: subclasses = [] } = useSubclasses()
  const deleteTeam = useDeleteTeam()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const bySlug: Record<string, Luminary> = Object.fromEntries(
    luminaries.map((l: Luminary) => [l.slug, l])
  )

  const subclassMap = new Map<string, Subclass>(
    subclasses.map((s: Subclass) => [s.name.toLowerCase(), s])
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
        const isOpen = expanded.has(team.id)
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
              onClick={() =>
                setExpanded((prev) => {
                  const next = new Set(prev)
                  if (next.has(team.id)) next.delete(team.id)
                  else next.add(team.id)
                  return next
                })
              }
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
                  return l ? (
                    <ExpandedLuminaryRow key={slug} l={l} subclassMap={subclassMap} />
                  ) : null
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
