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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import CloseIcon from '@mui/icons-material/Close'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLuminaries } from '../hooks/useLuminaries'
import { useCreateTeam, useUpdateTeam } from '../hooks/useTeams'
import LuminaryIcon from '../components/LuminaryIcon'
import FilterChip from '../components/FilterChip'
import { imageUrl } from '../api/client'
import { FACTION_COLORS, factionIconUrl } from '../constants/factions'
import { CLASS_COLORS, classIconUrl } from '../constants/classes'
import type { Luminary } from '../types/luminary'
import type { Team } from '../types/team'

const MAX = 6

// ── Draggable team member row ─────────────────────────────────────────────────

function SortableMemberRow({ luminary, onRemove }: { luminary: Luminary; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: luminary.slug,
  })

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 1 : 'auto',
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1,
        bgcolor: isDragging ? 'rgba(212,160,23,0.08)' : 'rgba(255,255,255,0.03)',
        border: '1px solid',
        borderColor: isDragging ? 'primary.main' : 'rgba(255,255,255,0.07)',
        borderRadius: 1.5,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {/* Drag handle */}
      <Box
        {...attributes}
        {...listeners}
        sx={{
          color: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          '&:hover': { color: 'rgba(255,255,255,0.5)' },
          touchAction: 'none',
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>

      {/* Icon */}
      {luminary.icon_path ? (
        <Box
          component="img"
          src={imageUrl(luminary.icon_path)}
          alt={luminary.name}
          sx={{ width: 40, height: 54, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        <Box
          sx={{
            width: 40,
            height: 54,
            borderRadius: 1,
            bgcolor: '#1a1a2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#d4a017' }}>
            {luminary.name[0]}
          </Typography>
        </Box>
      )}

      {/* Name */}
      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', flex: 1, minWidth: 0 }} noWrap>
        {luminary.name}
      </Typography>

      {/* Remove */}
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#ef4444' } }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeamBuilderPage() {
  const { data: luminaries = [] } = useLuminaries()
  const { state } = useLocation() as { state?: { team?: Team } }
  const editingTeam = state?.team

  const [orderedSlugs, setOrderedSlugs] = useState<string[]>(editingTeam?.luminary_slugs ?? [])
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set())
  const [selectedFactions, setSelectedFactions] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [teamName, setTeamName] = useState(editingTeam?.name ?? '')
  const [editingName, setEditingName] = useState(false)
  const navigate = useNavigate()
  const createTeam = useCreateTeam()
  const updateTeam = useUpdateTeam()

  const selectedSet = useMemo(() => new Set(orderedSlugs), [orderedSlugs])

  const bySlug = useMemo(
    () => Object.fromEntries(luminaries.map((l: Luminary) => [l.slug, l])),
    [luminaries]
  )

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
    setOrderedSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug)
      if (prev.length >= MAX) return prev
      return [...prev, slug]
    })

  const toggleFilter = (prev: Set<string>, val: string): Set<string> => {
    const s = new Set(prev)
    if (s.has(val)) s.delete(val)
    else s.add(val)
    return s
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setOrderedSlugs((prev) => {
        const from = prev.indexOf(String(active.id))
        const to = prev.indexOf(String(over.id))
        return arrayMove(prev, from, to)
      })
    }
  }

  const handleUpdate = async () => {
    if (!editingTeam) return
    try {
      await updateTeam.mutateAsync({
        id: editingTeam.id,
        name: teamName,
        luminary_slugs: orderedSlugs,
      })
      navigate('/teams')
    } catch {
      // error state handled by react-query
    }
  }

  const handleCreate = async () => {
    try {
      await createTeam.mutateAsync({ name: teamName, luminary_slugs: orderedSlugs })
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
          {orderedSlugs.length}/{MAX} selected
        </Typography>
      </Box>

      {/* ── Selected team tray ─────────────────────────────────────────── */}
      {orderedSlugs.length > 0 && (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2, mb: 3 }}>
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              mb: 1.5,
            }}
          >
            Your Team — drag to reorder
          </Typography>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={orderedSlugs} strategy={verticalListSortingStrategy}>
              <Stack spacing={0.75}>
                {orderedSlugs.map((slug) => {
                  const l = bySlug[slug]
                  return l ? (
                    <SortableMemberRow key={slug} luminary={l} onRemove={() => toggle(slug)} />
                  ) : null
                })}
              </Stack>
            </SortableContext>
          </DndContext>
        </Box>
      )}

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
            selected={selectedSet.has(l.slug)}
            disabled={!selectedSet.has(l.slug) && orderedSlugs.length >= MAX}
            onClick={() => toggle(l.slug)}
            size={96}
            showName
          />
        ))}
      </Stack>

      {orderedSlugs.length > 0 && (
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
