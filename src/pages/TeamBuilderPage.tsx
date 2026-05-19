import { useState, useMemo, useRef } from 'react'
import { motion, LayoutGroup } from 'framer-motion'
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
  useTheme,
  useMediaQuery,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import CloseIcon from '@mui/icons-material/Close'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragMoveEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
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
const TRAY_WIDTH = 300

// ── Shared row styles ─────────────────────────────────────────────────────────

function PortraitRow({
  luminary,
  left,
  right,
  sx = {},
}: {
  luminary: Luminary
  left: React.ReactNode
  right?: React.ReactNode
  sx?: object
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: 72,
        borderRadius: 1.5,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        userSelect: 'none',
        bgcolor: '#0d0d1a',
        backgroundImage: luminary.portrait_path
          ? `url(${imageUrl(luminary.portrait_path)})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        // gradient: dark edges, fully transparent center; extends 1px past edges to kill sub-pixel gaps
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -1,
          right: -1,
          bottom: -1,
          left: -1,
          background:
            'linear-gradient(90deg, rgba(8,8,20,0.92) 0%, rgba(8,8,20,0) 35%, rgba(8,8,20,0) 65%, rgba(8,8,20,0.88) 100%)',
        },
        ...sx,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          width: '100%',
        }}
      >
        {left}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.88rem',
            flex: 1,
            minWidth: 0,
            letterSpacing: 0.2,
            py: 1,
            px: 1,
            textShadow: '0 1px 6px rgba(0,0,0,1), 0 2px 8px rgba(0,0,0,1)',
          }}
          noWrap
        >
          {luminary.name}
        </Typography>
        {right}
      </Box>
    </Box>
  )
}

// ── Floating copy rendered by DragOverlay ─────────────────────────────────────

function MemberRowOverlay({ luminary }: { luminary: Luminary }) {
  return (
    <PortraitRow
      luminary={luminary}
      left={<DragIndicatorIcon fontSize="small" sx={{ color: 'primary.main', flexShrink: 0 }} />}
      sx={{
        border: '1px solid',
        borderColor: 'primary.main',
        boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
        cursor: 'grabbing',
      }}
    />
  )
}

// ── Sortable row ──────────────────────────────────────────────────────────────

function SortableMemberRow({
  luminary,
  isActive,
  onRemove,
}: {
  luminary: Luminary
  isActive: boolean
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef } = useSortable({ id: luminary.slug })

  if (isActive) {
    return (
      <motion.div layout transition={{ duration: 0.15, ease: 'easeOut' }}>
        <Box
          ref={setNodeRef}
          sx={{
            height: 72,
            borderRadius: 1.5,
            border: '2px dashed rgba(212,160,23,0.4)',
            bgcolor: 'rgba(212,160,23,0.05)',
          }}
        />
      </motion.div>
    )
  }

  return (
    <motion.div layout transition={{ duration: 0.15, ease: 'easeOut' }}>
      <Box ref={setNodeRef} {...attributes}>
        <PortraitRow
          luminary={luminary}
          left={
            <Box
              {...listeners}
              style={{ touchAction: 'none' }}
              sx={{
                cursor: 'grab',
                color: 'rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9))',
                '&:hover': { color: 'rgba(255,255,255,0.8)' },
                '&:active': { cursor: 'grabbing', color: 'primary.main' },
              }}
            >
              <DragIndicatorIcon fontSize="small" />
            </Box>
          }
          right={
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              sx={{
                color: 'rgba(255,255,255,0.35)',
                flexShrink: 0,
                filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9))',
                '&:hover': { color: '#ef4444' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      </Box>
    </motion.div>
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

  const [activeId, setActiveId] = useState<string | null>(null)
  const [overItemId, setOverItemId] = useState<string | null>(null)

  const navigate = useNavigate()
  const createTeam = useCreateTeam()
  const updateTeam = useUpdateTeam()

  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

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

  const displayOrder = useMemo(() => {
    if (!activeId || !overItemId || activeId === overItemId) return orderedSlugs
    const from = orderedSlugs.indexOf(activeId)
    const to = orderedSlugs.indexOf(overItemId)
    if (from === -1 || to === -1) return orderedSlugs
    return arrayMove(orderedSlugs, from, to)
  }, [activeId, overItemId, orderedSlugs])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  // Fixed-position tracking — captured once at drag start so DOM reorders can't loop back
  const listRef = useRef<HTMLDivElement | null>(null)
  const initialListTop = useRef(0)
  const initialPointerY = useRef(0)
  const slugsAtDragStart = useRef<string[]>([])

  const ITEM_H = 72
  const ITEM_SLOT = ITEM_H + 6 // 6px = spacing 0.75 * 8

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id))
    slugsAtDragStart.current = orderedSlugs
    if (listRef.current) initialListTop.current = listRef.current.getBoundingClientRect().top
    if (e.activatorEvent instanceof PointerEvent) initialPointerY.current = e.activatorEvent.clientY
  }

  const handleDragMove = (e: DragMoveEvent) => {
    const curY = initialPointerY.current + e.delta.y
    const relY = curY - initialListTop.current
    const activeSlug = String(e.active.id)
    const slugs = slugsAtDragStart.current

    let closestSlug: string | null = null
    let closestDist = Infinity
    slugs.forEach((slug, i) => {
      const dist = Math.abs(relY - (i * ITEM_SLOT + ITEM_H / 2))
      if (dist < closestDist) {
        closestDist = dist
        // Active item's own slot → null means "back to original position"
        closestSlug = slug === activeSlug ? null : slug
      }
    })

    setOverItemId((prev) => (prev === closestSlug ? prev : closestSlug))
  }

  const handleDragEnd = () => {
    const aid = activeId
    const oid = overItemId
    setActiveId(null)
    setOverItemId(null)
    if (aid && oid && aid !== oid) {
      setOrderedSlugs((prev) => {
        const from = prev.indexOf(aid)
        const to = prev.indexOf(oid)
        return from === -1 || to === -1 ? prev : arrayMove(prev, from, to)
      })
    }
  }

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
      /* handled by react-query */
    }
  }

  const handleCreate = async () => {
    try {
      await createTeam.mutateAsync({ name: teamName, luminary_slugs: orderedSlugs })
      navigate('/teams')
    } catch {
      /* handled by react-query */
    }
    setDialogOpen(false)
  }

  const activeLuminary = activeId ? bySlug[activeId] : null
  const hasSelection = orderedSlugs.length > 0

  // ── Team tray (shared between mobile and desktop) ─────────────────────────

  const teamTray = (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2 }}>
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
        Your Team ({orderedSlugs.length}/{MAX})
      </Typography>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={displayOrder} strategy={verticalListSortingStrategy}>
          <Stack ref={listRef} spacing={0.75}>
            {displayOrder.map((slug) => {
              const l = bySlug[slug]
              if (!l) return null
              return (
                <SortableMemberRow
                  key={slug}
                  luminary={l}
                  isActive={activeId === slug}
                  onRemove={() => toggle(slug)}
                />
              )
            })}
          </Stack>
        </SortableContext>
        <DragOverlay
          dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}
        >
          {activeLuminary ? <MemberRowOverlay luminary={activeLuminary} /> : null}
        </DragOverlay>
      </DndContext>
    </Box>
  )

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      {/* ── Header ──────────────────────────────────────────────────── */}
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

      {/* ── Two-column layout ────────────────────────────────────────── */}
      <LayoutGroup>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { md: 3 },
            alignItems: 'flex-start',
          }}
        >
          {/* LEFT: team tray */}
          {isDesktop ? (
            // Desktop: width jumps immediately (so grid FLIP measures correct positions),
            // clip-path provides the visual slide-in effect.
            <motion.div
              initial={false}
              animate={{ clipPath: hasSelection ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              style={{ width: hasSelection ? TRAY_WIDTH : 0, overflow: 'hidden', flexShrink: 0 }}
            >
              <Box
                sx={{
                  width: TRAY_WIDTH,
                  position: 'sticky',
                  top: 16,
                  maxHeight: 'calc(100vh - 80px)',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {teamTray}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={editingTeam ? handleUpdate : () => setDialogOpen(true)}
                  sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700 }}
                >
                  {editingTeam ? 'Update Team' : 'Save Team'}
                </Button>
              </Box>
            </motion.div>
          ) : hasSelection ? (
            // Mobile: simple show/hide, no animation
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {teamTray}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={editingTeam ? handleUpdate : () => setDialogOpen(true)}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700 }}
              >
                {editingTeam ? 'Update Team' : 'Save Team'}
              </Button>
            </Box>
          ) : null}

          {/* RIGHT: filters + luminary grid */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Filters — single row like the tier list */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 3,
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block' }}>
                  Class
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  {classes.map((c) => (
                    <FilterChip
                      key={c}
                      label={c}
                      filterState={selectedClasses.has(c) ? 'inclusive' : 'off'}
                      onClick={() => setSelectedClasses((p) => toggleFilter(p, c))}
                      iconUrl={classIconUrl(c)}
                      accentColor={CLASS_COLORS[c]}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block' }}>
                  Faction
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  {factions.map((f) => (
                    <FilterChip
                      key={f}
                      label={f}
                      filterState={selectedFactions.has(f) ? 'inclusive' : 'off'}
                      onClick={() => setSelectedFactions((p) => toggleFilter(p, f))}
                      iconUrl={factionIconUrl(f)}
                      accentColor={FACTION_COLORS[f]}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Luminary grid — FLIP animates items to new positions as panel opens/closes */}
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.5 }}>
              {filtered.map((l: Luminary) => (
                <motion.div
                  key={l.slug}
                  layout
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                >
                  <LuminaryIcon
                    luminary={l}
                    selected={selectedSet.has(l.slug)}
                    disabled={!selectedSet.has(l.slug) && orderedSlugs.length >= MAX}
                    onClick={() => toggle(l.slug)}
                    size={96}
                    showName
                  />
                </motion.div>
              ))}
            </Stack>
          </Box>
        </Box>
      </LayoutGroup>

      {/* ── Create dialog ────────────────────────────────────────────── */}
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
