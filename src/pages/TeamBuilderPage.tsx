import { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLuminaries } from '../hooks/useLuminaries'
import { useCreateTeam, useUpdateTeam } from '../hooks/useTeams'
import LuminaryIcon from '../components/LuminaryIcon'
import FilterChip from '../components/FilterChip'
import { FACTION_COLORS, factionIconUrl } from '../constants/factions'
import { CLASS_COLORS, classIconUrl } from '../constants/classes'
import type { Luminary } from '../types/luminary'
import type { Team } from '../types/team'

const MAX = 6

export default function TeamBuilderPage() {
  const { data: luminaries = [] } = useLuminaries()
  const { state } = useLocation() as { state?: { team?: Team } }
  const editingTeam = state?.team

  const [selected, setSelected] = useState<Set<string>>(new Set(editingTeam?.luminary_slugs ?? []))
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set())
  const [selectedFactions, setSelectedFactions] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [teamName, setTeamName] = useState(editingTeam?.name ?? '')
  const [editingName, setEditingName] = useState(false)
  const navigate = useNavigate()
  const createTeam = useCreateTeam()
  const updateTeam = useUpdateTeam()

  const classes = useMemo(
    () => [...new Set(luminaries.map((l: Luminary) => l.class))].sort(),
    [luminaries]
  )
  const factions = useMemo(
    () => [...new Set(luminaries.flatMap((l: Luminary) => l.factions ?? []))].sort(),
    [luminaries]
  )

  const filtered = useMemo(
    () =>
      luminaries.filter((l: Luminary) => {
        if (selectedClasses.size > 0 && !selectedClasses.has(l.class)) return false
        if (selectedFactions.size > 0 && !(l.factions ?? []).some((f) => selectedFactions.has(f)))
          return false
        return true
      }),
    [luminaries, selectedClasses, selectedFactions]
  )

  const toggle = (slug: string) =>
    setSelected((prev) => {
      const s = new Set(prev)
      if (s.has(slug)) {
        s.delete(slug)
        return s
      }
      if (s.size >= MAX) return s
      s.add(slug)
      return s
    })

  const toggleFilter = (prev: Set<string>, val: string): Set<string> => {
    const s = new Set(prev)
    if (s.has(val)) s.delete(val)
    else s.add(val)
    return s
  }

  const handleUpdate = async () => {
    if (!editingTeam) return
    try {
      await updateTeam.mutateAsync({
        id: editingTeam.id,
        name: teamName,
        luminary_slugs: [...selected],
      })
      navigate('/teams')
    } catch {
      // error state handled by react-query
    }
  }

  const handleCreate = async () => {
    try {
      await createTeam.mutateAsync({ name: teamName, luminary_slugs: [...selected] })
      navigate('/teams')
    } catch {
      // error state handled by react-query
    }
    setDialogOpen(false)
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4, pb: 14 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        {editingTeam ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {editingName ? (
              <TextField
                autoFocus
                size="small"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && teamName.trim()) setEditingName(false)
                  if (e.key === 'Escape') {
                    setTeamName(editingTeam.name)
                    setEditingName(false)
                  }
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          disabled={!teamName.trim()}
                          onClick={() => setEditingName(false)}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ '& .MuiInputBase-input': { fontWeight: 700, fontSize: '1.5rem' } }}
              />
            ) : (
              <>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {teamName}
                </Typography>
                <IconButton size="small" onClick={() => setEditingName(true)} sx={{ mt: 0.5 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Team Builder
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {selected.size}/{MAX} selected
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          Class
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', mb: 1 }}>
          {classes.map((c) => (
            <FilterChip
              key={c}
              label={c}
              selected={selectedClasses.has(c)}
              onClick={() => setSelectedClasses((p) => toggleFilter(p, c))}
              iconUrl={classIconUrl(c)}
              accentColor={CLASS_COLORS[c]}
            />
          ))}
        </Stack>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          Faction
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap' }}>
          {factions.map((f) => (
            <FilterChip
              key={f}
              label={f}
              selected={selectedFactions.has(f)}
              onClick={() => setSelectedFactions((p) => toggleFilter(p, f))}
              iconUrl={factionIconUrl(f)}
              accentColor={FACTION_COLORS[f]}
            />
          ))}
        </Stack>
      </Box>

      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.5 }}>
        {filtered.map((l: Luminary) => (
          <LuminaryIcon
            key={l.slug}
            luminary={l}
            selected={selected.has(l.slug)}
            disabled={!selected.has(l.slug) && selected.size >= MAX}
            onClick={() => toggle(l.slug)}
            size={96}
            showName
          />
        ))}
      </Stack>

      {selected.size > 0 && (
        <Box sx={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)' }}>
          <Button
            variant="contained"
            size="large"
            onClick={editingTeam ? handleUpdate : () => setDialogOpen(true)}
            sx={{ px: 6, py: 1.5, fontSize: '1rem', fontWeight: 700, boxShadow: 8 }}
          >
            {editingTeam ? 'Update Team' : 'Save Team'}
          </Button>
        </Box>
      )}

      {/* Create dialog — name entry, only shown when creating */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        slotProps={{ paper: { sx: { bgcolor: 'background.paper' } } }}
      >
        <DialogTitle>Name Your Team</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && teamName.trim()) handleCreate()
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!teamName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
