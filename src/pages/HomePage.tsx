import { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Stack,
  Button,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useLuminaries } from '../hooks/useLuminaries'
import FilterChip from '../components/FilterChip'
import LuminaryIcon from '../components/LuminaryIcon'
import { FACTION_COLORS, factionIconUrl } from '../constants/factions'
import { CLASS_COLORS, classIconUrl } from '../constants/classes'
import type { Luminary } from '../types/luminary'

const TIERS = ['SS', 'S+', 'S', 'A+', 'A', 'B+', 'B', 'C+', 'C']
const TIER_COLORS: Record<string, string> = {
  SS: '#d4a017',
  'S+': '#ff4500',
  S: '#ff6b35',
  'A+': '#ff8c00',
  A: '#ffa500',
  'B+': '#1e90ff',
  B: '#4fc3f7',
  'C+': '#3cb371',
  C: '#81c784',
}

function TierRow({
  tier,
  lums,
  onNavigate,
  color,
}: {
  tier: string
  lums: Luminary[]
  onNavigate: (path: string) => void
  color?: string
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        mb: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: 56,
          minHeight: 128,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: color ?? TIER_COLORS[tier] ?? '#555',
          flexShrink: 0,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 900, color: 'white' }}>
          {tier}
        </Typography>
      </Box>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, p: 1.5 }}>
        {lums.map((l) => (
          <LuminaryIcon
            key={l.slug}
            luminary={l}
            showName
            onClick={() => onNavigate(`/luminaries/${l.slug}`)}
          />
        ))}
      </Stack>
    </Box>
  )
}

export default function HomePage() {
  const { data: luminaries = [], isLoading } = useLuminaries()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'overall' | 'pve' | 'pvp'>('overall')
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set())
  const [selectedFactions, setSelectedFactions] = useState<Set<string>>(new Set())

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

  const toggle = (prev: Set<string>, val: string): Set<string> => {
    const s = new Set(prev)
    if (s.has(val)) s.delete(val)
    else s.add(val)
    return s
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Tier List
        </Typography>
        <Button component={Link} to="/team-builder" variant="contained">
          Build a Team
        </Button>
      </Box>

      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_, v) => {
          if (v) setMode(v)
        }}
        size="small"
        sx={{
          mb: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 0.5,
          gap: 0.5,
          '& .MuiToggleButtonGroup-grouped': {
            border: 0,
            borderRadius: '6px !important',
          },
        }}
      >
        {(
          [
            ['overall', 'All'],
            ['pve', 'PvE'],
            ['pvp', 'PvP'],
          ] as const
        ).map(([val, label]) => (
          <ToggleButton
            key={val}
            value={val}
            sx={{
              px: 3,
              py: 0.75,
              fontWeight: 600,
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: '#0f0f1a',
                '&:hover': { bgcolor: 'primary.main' },
              },
            }}
          >
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

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
              onClick={() => setSelectedClasses((p) => toggle(p, c))}
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
              onClick={() => setSelectedFactions((p) => toggle(p, f))}
              iconUrl={factionIconUrl(f)}
              accentColor={FACTION_COLORS[f]}
            />
          ))}
        </Stack>
      </Box>

      {isLoading ? (
        TIERS.map((t) => (
          <Skeleton key={t} variant="rectangular" height={88} sx={{ mb: 2, borderRadius: 2 }} />
        ))
      ) : (
        <>
          {TIERS.map((tier) => {
            const lums = filtered.filter((l: Luminary) => l.tiers?.[mode] === tier)
            if (!lums.length) return null
            return <TierRow key={tier} tier={tier} lums={lums} onNavigate={navigate} />
          })}
          {(() => {
            const unranked = filtered.filter(
              (l: Luminary) => !TIERS.includes(l.tiers?.[mode] ?? '')
            )
            if (!unranked.length) return null
            return <TierRow tier="—" lums={unranked} onNavigate={navigate} color="#555" />
          })()}
        </>
      )}
    </Box>
  )
}
