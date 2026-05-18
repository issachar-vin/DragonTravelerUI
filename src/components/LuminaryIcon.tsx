import { Box, Tooltip, Typography, Stack, Chip } from '@mui/material'
import { imageUrl } from '../api/client'
import { FACTION_COLORS, factionIconUrl } from '../constants/factions'
import { classIconUrl } from '../constants/classes'
import type { Luminary } from '../types/luminary'
import StatusText from './StatusText'

const RARITY_COLORS: Record<string, string> = {
  'SSR EX': '#0d9488',
  'SSR+': '#ef4444',
  SSR: '#f59e0b',
  SR: '#8b5cf6',
  R: '#64748b',
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

function TooltipContent({ l }: { l: Luminary }) {
  const gear = l.recommended_gear ?? []
  const skills = l.skills ?? []
  const talentLevels = l.talent?.levels ?? []

  return (
    <Box sx={{ width: 780, p: 0 }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          backgroundImage: `linear-gradient(to right, rgba(10,10,26,0.92) 0%, rgba(10,10,26,0.6) 60%, rgba(10,10,26,0.3) 100%), url(${imageUrl(l.portrait_path)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 25%',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff', mb: 0.5 }}>
            {l.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                component="img"
                src={classIconUrl(l.class)}
                alt={l.class}
                sx={{ width: 18, height: 18, objectFit: 'contain', opacity: 0.9 }}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                {l.class}
              </Typography>
            </Box>
            {l.rarity && (
              <Chip
                label={l.rarity}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: RARITY_COLORS[l.rarity] ?? '#555',
                  color: '#fff',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            )}
          </Box>
        </Box>

        {/* Factions + Subclasses in header right side */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, alignItems: 'flex-end' }}>
          {(l.factions?.length ?? 0) > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}
            >
              {l.factions.map((f) => (
                <Box
                  key={f}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.4,
                    width: 56,
                  }}
                >
                  <Box
                    component="img"
                    src={factionIconUrl(f)}
                    alt={f}
                    sx={{ width: 44, height: 44, objectFit: 'contain' }}
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '0.58rem',
                      color: FACTION_COLORS[f] ?? 'rgba(255,255,255,0.55)',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      wordBreak: 'break-word',
                    }}
                  >
                    {f}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
          {(l.subclasses?.length ?? 0) > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}
            >
              {l.subclasses!.map((sub) => {
                const iconPath = l.subclass_icon_paths?.[sub]
                return (
                  <Box
                    key={sub}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.4,
                      width: 56,
                    }}
                  >
                    {iconPath && (
                      <Box
                        component="img"
                        src={imageUrl(iconPath)}
                        alt={sub}
                        sx={{ width: 44, height: 44, objectFit: 'contain' }}
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}
                    <Typography
                      sx={{
                        fontSize: '0.58rem',
                        color: 'rgba(255,255,255,0.55)',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                      }}
                    >
                      {sub}
                    </Typography>
                  </Box>
                )
              })}
            </Stack>
          )}
        </Box>
      </Box>

      <Box sx={{ px: 2.5, py: 2 }}>
        {/* ── Gear (full width, above columns) ───────────────────────────── */}
        {gear.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                mb: 1,
              }}
            >
              Recommended Gear
            </Typography>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {gear.map((g) => (
                <Tooltip
                  key={g.name}
                  title={
                    g.bonus_effect ? (
                      <Box sx={{ maxWidth: 220 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', mb: 0.25 }}>
                          {g.name}
                        </Typography>
                        <Typography
                          sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', mb: 0.75 }}
                        >
                          {g.slot}
                          {g.set ? ` · ${g.set}` : ''}
                        </Typography>
                        {g.bonus_type && (
                          <Typography
                            sx={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              color: '#f59e0b',
                              textTransform: 'uppercase',
                              letterSpacing: 0.4,
                              mb: 0.4,
                            }}
                          >
                            {g.bonus_type}
                          </Typography>
                        )}
                        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)' }}>
                          {g.bonus_effect}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ maxWidth: 180 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', mb: 0.25 }}>
                          {g.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                          {g.slot}
                          {g.set ? ` · ${g.set}` : ''}
                        </Typography>
                      </Box>
                    )
                  }
                  placement="top"
                  arrow
                  enterDelay={300}
                  enterNextDelay={300}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.4,
                      width: 56,
                      cursor: 'default',
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        bgcolor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {g.images?.path ? (
                        <Box
                          component="img"
                          src={imageUrl(g.images.path)}
                          alt={g.name}
                          sx={{ width: 40, height: 40, objectFit: 'contain' }}
                          onError={(e) => {
                            const el = e.target as HTMLImageElement
                            el.style.display = 'none'
                            el.parentElement!.innerHTML = `<span style="font-size:10px;color:rgba(255,255,255,0.4);text-align:center;padding:2px">${g.slot[0]}</span>`
                          }}
                        />
                      ) : (
                        <Typography
                          sx={{
                            fontSize: '0.65rem',
                            color: 'rgba(255,255,255,0.3)',
                            textAlign: 'center',
                            px: 0.5,
                          }}
                        >
                          {g.slot[0]}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.58rem',
                        color: 'rgba(255,255,255,0.5)',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
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

        {/* ── Two-column: Skills (left) | Talent (right) ─────────────────── */}
        {(skills.length > 0 || l.talent) && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            {/* Skills column */}
            {skills.length > 0 && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    mb: 1,
                  }}
                >
                  Skills
                </Typography>
                <Stack spacing={1.25}>
                  {skills.map((sk) => {
                    const ts = skillTypeStyle(sk.type)
                    return (
                      <Box key={sk.name} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        {sk.icon_path && (
                          <Box
                            component="img"
                            src={imageUrl(sk.icon_path)}
                            alt={sk.name}
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: 1,
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
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.75,
                              mb: 0.3,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                color: '#fff',
                                lineHeight: 1.2,
                              }}
                            >
                              {sk.name}
                            </Typography>
                            {sk.type && (
                              <Chip
                                label={sk.type}
                                size="small"
                                sx={{
                                  height: 16,
                                  fontSize: '0.6rem',
                                  fontWeight: 700,
                                  bgcolor: ts.bg,
                                  color: ts.color,
                                  border: `1px solid ${ts.border}`,
                                  '& .MuiChip-label': { px: 0.75 },
                                }}
                              />
                            )}
                          </Box>
                          <StatusText
                            text={
                              sk.description.length > 160
                                ? `${sk.description.slice(0, 160)}…`
                                : sk.description
                            }
                            color="rgba(255,255,255,0.55)"
                            fontSize="0.71rem"
                            sx={{ lineHeight: 1.5, display: 'block' }}
                          />
                        </Box>
                      </Box>
                    )
                  })}
                </Stack>
              </Box>
            )}

            {/* Divider between columns */}
            {skills.length > 0 && l.talent && (
              <Box
                sx={{
                  width: '1px',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  alignSelf: 'stretch',
                  flexShrink: 0,
                }}
              />
            )}

            {/* Talent column */}
            {l.talent && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    mb: 1,
                  }}
                >
                  Talent
                </Typography>
                <Typography
                  sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.82rem', mb: 1 }}
                >
                  {l.talent.name}
                </Typography>
                <Stack spacing={1}>
                  {talentLevels.map((lvl) => (
                    <Box key={lvl.level}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 0.75,
                          py: 0.2,
                          mb: 0.4,
                          borderRadius: 1,
                          bgcolor: 'rgba(99,102,241,0.15)',
                          border: '1px solid rgba(99,102,241,0.35)',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: '#818cf8',
                            lineHeight: 1,
                          }}
                        >
                          Lv {lvl.level}
                        </Typography>
                      </Box>
                      <StatusText
                        text={lvl.description}
                        color="rgba(255,255,255,0.6)"
                        fontSize="0.71rem"
                        sx={{ lineHeight: 1.55, display: 'block' }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

interface Props {
  luminary: Luminary
  selected?: boolean
  onClick?: () => void
  size?: number
  disabled?: boolean
  showName?: boolean
}

export default function LuminaryIcon({
  luminary: l,
  selected,
  onClick,
  size = 90,
  disabled,
  showName,
}: Props) {
  const iconSrc = l.icon_path || null
  const h = Math.round((size * 4) / 3)

  return (
    <Tooltip
      title={<TooltipContent l={l} />}
      arrow
      placement="top"
      enterDelay={500}
      enterNextDelay={500}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: '#12122a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            p: 0,
            maxWidth: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          },
        },
        arrow: { sx: { color: '#12122a' } },
        popper: {
          modifiers: [
            { name: 'flip', options: { fallbackPlacements: ['bottom', 'left', 'right'] } },
            { name: 'preventOverflow', options: { altAxis: true, padding: 8 } },
          ],
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <Box
          onClick={disabled ? undefined : onClick}
          sx={{
            width: size,
            height: h,
            borderRadius: 2,
            overflow: 'hidden',
            cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
            border: '2px solid',
            borderColor: selected ? 'primary.main' : 'transparent',
            opacity: disabled ? 0.4 : 1,
            position: 'relative',
            transition: 'all 0.15s ease',
            '&:hover':
              onClick && !disabled
                ? { borderColor: 'primary.light', transform: 'scale(1.05)' }
                : {},
          }}
        >
          {iconSrc ? (
            <Box
              component="img"
              src={imageUrl(iconSrc)}
              alt={l.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  `https://placehold.co/${size}x${h}/1a1a2e/d4a017?text=${encodeURIComponent(l.name[0])}`
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#1a1a2e',
              }}
            >
              <Typography
                sx={{
                  fontSize: Math.round(size * 0.4),
                  fontWeight: 700,
                  color: '#d4a017',
                  lineHeight: 1,
                }}
              >
                {l.name[0]}
              </Typography>
            </Box>
          )}
          {selected && (
            <Box
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: 10, color: 'black', fontWeight: 700 }}>✓</Typography>
            </Box>
          )}
        </Box>
        {showName && (
          <Typography
            sx={{
              fontSize: '0.68rem',
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: size + 8,
              wordBreak: 'break-word',
            }}
          >
            {l.name}
          </Typography>
        )}
      </Box>
    </Tooltip>
  )
}
