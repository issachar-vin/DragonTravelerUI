import { useState, useMemo } from 'react'
import { Box, Typography, Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion'
import { useGearSets } from '../hooks/useGearSets'
import GearTooltipContent from '../components/GearTooltipContent'
import type { GearSet, GearPiece } from '../types/gear'
import type { GearItem } from '../types/luminary'

const SLOTS = ['All', 'Headgear', 'Chestplate', 'Bracers', 'Boots', 'Weapon', 'Accessory']
const TRANSITION = { duration: 0.25, ease: 'easeOut' } as const

function toGearItem(piece: GearPiece, setName?: string): GearItem {
  return {
    name: piece.name,
    slot: piece.slot,
    set: setName,
    images: piece.images,
    piece_effect: piece.piece_effect,
  }
}

function PieceCard({ piece, setName }: { piece: GearPiece; setName?: string }) {
  return (
    <motion.div layoutId={piece.slug} layout transition={TRANSITION}>
      <Box
        sx={{
          bgcolor: 'rgba(255,255,255,0.04)',
          borderRadius: 1.5,
          p: 1.5,
          border: '1px solid rgba(255,255,255,0.06)',
          height: '100%',
        }}
      >
        <GearTooltipContent g={toGearItem(piece, setName)} />
      </Box>
    </motion.div>
  )
}

function SetsView({ filteredSets }: { filteredSets: GearSet[] }) {
  return (
    <AnimatePresence mode="popLayout">
      {filteredSets.map((gs) => (
        <motion.div
          key={gs.slug}
          layout
          transition={TRANSITION}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 2,
              mb: 2,
              display: 'flex',
              gap: 3,
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            {/* Set info column */}
            <Box sx={{ width: { xs: '100%', md: 220 }, flexShrink: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff', mb: 0.75 }}>
                {gs.name}
              </Typography>
              {gs.bonus_type && (
                <Box
                  sx={{
                    display: 'inline-block',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#f59e0b',
                    bgcolor: 'rgba(245,158,11,0.12)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 0.75,
                    px: 0.75,
                    py: 0.25,
                    mb: 0.75,
                  }}
                >
                  {gs.bonus_type}
                </Box>
              )}
              {gs.bonus_effect && (
                <Typography
                  sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}
                >
                  {gs.bonus_effect}
                </Typography>
              )}
            </Box>

            {/* Pieces column */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.5,
                alignContent: 'flex-start',
              }}
            >
              {gs.pieces.map((piece) => (
                <Box key={piece.slug} sx={{ flex: '1 1 260px', maxWidth: 360 }}>
                  <PieceCard piece={piece} setName={gs.name} />
                </Box>
              ))}
            </Box>
          </Box>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

function GridView({ allPieces }: { allPieces: { piece: GearPiece; setName: string }[] }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
      {allPieces.map(({ piece, setName }) => (
        <Box key={piece.slug} sx={{ flex: '1 1 260px', maxWidth: 360 }}>
          <PieceCard piece={piece} setName={setName} />
        </Box>
      ))}
    </Box>
  )
}

export default function GearPage() {
  const { data: gearSets = [], isLoading } = useGearSets()
  const [slot, setSlot] = useState('All')
  const [showSets, setShowSets] = useState(true)

  const filteredSets = useMemo(() => {
    if (slot === 'All') return gearSets
    return gearSets
      .map((gs) => ({ ...gs, pieces: gs.pieces.filter((p) => p.slot === slot) }))
      .filter((gs) => gs.pieces.length > 0)
  }, [gearSets, slot])

  const allPieces = useMemo(
    () => filteredSets.flatMap((gs) => gs.pieces.map((piece) => ({ piece, setName: gs.name }))),
    [filteredSets]
  )

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>
          Gear
        </Typography>

        {/* Sets / Grid toggle */}
        <ToggleButtonGroup
          value={showSets ? 'sets' : 'grid'}
          exclusive
          onChange={(_, v) => {
            if (v) setShowSets(v === 'sets')
          }}
          size="small"
          sx={{
            flexShrink: 0,
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 0.5,
            gap: 0.5,
            '& .MuiToggleButtonGroup-grouped': { border: 0, borderRadius: '6px !important' },
          }}
        >
          {(
            [
              ['sets', 'Sets'],
              ['grid', 'Grid'],
            ] as const
          ).map(([val, label]) => (
            <ToggleButton
              key={val}
              value={val}
              sx={{
                px: 2,
                py: 0.75,
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
                textTransform: 'none',
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

        {/* Slot filter */}
        <ToggleButtonGroup
          value={slot}
          exclusive
          onChange={(_, v) => {
            if (v) setSlot(v)
          }}
          size="small"
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 0.5,
            gap: 0.5,
            flexWrap: 'wrap',
            '& .MuiToggleButtonGroup-grouped': {
              border: 0,
              borderRadius: '6px !important',
            },
          }}
        >
          {SLOTS.map((s) => (
            <ToggleButton
              key={s}
              value={s}
              sx={{
                px: 2,
                py: 0.75,
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
                textTransform: 'none',
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: '#0f0f1a',
                  '&:hover': { bgcolor: 'primary.main' },
                },
              }}
            >
              {s}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={140} sx={{ mb: 2, borderRadius: 2 }} />
        ))
      ) : (
        <LayoutGroup>
          {showSets ? <SetsView filteredSets={filteredSets} /> : <GridView allPieces={allPieces} />}
        </LayoutGroup>
      )}
    </Box>
  )
}
