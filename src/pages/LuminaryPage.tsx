import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Stack, Button, Chip, CircularProgress, Tooltip } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useLuminaries } from '../hooks/useLuminaries'
import { imageUrl } from '../api/client'
import { FACTION_COLORS, factionIconUrl } from '../constants/factions'
import { classIconUrl } from '../constants/classes'
import StatusText from '../components/StatusText'
import SubclassIcon from '../components/SubclassIcon'
import GearTooltipContent from '../components/GearTooltipContent'
import { TOOLTIP_SLOT_PROPS } from '../constants/tooltips'

const BG = '#0f0f1a'

const RARITY_COLORS: Record<string, string> = {
  'SSR EX': '#0d9488',
  'SSR+': '#ef4444',
  SSR: '#f59e0b',
  SR: '#8b5cf6',
  R: '#64748b',
}

const TIER_COLORS: Record<string, string> = {
  SS: '#d4a017',
  S: '#ff6b35',
  A: '#ffa500',
  B: '#4fc3f7',
  C: '#81c784',
}

const SKILL_TYPE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  default: {
    bg: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.5)',
    border: 'rgba(255,255,255,0.12)',
  },
  ultimate: { bg: '#7c3aed22', color: '#a78bfa', border: '#7c3aed60' },
  overdrive: { bg: '#991b1b33', color: '#fca5a5', border: '#991b1b60' },
  passive: { bg: '#14532d22', color: '#86efac', border: '#14532d60' },
}

function skillTypeStyle(type?: string) {
  if (!type) return SKILL_TYPE_STYLES.default
  const t = type.toLowerCase()
  if (t.includes('ultimate') || t.includes('divine')) return SKILL_TYPE_STYLES.ultimate
  if (t.includes('overdrive')) return SKILL_TYPE_STYLES.overdrive
  if (t.includes('passive')) return SKILL_TYPE_STYLES.passive
  return SKILL_TYPE_STYLES.default
}

export default function LuminaryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: luminaries = [], isLoading } = useLuminaries()

  const l = luminaries.find((x) => x.slug === slug)

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!l) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: 'text.secondary', mb: 2 }}>
          Luminary not found
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Back to Tier List
        </Button>
      </Box>
    )
  }

  const hasFactions = (l.factions?.length ?? 0) > 0
  const hasSubclasses = (l.subclasses?.length ?? 0) > 0

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* ── Hero portrait ─────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 340, sm: 460 },
          bgcolor: '#1a1a2e',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={imageUrl(l.portrait_path)}
          alt={l.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
          }}
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to bottom, transparent 12%, rgba(15,15,26,0.45) 48%, ${BG} 100%)`,
          }}
        />

        {/* Back button */}
        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            size="small"
            sx={{
              bgcolor: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(8px)',
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.15)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
            }}
          >
            Back
          </Button>
        </Box>

        {/* Bottom info: left = name/class/tiers, right = factions + subclasses */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            px: { xs: 2.5, sm: 3.5 },
            pb: { xs: 2.5, sm: 3 },
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Left: name / class / tiers */}
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                color: '#fff',
                fontSize: { xs: '1.9rem', sm: '2.6rem' },
                lineHeight: 1.15,
                mb: 1,
                textShadow: '0 2px 14px rgba(0,0,0,0.9)',
              }}
            >
              {l.name}
            </Typography>

            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  component="img"
                  src={classIconUrl(l.class)}
                  alt={l.class}
                  sx={{
                    width: 22,
                    height: 22,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9))',
                  }}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 600,
                    textShadow: '0 1px 6px rgba(0,0,0,0.9)',
                  }}
                >
                  {l.class}
                </Typography>
              </Box>
              {l.rarity && (
                <Chip
                  label={l.rarity}
                  size="small"
                  sx={{
                    bgcolor: RARITY_COLORS[l.rarity] ?? '#555',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {(['overall', 'pvp', 'pve'] as const).map((t) => {
                const val = l.tiers?.[t]
                const col = TIER_COLORS[val ?? ''] ?? '#555'
                return (
                  <Box key={t} sx={{ textAlign: 'center' }}>
                    <Typography
                      sx={{
                        fontSize: '0.6rem',
                        color: 'rgba(255,255,255,0.5)',
                        textTransform: 'uppercase',
                        mb: 0.25,
                        textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                      }}
                    >
                      {t}
                    </Typography>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: `${col}30`,
                        border: `1px solid ${col}80`,
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 800, color: col, textShadow: `0 0 12px ${col}90` }}
                      >
                        {val ?? '—'}
                      </Typography>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Box>

          {/* Right: factions + subclasses */}
          {(hasFactions || hasSubclasses) && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 1.5,
                flexShrink: 0,
              }}
            >
              {hasFactions && (
                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                  {l.factions.map((f) => (
                    <Box
                      key={f}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.4,
                      }}
                    >
                      <Box
                        component="img"
                        src={factionIconUrl(f)}
                        alt={f}
                        sx={{
                          width: 40,
                          height: 40,
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))',
                        }}
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          color: FACTION_COLORS[f] ?? 'rgba(255,255,255,0.75)',
                          textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                          textAlign: 'center',
                        }}
                      >
                        {f}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}

              {hasSubclasses && (
                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                  {l.subclasses!.map((sub) => (
                    <SubclassIcon
                      key={sub}
                      name={sub}
                      iconPath={l.subclass_icon_paths?.[sub]}
                      size={40}
                      labelSize="0.6rem"
                      labelColor="rgba(255,255,255,0.75)"
                    />
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pb: 4 }}>
        {/* ── Recommended Gear ──────────────────────────────────────── */}
        {(l.recommended_gear?.length ?? 0) > 0 && (
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 3, mb: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Recommended Gear
            </Typography>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.5 }}>
              {l.recommended_gear.map((g) => (
                <Tooltip
                  key={g.name}
                  title={<GearTooltipContent g={g} />}
                  placement="top"
                  arrow
                  enterDelay={500}
                  enterNextDelay={500}
                  slotProps={TOOLTIP_SLOT_PROPS}
                >
                  <Box
                    sx={{
                      width: 88,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.75,
                      p: 1,
                    }}
                  >
                    {g.images?.path ? (
                      <Box
                        component="img"
                        src={imageUrl(g.images.path)}
                        alt={g.name}
                        sx={{ width: 60, height: 60, objectFit: 'contain' }}
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                          {g.slot[0]}
                        </Typography>
                      </Box>
                    )}
                    <Typography
                      sx={{
                        fontSize: '0.65rem',
                        color: 'rgba(255,255,255,0.6)',
                        textAlign: 'center',
                        lineHeight: 1.2,
                      }}
                    >
                      {g.name}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Stack>
          </Box>
        )}

        {/* ── Talent (left) + Skills (right) side by side ───────────── */}
        {((l.skills?.length ?? 0) > 0 || l.talent) && (
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', mb: 3 }}>
            {/* Talent — left */}
            {l.talent && (
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Talent
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  {l.talent.icon_path && (
                    <Box
                      component="img"
                      src={imageUrl(l.talent.icon_path)}
                      alt={l.talent.name}
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 1.5,
                        objectFit: 'contain',
                        flexShrink: 0,
                        bgcolor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                  <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: '1rem' }}>
                    {l.talent.name}
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  {l.talent.levels.map((lvl) => (
                    <Box key={lvl.level}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1,
                          py: 0.25,
                          mb: 0.5,
                          borderRadius: 1,
                          bgcolor: 'rgba(99,102,241,0.15)',
                          border: '1px solid rgba(99,102,241,0.35)',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8' }}>
                          Level {lvl.level}
                        </Typography>
                      </Box>
                      <StatusText
                        text={lvl.description}
                        color="rgba(255,255,255,0.7)"
                        fontSize="0.9rem"
                        sx={{ lineHeight: 1.65, display: 'block' }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Skills — right */}
            {(l.skills?.length ?? 0) > 0 && (
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Skills
                </Typography>
                <Stack spacing={2.5}>
                  {l.skills!.map((sk) => {
                    const ts = skillTypeStyle(sk.type)
                    return (
                      <Box key={sk.name} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        {sk.icon_path && (
                          <Box
                            component="img"
                            src={imageUrl(sk.icon_path)}
                            alt={sk.name}
                            sx={{
                              width: 52,
                              height: 52,
                              borderRadius: 1.5,
                              objectFit: 'contain',
                              flexShrink: 0,
                              bgcolor: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        )}
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 0.5,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                              {sk.name}
                            </Typography>
                            {sk.type && (
                              <Chip
                                label={sk.type}
                                size="small"
                                sx={{
                                  bgcolor: ts.bg,
                                  color: ts.color,
                                  border: `1px solid ${ts.border}`,
                                  fontWeight: 700,
                                  height: 20,
                                  fontSize: '0.65rem',
                                  '& .MuiChip-label': { px: 1 },
                                }}
                              />
                            )}
                          </Box>
                          <StatusText
                            text={sk.description}
                            color="rgba(255,255,255,0.7)"
                            fontSize="0.9rem"
                            sx={{ lineHeight: 1.65, display: 'block' }}
                          />
                        </Box>
                      </Box>
                    )
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
