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
import FilterChip, { type FilterState } from '../components/FilterChip'
import LuminaryIcon from '../components/LuminaryIcon'
import { FACTION_COLORS, factionIconUrl } from '../constants/factions'
import { CLASS_COLORS, classIconUrl } from '../constants/classes'
import { TIER_COLORS } from '../constants/colors'
import type { Luminary } from '../types/luminary'

const TIERS = ['SS', 'S+', 'S', 'A+', 'A', 'B+', 'B', 'C+', 'C']

function cycleClassFilter(prev: Map<string, FilterState>, key: string): Map<string, FilterState> {
  const next = new Map(prev)
  if (next.get(key) === 'inclusive') next.delete(key)
  else next.set(key, 'inclusive')
  return next
}

function cycleFactionFilter(prev: Map<string, FilterState>, key: string): Map<string, FilterState> {
  const next = new Map(prev)
  const current = next.get(key) ?? 'off'
  if (current === 'off') {
    // At max exclusive, evict the oldest before adding new inclusive
    const exclusiveCount = [...next.values()].filter((v) => v === 'exclusive').length
    if (exclusiveCount >= 2) {
      for (const [k, v] of next.entries()) {
        if (v === 'exclusive') {
          next.delete(k)
          break
        }
      }
    }
    next.set(key, 'inclusive')
  } else if (current === 'inclusive') {
    next.set(key, 'exclusive')
    // At 2 exclusive the filter is fully constrained — drop any remaining inclusive
    const exclusiveCount = [...next.values()].filter((v) => v === 'exclusive').length
    if (exclusiveCount >= 2) {
      ;[...next.entries()].filter(([, v]) => v === 'inclusive').forEach(([k]) => next.delete(k))
    }
  } else {
    next.delete(key)
  }
  return next
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
  const [classFilters, setClassFilters] = useState<Map<string, FilterState>>(new Map())
  const [factionFilters, setFactionFilters] = useState<Map<string, FilterState>>(new Map())

  const classes = useMemo(
    () => [...new Set(luminaries.map((l: Luminary) => l.class))].sort(),
    [luminaries]
  )
  const factions = useMemo(
    () => [...new Set(luminaries.flatMap((l: Luminary) => l.factions ?? []))].sort(),
    [luminaries]
  )

  const hasActiveFilters = classFilters.size > 0 || factionFilters.size > 0

  const filtered = useMemo(() => {
    const activeClasses = new Set(classFilters.keys())

    const inclusiveFactions = new Set<string>()
    const exclusiveFactions = new Set<string>()
    factionFilters.forEach((state, faction) => {
      if (state === 'inclusive') inclusiveFactions.add(faction)
      else if (state === 'exclusive') exclusiveFactions.add(faction)
    })

    return luminaries.filter((l: Luminary) => {
      if (activeClasses.size > 0 && !activeClasses.has(l.class)) return false

      const lFactions = l.factions ?? []
      if (inclusiveFactions.size > 0 && !lFactions.some((f) => inclusiveFactions.has(f)))
        return false
      if (exclusiveFactions.size > 0 && ![...exclusiveFactions].every((f) => lFactions.includes(f)))
        return false

      return true
    })
  }, [luminaries, classFilters, factionFilters])

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

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Mode toggle — left */}
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, v) => {
            if (v) setMode(v)
          }}
          size="small"
          sx={{
            flexShrink: 0,
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
                py: 1.5,
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

        {/* Class filter */}
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block' }}>
            Class
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {classes.map((c) => (
              <FilterChip
                key={c}
                label={c}
                filterState={classFilters.get(c) ?? 'off'}
                onClick={() => setClassFilters((p) => cycleClassFilter(p, c))}
                iconUrl={classIconUrl(c)}
                accentColor={CLASS_COLORS[c]}
              />
            ))}
          </Box>
        </Box>

        {/* Faction filter */}
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block' }}>
            Faction
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {factions.map((f) => (
              <FilterChip
                key={f}
                label={f}
                filterState={factionFilters.get(f) ?? 'off'}
                onClick={() => setFactionFilters((p) => cycleFactionFilter(p, f))}
                iconUrl={factionIconUrl(f)}
                accentColor={FACTION_COLORS[f]}
              />
            ))}
          </Box>
        </Box>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setClassFilters(new Map())
              setFactionFilters(new Map())
            }}
            sx={{ flexShrink: 0, alignSelf: 'center', mt: { xs: 0, md: 2 } }}
          >
            Clear Filters
          </Button>
        )}
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
